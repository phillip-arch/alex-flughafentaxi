'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { parseGoogleAddress, type ParsedGoogleAddress } from '@/lib/googleAddress';

type GoogleAddressAutocompleteProps = {
  value: string;
  placeholder: string;
  className: string;
  leadingIcon?: ReactNode;
  onChange: (value: string) => void;
  onSelect: (address: ParsedGoogleAddress) => void;
  onBlur?: () => void;
  onFocus?: () => void;
};

type PlacePrediction = {
  placeId: string;
  placeResourceName?: string;
  text?: { text?: string; toString?: () => string };
  mainText?: { text?: string; toString?: () => string };
  secondaryText?: { text?: string; toString?: () => string };
};

const GOOGLE_PLACES_COUNTRIES = ['at', 'sk', 'hu', 'si'];
const GOOGLE_ADDRESS_TYPES = ['street_address', 'premise', 'subpremise'];
const VIENNA_LOCATION_BIAS = {
  circle: {
    center: {
      latitude: 48.2082,
      longitude: 16.3738,
    },
    radius: 85000,
  },
};
const DEBUG_PREFIX = '[GoogleAddressAutocomplete]';
const PLACES_AUTOCOMPLETE_ENDPOINT = 'https://places.googleapis.com/v1/places:autocomplete';

function debugError(message: string, error?: unknown) {
  console.error(DEBUG_PREFIX, message, error);
}

function getPredictionText(value?: { text?: string; toString?: () => string }) {
  if (!value) return '';
  return value.text || value.toString?.() || '';
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
    locationBias: VIENNA_LOCATION_BIAS,
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

export default function GoogleAddressAutocomplete({
  value,
  placeholder,
  className,
  leadingIcon,
  onChange,
  onSelect,
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
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasLeadingIcon = Boolean(leadingIcon);
  const trimmedValue = value.trim();

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
    if (!isConfigured || trimmedValue.length < 3 || trimmedValue === selectedValueRef.current) {
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
        const broadPredictions = await fetchRestAutocompleteSuggestions(apiKey, trimmedValue, sessionToken, false);
        const addressPredictions = await fetchRestAutocompleteSuggestions(apiKey, trimmedValue, sessionToken, true);
        const nextPredictions = [...addressPredictions, ...broadPredictions].filter(
          (prediction, index, list) => list.findIndex((item) => item.placeId === prediction.placeId) === index,
        );

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
  }, [apiKey, isConfigured, sessionToken, trimmedValue]);

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
      selectedValueRef.current = parsedAddress.formattedAddress;
      onSelectRef.current(parsedAddress);
      setPredictions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      setSessionToken(createRestSessionToken());
    } catch (error) {
      debugError('Place details fetch failed.', error);
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
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(event.target.value.trim().length >= 3);
        }}
        onBlur={onBlur}
        onFocus={() => {
          if (trimmedValue.length >= 3) setIsOpen(true);
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
        className={`${className} ${hasLeadingIcon ? 'ui-input-with-leading-icon' : ''}`}
      />
      {loadError ? (
        <p className="mt-1.5 text-[0.78rem] font-medium text-[#d70015]">{loadError}</p>
      ) : null}
      {isOpen && !loadError ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-30 max-h-[18rem] overflow-y-auto overscroll-contain rounded-[18px] border border-[#dbe7f8] bg-white shadow-[0_18px_40px_rgba(17,17,17,0.12)]"
        >
          {loading ? (
            <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">Searching...</div>
          ) : predictions.length === 0 ? (
            trimmedValue.length >= 3 ? (
              <div className="px-4 py-3 text-[0.92rem] text-[#6a7d96]">No address found.</div>
            ) : null
          ) : (
            predictions.map((prediction, index) => {
              const label = getPredictionText(prediction.text);
              const secondary = getPredictionText(prediction.secondaryText);
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
