'use client';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { StreetOption } from '@/lib/addresses';
import { buildStreetOptionValue } from '@/lib/addresses';

type StreetAutocompleteMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
};

type StreetAutocompleteProps = {
  value: string;
  selectedOption?: StreetOption | null;
  zipHint?: string;
  placeholder: string;
  className: string;
  mobileDropdownFullWidth?: boolean;
  mobileSelectedStreetOnly?: boolean;
  menuItems?: StreetAutocompleteMenuItem[];
  onChange: (value: string) => void;
  onSelect: (option: StreetOption) => void;
  onPasteText?: (text: string) => void | Promise<void>;
  onBlur?: () => void;
  onFocus?: () => void;
};

export default function StreetAutocomplete({
  value,
  selectedOption = null,
  zipHint = '',
  placeholder,
  className,
  mobileDropdownFullWidth = false,
  mobileSelectedStreetOnly = false,
  menuItems = [],
  onChange,
  onSelect,
  onPasteText,
  onBlur,
  onFocus,
}: StreetAutocompleteProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [results, setResults] = useState<StreetOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const trimmedValue = value.trim();
  const isZipOnlyQuery = /^\d{2,4}$/.test(trimmedValue.replace(/\s+/g, ''));
  const pageSize = isZipOnlyQuery ? 50 : 8;
  const hasMenuItems = menuItems.length > 0;
  const normalizedSelectedStreet = selectedOption?.street.trim().replace(/\s+/g, ' ') || '';
  const normalizedInputValue = value.trim().replace(/\s+/g, ' ');
  const normalizedSelectedLabel = selectedOption
    ? buildStreetOptionValue(selectedOption.street, selectedOption.zip, selectedOption.city)
        .trim()
        .replace(/\s+/g, ' ')
    : '';
  const selectedStreetSuffix =
    normalizedSelectedStreet &&
    normalizedInputValue.toLowerCase().startsWith(normalizedSelectedStreet.toLowerCase())
      ? normalizedInputValue.slice(normalizedSelectedStreet.length).trim()
      : '';
  const matchesSelectedStreetPrefix =
    Boolean(selectedOption) &&
    normalizedSelectedStreet.length > 0 &&
    normalizedInputValue.toLowerCase().startsWith(normalizedSelectedStreet.toLowerCase());
  const hasLockedHouseNumberSuffix = /^\d[\dA-Za-z\s,/-]*$/u.test(selectedStreetSuffix);
  const matchesSelectedValue =
    Boolean(selectedOption) &&
    (normalizedInputValue.toLowerCase() === normalizedSelectedStreet.toLowerCase() ||
      normalizedInputValue.toLowerCase() === normalizedSelectedLabel.toLowerCase() ||
      hasLockedHouseNumberSuffix);
  const selectedStreetLine = [selectedOption?.street || '', selectedStreetSuffix].filter(Boolean).join(' ').trim();
  const desktopBlurValue =
    selectedOption && !isFocused
      ? buildStreetOptionValue(selectedStreetLine || selectedOption.street, selectedOption.zip, selectedOption.city)
      : value;
  const showMobileSelectedStreetOnly =
    isMobileViewport &&
    mobileSelectedStreetOnly &&
    selectedOption &&
    (value.trim() === buildStreetOptionValue(selectedOption.street, selectedOption.zip, selectedOption.city) ||
      value.trim() === selectedOption.street.trim() ||
      hasLockedHouseNumberSuffix);
  const showMobileSelectedSummary = showMobileSelectedStreetOnly && !isFocused;
  const mobileSelectedInputClasses = showMobileSelectedStreetOnly
    ? '!h-[3.15rem] !px-[0.25rem] !py-[0.45rem] text-[1rem] leading-tight md:!h-auto md:!px-3 md:!py-[0.55rem] md:text-inherit md:leading-normal'
    : '';
  const mobileDisplayValue = showMobileSelectedSummary
    ? normalizedInputValue || selectedOption.street
    : value || selectedOption?.street || '';
  const displayValue = showMobileSelectedStreetOnly ? mobileDisplayValue : desktopBlurValue;

  const selectOption = (option: StreetOption) => {
    onSelect(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  useEffect(() => {
    setOffset(0);
    setHasMore(false);
  }, [trimmedValue, zipHint, isZipOnlyQuery]);

  useEffect(() => {
    if (!isOpen || trimmedValue.length < 2) {
      setResults([]);
      setLoading(false);
      setLoadingMore(false);
      setActiveIndex(-1);
      setHasMore(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const params = new URLSearchParams({
          q: trimmedValue,
          limit: String(pageSize),
          offset: String(offset),
        });
        if (zipHint) params.set('zip', zipHint);
        const response = await fetch(`/api/streets/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const payloadText = await response.text();
        const payload = payloadText ? (JSON.parse(payloadText) as { results?: StreetOption[] }) : {};
        if (!response.ok) {
          throw new Error('Street search request failed.');
        }
        const nextResults = payload.results || [];
        setResults((prev) => {
          if (offset === 0) {
            return nextResults;
          }

          const seen = new Set(prev.map((item) => `${item.zip}-${item.city}-${item.street}`));
          return [...prev, ...nextResults.filter((item) => !seen.has(`${item.zip}-${item.city}-${item.street}`))];
        });
        setHasMore(nextResults.length === pageSize);
        if (offset === 0) {
          setActiveIndex(-1);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          if (offset === 0) {
            setResults([]);
            setActiveIndex(-1);
          }
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isOpen, isZipOnlyQuery, offset, pageSize, trimmedValue, zipHint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setIsOpen(false);
        setActiveIndex(-1);
        setIsFocused(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={mobileDropdownFullWidth ? 'static md:relative' : 'relative'}
    >
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            const normalizedNextValue = nextValue.trim().replace(/\s+/g, ' ');
            const nextSuffix =
              normalizedSelectedStreet &&
              normalizedNextValue.toLowerCase().startsWith(normalizedSelectedStreet.toLowerCase())
                ? normalizedNextValue.slice(normalizedSelectedStreet.length).trim()
                : '';
            const shouldLockSearch = /^\d[\dA-Za-z\s,/-]*$/u.test(nextSuffix);

            onChange(nextValue);
            if (!shouldLockSearch && normalizedNextValue.length >= 2) {
              setLoading(true);
            }
            setIsOpen(!shouldLockSearch);
            setActiveIndex(-1);
            setOffset(0);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (matchesSelectedValue || hasLockedHouseNumberSuffix || matchesSelectedStreetPrefix) {
              setIsOpen(false);
              setActiveIndex(-1);
              setOffset(0);
            } else if (trimmedValue.length >= 2) {
              setLoading(true);
              setIsOpen(true);
              setActiveIndex(-1);
              setOffset(0);
            }
            onFocus?.();
          }}
          onPaste={(event) => {
            if (!onPasteText) return;
            const text = event.clipboardData.getData('text');
            event.preventDefault();
            void onPasteText(text);
          }}
          onKeyDown={(event) => {
            if (!isOpen && event.key === 'ArrowDown' && trimmedValue.length >= 2 && !hasLockedHouseNumberSuffix) {
              setIsOpen(true);
              setActiveIndex(results.length > 0 ? 0 : -1);
              setOffset(0);
              event.preventDefault();
              return;
            }

            if (!isOpen || !results.length) {
              if (event.key === 'Escape') {
                setIsOpen(false);
                setActiveIndex(-1);
              }
              return;
            }

            if (event.key === 'ArrowDown') {
              setActiveIndex((prev) => (prev + 1) % results.length);
              event.preventDefault();
              return;
            }

            if (event.key === 'ArrowUp') {
              setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
              event.preventDefault();
              return;
            }

            if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < results.length) {
              selectOption(results[activeIndex]);
              event.preventDefault();
              return;
            }

            if (event.key === 'Escape') {
              setIsOpen(false);
              setActiveIndex(-1);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          autoComplete="street-address"
          inputMode="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={
            isOpen && activeIndex >= 0 && activeIndex < results.length
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          className={`${className} ${mobileSelectedInputClasses} ${
            showMobileSelectedSummary
              ? 'text-transparent caret-transparent md:text-inherit md:caret-auto'
              : ''
          }`}
        />

        {showMobileSelectedSummary ? (
          <div className="pointer-events-none absolute inset-x-0 inset-y-0 flex flex-col justify-center px-4 md:hidden">
            <span className="truncate text-[18px] font-semibold tracking-[-0.03em] leading-tight text-[#111111]">
              {displayValue}
            </span>
            <span className="mt-0.5 truncate text-[0.92rem] leading-tight text-[#6a7d96]">
              {selectedOption.zip} {selectedOption.city}
            </span>
          </div>
        ) : null}
      </div>

      {(isOpen || (isFocused && !hasLockedHouseNumberSuffix && !matchesSelectedValue && !matchesSelectedStreetPrefix)) &&
      (hasMenuItems || loading || trimmedValue.length >= 2) ? (
        <div
          id={listboxId}
          role="listbox"
          ref={listRef}
          onScroll={(event) => {
            if (!hasMore || loadingMore || loading) return;
            const target = event.currentTarget;
            const threshold = 32;
            if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
              setOffset((prev) => prev + pageSize);
            }
          }}
          className={`absolute top-[calc(100%+0.55rem)] z-30 max-h-[18rem] overflow-y-auto overscroll-contain rounded-[18px] border border-[#dbe7f8] bg-white shadow-[0_18px_40px_rgba(17,17,17,0.12)] ${
            mobileDropdownFullWidth ? 'left-0 right-0 md:left-0 md:right-0' : 'left-0 right-0'
          }`}
        >
          {hasMenuItems
            ? menuItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    item.onSelect();
                    setIsOpen(false);
                    setActiveIndex(-1);
                    setIsFocused(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8fbff] ${
                    index > 0 ? 'border-t border-[#edf2f7]' : ''
                  }`}
                >
                  {item.icon ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1679ff]">
                      {item.icon}
                    </span>
                  ) : null}
                  <span className="min-w-0 truncate text-[0.95rem] font-medium text-[#111111]">
                    {item.label}
                  </span>
                </button>
              ))
            : null}
          {hasMenuItems && (loading || results.length > 0 || (trimmedValue.length >= 2 && !loading)) ? (
            <div className="border-t border-[#edf2f7]" />
          ) : null}
          {loading ? (
            <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">Suche...</div>
          ) : !results.length ? (
            trimmedValue.length >= 2 ? (
              <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">
                Keine passenden Strassen gefunden.
              </div>
            ) : null
          ) : (
            results.map((option, index) => {
              const key = `${option.zip}-${option.street}-${option.city}`;
              const isActive = index === activeIndex;
              return (
                <button
                  key={key}
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    selectOption(option);
                  }}
                  className={`flex w-full flex-col items-start px-4 py-3 text-left transition-colors ${
                    isActive ? 'bg-[#f8fbff]' : 'hover:bg-[#f8fbff]'
                  } ${
                    index > 0 ? 'border-t border-[#edf2f7]' : ''
                  }`}
                >
                  <span className="min-w-0 truncate text-[0.95rem] font-medium text-[#111111]">
                    {buildStreetOptionValue(option.street, option.zip, option.city)}
                  </span>
                </button>
              );
            })
          )}
          {loadingMore ? (
            <div className="border-t border-[#edf2f7] px-4 py-3 text-[0.92rem] text-[#6a7d96]">
              Mehr Ergebnisse werden geladen...
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
