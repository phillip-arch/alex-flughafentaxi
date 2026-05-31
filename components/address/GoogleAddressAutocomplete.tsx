'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { parseGoogleAddress, type ParsedGoogleAddress } from '@/lib/googleAddress';

declare global {
  interface Window {
    google?: any;
    __googleMapsPlacesPromise?: Promise<void>;
  }
}

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
  text?: { text?: string; toString?: () => string };
  mainText?: { text?: string; toString?: () => string };
  secondaryText?: { text?: string; toString?: () => string };
  toPlace: () => any;
};

const GOOGLE_PLACES_COUNTRIES = ['at', 'sk', 'hu', 'si'];
const GOOGLE_ADDRESS_TYPES = ['street_address', 'premise', 'subpremise'];
const DEBUG_PREFIX = '[GoogleAddressAutocomplete]';

function debugLog(message: string, data?: unknown) {
  if (data === undefined) {
    console.info(DEBUG_PREFIX, message);
    return;
  }

  console.info(DEBUG_PREFIX, message, data);
}

function debugError(message: string, error?: unknown) {
  console.error(DEBUG_PREFIX, message, error);
}

function getPredictionText(value?: { text?: string; toString?: () => string }) {
  if (!value) return '';
  return value.text || value.toString?.() || '';
}

function loadGooglePlaces(apiKey: string) {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps?.importLibrary) {
    debugLog('Google Maps script already loaded; importLibrary is available.');
    return Promise.resolve();
  }
  if (window.__googleMapsPlacesPromise) {
    debugLog('Reusing existing Google Maps script load promise.');
    return window.__googleMapsPlacesPromise;
  }

  window.__googleMapsPlacesPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps-places="true"]');
    if (existingScript) {
      debugLog('Found existing Google Maps script tag.', { src: existingScript.src });
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      loading: 'async',
      v: 'weekly',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    debugLog('Injecting Google Maps script.', { src: script.src.replace(apiKey, '[redacted]') });
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsPlaces = 'true';
    script.addEventListener('load', () => {
      debugLog('Google Maps script loaded.');
      resolve();
    }, { once: true });
    script.addEventListener('error', (error) => {
      debugError('Google Maps script failed to load.', error);
      reject(new Error('Google Maps script failed to load.'));
    }, { once: true });
    document.head.appendChild(script);
  });

  return window.__googleMapsPlacesPromise;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [placesLib, setPlacesLib] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<any>(null);
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

    debugLog('Starting Google Places initialization.', {
      hasApiKey: Boolean(apiKey),
      keyPrefix: `${apiKey.slice(0, 6)}...`,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
    });

    let isActive = true;
    void loadGooglePlaces(apiKey)
      .then(async () => {
        debugLog('Importing Google Places library.');
        const lib = await window.google?.maps?.importLibrary?.('places');
        debugLog('Google Places import result.', {
          active: isActive,
          hasLib: Boolean(lib),
          hasAutocompleteSuggestion: Boolean(lib?.AutocompleteSuggestion),
          hasSessionToken: Boolean(lib?.AutocompleteSessionToken),
        });
        if (!isActive || !lib?.AutocompleteSuggestion) {
          if (isActive) {
            debugError('Places library missing AutocompleteSuggestion. Check Places API (New), billing, API restrictions, or script version.');
          }
          return;
        }
        setPlacesLib(lib);
        setSessionToken(new lib.AutocompleteSessionToken());
      })
      .catch((error) => {
        debugError('Google Places initialization failed.', error);
        if (isActive) {
          setLoadError('Google address search could not be loaded.');
        }
      });

    return () => {
      isActive = false;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!placesLib || trimmedValue.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    let isActive = true;
    const timeout = window.setTimeout(async () => {
      debugLog('Fetching autocomplete suggestions.', {
        input: trimmedValue,
        countries: GOOGLE_PLACES_COUNTRIES,
        primaryTypes: GOOGLE_ADDRESS_TYPES,
        hasSessionToken: Boolean(sessionToken),
      });
      setLoading(true);
      try {
        const { suggestions } = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmedValue,
          includedRegionCodes: GOOGLE_PLACES_COUNTRIES,
          includedPrimaryTypes: GOOGLE_ADDRESS_TYPES,
          language: 'en',
          region: 'at',
          sessionToken,
        });

        if (!isActive) return;

        const nextPredictions = (suggestions || [])
          .map((suggestion: any) => suggestion.placePrediction)
          .filter(Boolean);
        debugLog('Autocomplete suggestions received.', {
          count: nextPredictions.length,
          labels: nextPredictions.slice(0, 5).map((prediction: PlacePrediction) => getPredictionText(prediction.text)),
        });
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
  }, [placesLib, sessionToken, trimmedValue]);

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
    debugLog('Selecting prediction.', {
      placeId: prediction.placeId,
      label: getPredictionText(prediction.text),
    });
    setLoading(true);
    try {
      const place = prediction.toPlace();
      debugLog('Fetching selected place fields.');
      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress', 'location', 'id'],
      });

      const placeJson = place.toJSON?.() || place;
      debugLog('Place details received.', placeJson);
      const parsedAddress = parseGoogleAddress(placeJson);
      debugLog('Parsed Google address.', parsedAddress);
      onSelectRef.current(parsedAddress);
      setPredictions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      setSessionToken(placesLib ? new placesLib.AutocompleteSessionToken() : null);
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
