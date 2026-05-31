'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
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
    languageCode: 'en',
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
  url.searchParams.set('languageCode', 'en');
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
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [pendingHouseNumberAddress, setPendingHouseNumberAddress] = useState<ParsedGoogleAddress | null>(null);
  const [houseNumberValue, setHouseNumberValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasLeadingIcon = Boolean(leadingIcon);
  const trimmedValue = value.trim();
  const displayedValue = formatControlValue(value);
  const displayLines = displayedValue.replace(/,\s*(\d{4,5}\s+\S.*)$/u, '\n$1').split('\n');
  const isCompletedSelectedValue =
    isStructuredAddressValue(value) ||
    (selectedValueRef.current &&
      normalizeComparableAddress(value) === normalizeComparableAddress(selectedValueRef.current));
  const showMobileAddressDisplay = isCompletedSelectedValue && displayLines.length === 2;
  const hasSavedLocations = savedLocations.length > 0;

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

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
      setPredictions([]);
      setIsOpen(false);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    let isActive = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        let nextPredictions = await fetchRestAutocompleteSuggestions(apiKey, trimmedValue, sessionToken, true);

        if (nextPredictions.length === 0) {
          nextPredictions = await fetchRestAutocompleteSuggestions(apiKey, trimmedValue, sessionToken, false);
        }

        if (!isActive) return;

        nextPredictions = await addAddressDetailsToPredictions(apiKey, nextPredictions, sessionToken);

        if (!isActive) return;

        setPredictions(nextPredictions);
        setIsOpen(true);
        setActiveIndex(nextPredictions.length > 0 ? 0 : -1);
      } catch (error) {
        debugError('Autocomplete suggestions request failed.', error);
        if (isActive) {
          setPredictions([]);
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
      setPredictions([]);
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

  const selectSavedLocation = (location: SavedLocation) => {
    selectedValueRef.current = location.label;
    setPendingHouseNumberAddress(null);
    setHouseNumberValue('');
    setPredictions([]);
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
      setPredictions([]);
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
          if (!isCompletedSelectedValue && (trimmedValue.length >= 3 || hasSavedLocations || pendingHouseNumberAddress)) {
            setIsOpen(true);
          }
          onFocus?.();
        }}
        onKeyDown={(event) => {
          if (!isOpen || !predictions.length) return;
          if (event.key === 'ArrowDown') {
            setActiveIndex((prev) => (prev + 1) % predictions.length);
            event.preventDefault();
          } else if (event.key === 'ArrowUp') {
            setActiveIndex((prev) => (prev <= 0 ? predictions.length - 1 : prev - 1));
            event.preventDefault();
          } else if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            void selectPrediction(predictions[activeIndex]);
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
          {hasSavedLocations ? (
            <div className="border-b border-[#edf2f7] py-1.5">
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
          ) : predictions.length === 0 ? (
            trimmedValue.length >= 3 && !pendingHouseNumberAddress && !hasSavedLocations ? (
              <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">No address found.</div>
            ) : null
          ) : (
            predictions.map((prediction, index) => {
              const label = getPredictionText(prediction.text);
              const cityLine = [prediction.zip, prediction.city ? formatDisplayCity(prediction.city) : '']
                .filter(Boolean)
                .join(' ')
                .trim();
              const secondary = cityLine || getPredictionText(prediction.secondaryText);
              const isActive = index === activeIndex;
              return (
                <button
                  key={prediction.placeId}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void selectPrediction(prediction)}
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
        </div>
      ) : null}
    </div>
  );
}
