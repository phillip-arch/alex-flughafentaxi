'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, MapPinned, Rocket, Smartphone } from 'lucide-react';

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  }

  interface Window {
    __aftDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

const SHOWN_COUNT_KEY = 'aft_install_banner_shown_count';
const DISMISSED_UNTIL_KEY = 'aft_install_banner_dismissed_until';
type InstallState = 'hidden' | 'available' | 'installed' | 'unavailable';

export default function InstallAppCard() {
  const [installState, setInstallState] = useState<InstallState>('hidden');
  const [isInstalling, setIsInstalling] = useState(false);
  const hasCountedDisplay = useRef(false);

  useEffect(() => {
    const evaluateState = () => {
      if (typeof window === 'undefined') return;

      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean(window.navigator.standalone);

      if (isInstalled) {
        setInstallState('installed');
        return;
      }

      const dismissedUntil = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY) || '0');
      if (dismissedUntil > Date.now()) {
        setInstallState('unavailable');
        return;
      }

      const shownCount = Number(window.localStorage.getItem(SHOWN_COUNT_KEY) || '0');
      const hasPrompt = Boolean(window.__aftDeferredInstallPrompt);

      if (hasPrompt && shownCount < 2) {
        if (!hasCountedDisplay.current) {
          window.localStorage.setItem(SHOWN_COUNT_KEY, String(shownCount + 1));
          hasCountedDisplay.current = true;
        }
        setInstallState('available');
        return;
      }

      setInstallState('unavailable');
    };

    evaluateState();

    const handleAvailable = () => evaluateState();
    const handleInstalled = () => setInstallState('installed');

    window.addEventListener('aft-install-available', handleAvailable);
    window.addEventListener('aft-install-installed', handleInstalled);

    return () => {
      window.removeEventListener('aft-install-available', handleAvailable);
      window.removeEventListener('aft-install-installed', handleInstalled);
    };
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );
    setInstallState('unavailable');
  };

  const handleInstall = async () => {
    const promptEvent = window.__aftDeferredInstallPrompt;
    if (!promptEvent) {
      setInstallState('unavailable');
      return;
    }

    setIsInstalling(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        setInstallState('installed');
      } else {
        window.localStorage.setItem(
          DISMISSED_UNTIL_KEY,
          String(Date.now() + 30 * 24 * 60 * 60 * 1000),
        );
        setInstallState('unavailable');
      }
    } finally {
      window.__aftDeferredInstallPrompt = null;
      setIsInstalling(false);
    }
  };

  if (installState === 'hidden') return null;

  if (installState === 'installed') {
    return (
      <div className="rounded-[1.4rem] border border-[#dbe7f8] bg-[#f8fbff] px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1679ff]">
            <CheckCircle2 size={18} />
          </span>
          <div className="space-y-2">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
              App installiert
            </p>
            <h3 className="text-[1.12rem] font-semibold tracking-[-0.04em] text-[#111827]">
              Die App ist bereits auf diesem Geraet verfuegbar
            </h3>
            <p className="text-[0.96rem] leading-7 text-[#42566f]">
              Fuer schnelleren Zugriff koennen Sie die App direkt vom Homescreen aus oeffnen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (installState === 'unavailable') {
    return (
      <div className="rounded-[1.4rem] border border-[#e8edf3] bg-white px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f7fb] text-[#6a7d96]">
            <Smartphone size={18} />
          </span>
          <div className="space-y-2">
            <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
              App
            </p>
            <h3 className="text-[1.12rem] font-semibold tracking-[-0.04em] text-[#111827]">
              Installation aktuell nicht verfuegbar
            </h3>
            <p className="text-[0.96rem] leading-7 text-[#42566f]">
              Oeffnen Sie die Website in einem unterstuetzten mobilen Browser und fuegen Sie sie bei
              Bedarf spaeter zu Ihrem Homescreen hinzu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.4rem] border border-[#dbe7f8] bg-[#f8fbff] px-5 py-5">
      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
        App installieren
      </p>
      <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.04em] text-[#111827]">
        Fuer schnellere Buchungen beim naechsten Mal
      </h3>
      <div className="mt-3 flex flex-col gap-2 text-[0.96rem] leading-7 text-[#42566f]">
        <div className="flex items-center gap-2">
          <Rocket size={16} className="text-[#1679FF]" />
          <span>In 2 Klicks buchen</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPinned size={16} className="text-[#1679FF]" />
          <span>Gespeicherte Adressen schneller nutzen</span>
        </div>
        <div className="flex items-center gap-2">
          <Download size={16} className="text-[#1679FF]" />
          <span>Schneller Zugriff vom Homescreen</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleInstall}
          disabled={isInstalling}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-6 py-4 text-[1.0625rem] font-medium leading-none text-white transition-colors hover:bg-[#232325] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isInstalling ? 'Installiert...' : 'Install App'}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex items-center justify-center rounded-[var(--radius-field)] border border-[#dbe7f8] bg-white px-6 py-4 text-[1.0625rem] font-medium leading-none text-[#1679ff] shadow-[0_10px_24px_rgba(17,17,17,0.04)] transition-colors hover:bg-[#f8fbff] hover:text-[#0a63ff]"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
