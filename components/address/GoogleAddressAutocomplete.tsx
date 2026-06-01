'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { buildStreetOptionValue, type StreetOption } from '@/lib/addresses';
import { parseGoogleAddress, type ParsedGoogleAddress } from '@/lib/googleAddress';

type GoogleAddressAutocompleteProps = {
  value: string;
  placeholder: string;
  className: string;
  leadingIcon?: ReactNode;
  savedLocations?: SavedLocation[];
  onChange: (value: string) => void;
  onSelect: (address: ParsedGoogleAddress) => void;
  onSavedLocationSelect?: (location: SavedLocation) => void;
  onBlur?: () => void;
  onFocus?: () => void;
};

export type SavedLocation = {
  id: string;
  label: string;
};

type PlacePrediction = {
  placeId: string;
  placeResourceName?: string;
  text?: { text?: string; toString?: () => string };
  mainText?: { text?: string; toString?: () => string };
  secondaryText?: { text?: string; toString?: () => string };
  zip?: string;
  city?: string;
};

type AddressSuggestion =
  | {
      kind: 'street';
      key: string;
      option: StreetOption;
    }
  | {
      kind: 'place';
      key: string;
      prediction: PlacePrediction;
    };

const GOOGLE_PLACES_COUNTRIES = ['at', 'sk', 'hu', 'si'];
const GOOGLE_ADDRESS_TYPES = ['street_address', 'premise', 'subpremise'];
const DEBUG_PREFIX = '[GoogleAddressAutocomplete]';
const PLACES_AUTOCOMPLETE_ENDPOINT = 'https://places.googleapis.com/v1/places:autocomplete';

function debugError(message: string, error?: unknown) {
  console.error(DEBUG_PREFIX, message, error);
}

function getPredictionText(value?: { text?: string; toString?: () => string }) {
  if (!value) return '';
  return value.text || value.toString?.() || '';
}

function stripCountryFromAddress(value: string) {
  return value
    .replace(/,\s*(Austria|Slovakia|Hungary|Slovenia)$/iu, '')
    .replace(/,\s*(\u00d6sterreich|Slowakei|Ungarn|Slowenien)$/iu, '')
    .trim();
}

function formatDisplayCity(city: string) {
  return city
    .trim()
    .split(/(\s+|-)/u)
    .map((part) => (/^\s+$|^-$/u.test(part) || !part ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join('');
}

function normalizeComparableAddress(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function isStructuredAddressValue(value: string) {
  return /,\s*\d{4,5}\s+\S+/u.test(value.trim());
}

function formatControlValue(value: string) {
  return value;
}

function getAddressInputValue(address: ParsedGoogleAddress) {
  if (address.street && !address.houseNumber) return address.street;

  const streetLine = [address.street, address.houseNumber].filter(Boolean).join(' ').trim();
  const cityLine = [address.zip, formatDisplayCity(address.city)].filter(Boolean).join(' ').trim();
  const structuredValue = [streetLine, cityLine].filter(Boolean).join(', ');

  return structuredValue || stripCountryFromAddress(address.formattedAddress);
}

function createRestSessionToken() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mapRestPrediction(suggestion: any): PlacePrediction | null {
  const prediction = suggestion?.placePrediction;
  if (!prediction?.placeId) return null;

  return {
    placeId: prediction.placeId,
    placeResourceName: prediction.place || `places/${prediction.placeId}`,
    text: prediction.text,
    mainText: prediction.structuredFormat?.mainText,
    secondaryText: prediction.structuredFormat?.secondaryText,
  };
}

async function fetchRestAutocompleteSuggestions(
  apiKey: string,
  input: string,
  sessionToken: string | null,
  useAddressTypeFilter = true,
) {
  const requestBody: Record<string, unknown> = {
    input,
    includedRegionCodes: GOOGLE_PLACES_COUNTRIES,
    languageCode: 'de',
    regionCode: 'AT',
    sessionToken,
  };

  if (useAddressTypeFilter) {
    requestBody.includedPrimaryTypes = GOOGLE_ADDRESS_TYPES;
  }

  const response = await fetch(PLACES_AUTOCOMPLETE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'suggestions.placePrediction.placeId',
        'suggestions.placePrediction.place',
        'suggestions.placePrediction.text',
        'suggestions.placePrediction.structuredFormat',
      ].join(','),
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Places REST autocomplete failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return (data.suggestions || []).map(mapRestPrediction).filter(Boolean);
}

async function fetchRestPlaceDetails(apiKey: string, prediction: PlacePrediction, sessionToken: string | null) {
  const resourceName = prediction.placeResourceName || `places/${prediction.placeId}`;
  const url = new URL(`https://places.googleapis.com/v1/${resourceName}`);
  url.searchParams.set('languageCode', 'de');
  if (sessionToken) url.searchParams.set('sessionToken', sessionToken);

  const response = await fetch(url.toString(), {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'id,formattedAddress,addressComponents,location',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Places REST details failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function addAddressDetailsToPredictions(
  apiKey: string,
  predictions: PlacePrediction[],
  sessionToken: string | null,
) {
  const visiblePredictions = predictions.slice(0, 5);

  const enrichedPredictions = await Promise.all(
    visiblePredictions.map(async (prediction) => {
      try {
        const placeJson = await fetchRestPlaceDetails(apiKey, prediction, sessionToken);
        const parsedAddress = parseGoogleAddress(placeJson);
        return {
          ...prediction,
          zip: parsedAddress.zip,
          city: parsedAddress.city,
        };
      } catch {
        return prediction;
      }
    }),
  );

  return [...enrichedPredictions, ...predictions.slice(visiblePredictions.length)];
}

async function fetchStreetSuggestions(input: string) {
  const params = new URLSearchParams({
    q: input,
    limit: '8',
  });
  const response = await fetch(`/api/streets/search?${params.toString()}`);
  const payload = (await response.json()) as { results?: StreetOption[] };

  if (!response.ok) {
    throw new Error('Street search request failed.');
  }

  return payload.results || [];
}

function mapStreetToAddress(option: StreetOption): ParsedGoogleAddress {
  return {
    formattedAddress: buildStreetOptionValue(option.street, option.zip, formatDisplayCity(option.city)),
    street: option.street,
    houseNumber: '',
    zip: option.zip,
    city: option.city,
    country: 'AT',
    lat: null,
    lng: null,
    placeId: option.id || '',
  };
}

function buildOrderedSuggestions(streetResults: StreetOption[], placePredictions: PlacePrediction[]) {
  const suggestions: AddressSuggestion[] = [];
  const seenStreetKeys = new Set<string>();
  const seenPlaceIds = new Set<string>();

  prioritizeViennaStreets(streetResults).forEach((option) => {
    const key = `${option.zip || ''}::${option.city || ''}::${option.street || ''}`.toLocaleLowerCase('de-AT');
    if (seenStreetKeys.has(key)) return;
    seenStreetKeys.add(key);
    suggestions.push({
      kind: 'street',
      key: `street-${key}`,
      option,
    });
  });

  placePredictions.forEach((prediction) => {
    if (!prediction.placeId || seenPlaceIds.has(prediction.placeId)) return;
    seenPlaceIds.add(prediction.placeId);
    suggestions.push({
      kind: 'place',
      key: `place-${prediction.placeId}`,
      prediction,
    });
  });

  return suggestions;
}

function hasHouseNumberQuery(value: string) {
  return /[^\d\s,]+\s+\d+[A-Za-z]?(?:[/-]\d+[A-Za-z]?)?\b/u.test(value.trim());
}

function prioritizeViennaStreets(streetResults: StreetOption[]) {
  return [...streetResults].sort((left, right) => {
    const leftVienna = left.city.trim().toLocaleLowerCase('de-AT') === 'wien' ? 0 : 1;
    const rightVienna = right.city.trim().toLocaleLowerCase('de-AT') === 'wien' ? 0 : 1;

    if (leftVienna !== rightVienna) {
      return leftVienna - rightVienna;
    }

    return buildStreetOptionValue(left.street, left.zip, left.city).localeCompare(
      buildStreetOptionValue(right.street, right.zip, right.city),
      'de-AT',
    );
  });
}

export default function GoogleAddressAutocomplete({
  value,
  placeholder,
  className,
  leadingIcon,
  savedLocations = [],
  onChange,
  onSelect,
  onSavedLocationSelect,
  onBlur,
  onFocus,
}: GoogleAddressAutocompleteProps) {
  const inputId = useId();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);
  const selectedValueRef = useRef('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [pendingHouseNumberAddress, setPendingHouseNumberAddress] = useState<ParsedGoogleAddress | null>(null);
  const [houseNumberValue, setHouseNumberValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasLeadingIcon = Boolean(leadingIcon);
  const trimmedValue = value.trim();
  const displayLines = formatControlValue(value).replace(/,\s*(\d{4,5}\s+\S.*)$/u, '\n$1').split('\n');
  const isCompletedSelectedValue =
    isStructuredAddressValue(value) ||
    (selectedValueRef.current &&
      normalizeComparableAddress(value) === normalizeComparableAddress(selectedValueRef.current));
  const editStreetLineValue = isCompletedSelectedValue && displayLines.length > 1 ? displayLines[0] : value;
  const displayedValue = formatControlValue(isFocused ? editStreetLineValue : value);
  const showMobileAddressDisplay = !isFocused && isCompletedSelectedValue && displayLines.length === 2;
  const hasSavedLocations = savedLocations.length > 0;

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (isStructuredAddressValue(value)) {
      selectedValueRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (!apiKey) {
      debugError('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in browser bundle.');
      setLoadError('Google address search is not configured.');
      return;
    }

    setIsConfigured(true);
    setSessionToken(createRestSessionToken());
  }, [apiKey]);

  useEffect(() => {
    if (!isConfigured || trimmedValue.length < 3 || isCompletedSelectedValue) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    let isActive = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const [streetResult, placeResult] = await Promise.allSettled([
          fetchStreetSuggestions(trimmedValue),
          fetchRestAutocompleteSuggestions(apiKey, trimmedValue, sessionToken, false),
        ]);

        if (!isActive) return;

        const streetResults =
          streetResult.status === 'fulfilled' && !hasHouseNumberQuery(trimmedValue) ? streetResult.value : [];
        const placePredictions =
          placeResult.status === 'fulfilled'
            ? await addAddressDetailsToPredictions(apiKey, placeResult.value, sessionToken)
            : [];

        if (!isActive) return;

        const nextSuggestions = buildOrderedSuggestions(streetResults, placePredictions);

        setSuggestions(nextSuggestions);
        setIsOpen(true);
        setActiveIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (error) {
        debugError('Autocomplete suggestions request failed.', error);
        if (isActive) {
          setSuggestions([]);
          setIsOpen(true);
          setActiveIndex(-1);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [apiKey, isCompletedSelectedValue, isConfigured, sessionToken, trimmedValue]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const selectPrediction = async (prediction: PlacePrediction) => {
    setLoading(true);
    try {
      const placeJson = await fetchRestPlaceDetails(apiKey, prediction, sessionToken);
      const parsedAddress = parseGoogleAddress(placeJson);
      selectedValueRef.current = getAddressInputValue(parsedAddress);
      onSelectRef.current(parsedAddress);
      setSuggestions([]);
      setPendingHouseNumberAddress(parsedAddress.street && !parsedAddress.houseNumber ? parsedAddress : null);
      setHouseNumberValue('');
      setIsOpen(!parsedAddress.houseNumber && Boolean(parsedAddress.street));
      setActiveIndex(-1);
      setSessionToken(createRestSessionToken());
    } catch (error) {
      debugError('Place details fetch failed.', error);
    } finally {
      setLoading(false);
    }
  };

  const selectStreetSuggestion = (option: StreetOption) => {
    const parsedAddress = mapStreetToAddress(option);
    selectedValueRef.current = getAddressInputValue(parsedAddress);
    onSelectRef.current(parsedAddress);
    setSuggestions([]);
    setPendingHouseNumberAddress(parsedAddress);
    setHouseNumberValue('');
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    if (suggestion.kind === 'street') {
      selectStreetSuggestion(suggestion.option);
      return;
    }

    void selectPrediction(suggestion.prediction);
  };

  const selectSavedLocation = (location: SavedLocation) => {
    selectedValueRef.current = location.label;
    setPendingHouseNumberAddress(null);
    setHouseNumberValue('');
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onSavedLocationSelect?.(location);
  };

  const submitHouseNumber = async () => {
    const baseAddress = pendingHouseNumberAddress;
    const houseNumber = houseNumberValue.trim();
    if (!baseAddress || !houseNumber) return;

    const query = [baseAddress.street, houseNumber, baseAddress.zip, baseAddress.city]
      .filter(Boolean)
      .join(' ');

    setLoading(true);
    try {
      const matches = await fetchRestAutocompleteSuggestions(apiKey, query, sessionToken, true);
      const prediction = matches[0];
      if (prediction) {
        const placeJson = await fetchRestPlaceDetails(apiKey, prediction, sessionToken);
        const parsedAddress = parseGoogleAddress(placeJson);
        const completedAddress = {
          ...parsedAddress,
          houseNumber: parsedAddress.houseNumber || houseNumber,
          street: parsedAddress.street || baseAddress.street,
          city: parsedAddress.city || baseAddress.city,
          zip: parsedAddress.zip || baseAddress.zip,
          country: parsedAddress.country || baseAddress.country,
          formattedAddress:
            parsedAddress.formattedAddress ||
            [
              [baseAddress.street, houseNumber].filter(Boolean).join(' '),
              [baseAddress.zip, formatDisplayCity(baseAddress.city)].filter(Boolean).join(' '),
            ]
              .filter(Boolean)
              .join(', '),
        };
        selectedValueRef.current = getAddressInputValue(completedAddress);
        onSelectRef.current(completedAddress);
      } else {
        const completedAddress = {
          ...baseAddress,
          houseNumber,
          formattedAddress: [
            [baseAddress.street, houseNumber].filter(Boolean).join(' '),
            [baseAddress.zip, formatDisplayCity(baseAddress.city)].filter(Boolean).join(' '),
          ]
            .filter(Boolean)
            .join(', '),
        };
        selectedValueRef.current = getAddressInputValue(completedAddress);
        onSelectRef.current(completedAddress);
      }

      setPendingHouseNumberAddress(null);
      setHouseNumberValue('');
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      setSessionToken(createRestSessionToken());
    } catch (error) {
      debugError('House number address lookup failed.', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {leadingIcon ? (
        <label htmlFor={inputId} className="pointer-events-none absolute left-3 top-1/2 z-10 inline-flex -translate-y-1/2 text-[#1679FF]">
          {leadingIcon}
        </label>
      ) : null}
      <input
        id={inputId}
        type="text"
        value={displayedValue}
        onChange={(event) => {
          onChange(event.target.value);
          setPendingHouseNumberAddress(null);
          setHouseNumberValue('');
          setIsOpen(event.target.value.trim().length >= 3);
        }}
        onBlur={onBlur}
        onFocus={() => {
          setIsFocused(true);
          if (!isCompletedSelectedValue && (trimmedValue.length >= 3 || hasSavedLocations || pendingHouseNumberAddress)) {
            setIsOpen(true);
          }
          onFocus?.();
        }}
        onBlurCapture={() => {
          setIsFocused(false);
        }}
        onKeyDown={(event) => {
          if (!isOpen || !suggestions.length) return;
          if (event.key === 'ArrowDown') {
            setActiveIndex((prev) => (prev + 1) % suggestions.length);
            event.preventDefault();
          } else if (event.key === 'ArrowUp') {
            setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
            event.preventDefault();
          } else if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            selectSuggestion(suggestions[activeIndex]);
          } else if (event.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
          }
        }}
        placeholder={placeholder}
        autoComplete="street-address"
        inputMode="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        className={`${className} ${showMobileAddressDisplay ? 'text-transparent caret-transparent md:text-[#111111] md:caret-[#111111]' : ''} ${hasLeadingIcon ? 'ui-input-with-leading-icon' : ''}`}
      />
      {showMobileAddressDisplay ? (
        <div className={`pointer-events-none absolute inset-y-0 left-0 right-0 flex flex-col justify-center pr-2 md:hidden ${hasLeadingIcon ? 'pl-10' : 'pl-0'}`}>
          <span className="w-full truncate text-left text-[17px] font-medium leading-[1.12] tracking-[-0.02em] text-[#111111]">
            {displayLines[0]}
          </span>
          <span className="mt-0.5 w-full truncate text-left text-[13px] font-medium leading-[1.05] tracking-[-0.01em] text-[#4b5563]">
            {displayLines[1]}
          </span>
        </div>
      ) : null}
      {loadError ? (
        <p className="mt-1.5 text-[0.78rem] font-medium text-[#d70015]">{loadError}</p>
      ) : null}
      {isOpen && !loadError ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-30 max-h-[18rem] overflow-y-auto overscroll-contain rounded-[18px] border border-[#dbe7f8] bg-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]"
        >
          {pendingHouseNumberAddress ? (
            <div className="border-b border-[#edf2f7] px-4 py-3">
              <div className="text-[0.84rem] font-semibold text-[#111111]">Enter house number</div>
              <div className="mt-1 text-[0.78rem] text-[#6a7d96]">{pendingHouseNumberAddress.street}</div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={houseNumberValue}
                  onChange={(event) => setHouseNumberValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void submitHouseNumber();
                    }
                  }}
                  placeholder="House number"
                  className="min-w-0 flex-1 rounded-[12px] border border-[#c8d3e0] px-3 py-2 text-[0.92rem] font-medium text-[#111111] outline-none focus:border-[#1679FF]"
                />
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void submitHouseNumber()}
                  className="rounded-[12px] bg-[#1679FF] px-3 py-2 text-[0.84rem] font-semibold text-white"
                >
                  Add
                </button>
              </div>
            </div>
          ) : null}
          {loading ? (
            <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">Searching...</div>
          ) : suggestions.length === 0 ? (
            trimmedValue.length >= 3 && !pendingHouseNumberAddress && !hasSavedLocations ? (
              <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">No address found.</div>
            ) : null
          ) : (
            suggestions.map((suggestion, index) => {
              const isActive = index === activeIndex;
              const isStreet = suggestion.kind === 'street';
              const label = isStreet
                ? buildStreetOptionValue(
                    suggestion.option.street,
                    suggestion.option.zip,
                    formatDisplayCity(suggestion.option.city),
                  )
                : getPredictionText(suggestion.prediction.text);
              const cityLine = !isStreet
                ? [suggestion.prediction.zip, suggestion.prediction.city ? formatDisplayCity(suggestion.prediction.city) : '']
                    .filter(Boolean)
                    .join(' ')
                    .trim()
                : '';
              const secondary = isStreet ? 'Street' : cityLine || getPredictionText(suggestion.prediction.secondaryText) || 'Place';
              return (
                <button
                  key={suggestion.key}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`flex w-full flex-col items-start px-4 py-3 text-left transition-colors ${
                    isActive ? 'bg-[#f8fbff]' : 'hover:bg-[#f8fbff]'
                  } ${index > 0 ? 'border-t border-[#edf2f7]' : ''}`}
                >
                  <span className="min-w-0 truncate text-[0.95rem] font-medium text-[#111111]">{label}</span>
                  {secondary ? (
                    <span className="mt-0.5 min-w-0 truncate text-[0.78rem] text-[#6a7d96]">{secondary}</span>
                  ) : null}
                </button>
              );
            })
          )}
          {hasSavedLocations ? (
            <div className="border-t border-[#edf2f7] py-1.5">
              <div className="px-4 pb-1 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#6a7d96]">
                Saved locations
              </div>
              {savedLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  role="option"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSavedLocation(location)}
                  className="flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors hover:bg-[#f8fbff]"
                >
                  <span className="min-w-0 truncate text-[0.95rem] font-semibold text-[#111111]">{location.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
