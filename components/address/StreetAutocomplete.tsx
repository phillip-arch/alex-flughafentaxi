'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { StreetOption } from '@/lib/addresses';
import { buildStreetOptionValue } from '@/lib/addresses';

type StreetAutocompleteProps = {
  value: string;
  zipHint?: string;
  placeholder: string;
  className: string;
  onChange: (value: string) => void;
  onSelect: (option: StreetOption) => void;
  onBlur?: () => void;
  onFocus?: () => void;
};

export default function StreetAutocomplete({
  value,
  zipHint = '',
  placeholder,
  className,
  onChange,
  onSelect,
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
  const trimmedValue = value.trim();
  const isZipOnlyQuery = /^\d{2,4}$/.test(trimmedValue.replace(/\s+/g, ''));
  const pageSize = isZipOnlyQuery ? 50 : 8;

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
        const payload = (await response.json()) as { results?: StreetOption[] };
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
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
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
    <div ref={rootRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
          setOffset(0);
        }}
        onFocus={() => {
          onFocus?.();
        }}
      onKeyDown={(event) => {
        if (!isOpen && event.key === 'ArrowDown' && trimmedValue.length >= 2) {
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
        onBlur?.();
      }}
      placeholder={placeholder}
      autoComplete="street-address"
      inputMode="text"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={isOpen}
      aria-controls={listboxId}
      aria-activedescendant={
        activeIndex >= 0 && activeIndex < results.length
          ? `${listboxId}-option-${activeIndex}`
          : undefined
      }
      className={className}
    />

      {isOpen && (loading || trimmedValue.length >= 2) ? (
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
          className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-30 max-h-[18rem] overflow-y-auto overscroll-contain rounded-[18px] border border-[#dbe7f8] bg-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]"
        >
          {loading ? (
            <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">Suche...</div>
          ) : !results.length ? (
            <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">
              Keine passenden Strassen gefunden.
            </div>
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
