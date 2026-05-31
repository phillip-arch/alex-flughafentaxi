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

const GOOGLE_PLACES_COUNTRIES = ['at', 'sk', 'hu', 'si'];

function loadGooglePlaces(apiKey: string) {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps?.places?.Autocomplete) return Promise.resolve();
  if (window.__googleMapsPlacesPromise) return window.__googleMapsPlacesPromise;

  window.__googleMapsPlacesPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps-places="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      libraries: 'places',
      loading: 'async',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsPlaces = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Google Maps script failed to load.')), { once: true });
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  const [loadError, setLoadError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const hasLeadingIcon = Boolean(leadingIcon);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!apiKey) {
      setLoadError('Google address search is not configured.');
      return;
    }

    let isActive = true;
    void loadGooglePlaces(apiKey)
      .then(() => {
        if (!isActive || !inputRef.current || !window.google?.maps?.places?.Autocomplete) return;

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: {
            country: GOOGLE_PLACES_COUNTRIES,
          },
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
          types: ['address'],
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace?.();
          if (!place) return;

          const parsedAddress = parseGoogleAddress(place);
          onSelectRef.current(parsedAddress);
        });
      })
      .catch(() => {
        if (isActive) {
          setLoadError('Google address search could not be loaded.');
        }
      });

    return () => {
      isActive = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      autocompleteRef.current = null;
    };
  }, [apiKey]);

  return (
    <div className="relative">
      {leadingIcon ? (
        <label htmlFor={inputId} className="pointer-events-none absolute left-3 top-1/2 z-10 inline-flex -translate-y-1/2 text-[#1679FF]">
          {leadingIcon}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete="street-address"
        inputMode="text"
        className={`${className} ${hasLeadingIcon ? 'ui-input-with-leading-icon' : ''}`}
      />
      {loadError ? (
        <p className="mt-1.5 text-[0.78rem] font-medium text-[#d70015]">{loadError}</p>
      ) : null}
    </div>
  );
}
