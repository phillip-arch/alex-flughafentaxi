'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, MapPinned, Rocket } from 'lucide-react';

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
const INSTALLED_KEY = 'aft_app_installed';

export default function BookingInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const hasCountedDisplay = useRef(false);

  useEffect(() => {
    const evaluateVisibility = () => {
      if (typeof window === 'undefined') return;

      const isInstalled =
        window.localStorage.getItem(INSTALLED_KEY) === '1' ||
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean(window.navigator.standalone);

      if (isInstalled) {
        window.localStorage.setItem(INSTALLED_KEY, '1');
        setIsVisible(false);
        return;
      }

      const dismissedUntil = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY) || '0');
      if (dismissedUntil > Date.now()) {
        setIsVisible(false);
        return;
      }

      const shownCount = Number(window.localStorage.getItem(SHOWN_COUNT_KEY) || '0');
      const hasPrompt = Boolean(window.__aftDeferredInstallPrompt);

      if (!hasPrompt || shownCount >= 2) {
        setIsVisible(false);
        return;
      }

      if (!hasCountedDisplay.current) {
        window.localStorage.setItem(SHOWN_COUNT_KEY, String(shownCount + 1));
        hasCountedDisplay.current = true;
      }

      setIsVisible(true);
    };

    evaluateVisibility();

    const handleAvailable = () => evaluateVisibility();
    const handleInstalled = () => {
      window.localStorage.setItem(INSTALLED_KEY, '1');
      setIsVisible(false);
    };

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
    setIsVisible(false);
  };

  const handleInstall = async () => {
    const promptEvent = window.__aftDeferredInstallPrompt;
    if (!promptEvent) return;

    setIsInstalling(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        window.localStorage.setItem(INSTALLED_KEY, '1');
      } else {
        window.localStorage.setItem(
          DISMISSED_UNTIL_KEY,
          String(Date.now() + 30 * 24 * 60 * 60 * 1000),
        );
      }
    } finally {
      window.__aftDeferredInstallPrompt = null;
      setIsVisible(false);
      setIsInstalling(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-6 w-full rounded-[1.4rem] border border-[#dbe7f8] bg-[#f8fbff] px-5 py-5 text-left">
      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-[#1679FF]">
        App installieren
      </p>
      <h2 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.04em] text-[#111827]">
        Install our app for faster booking next time
      </h2>
      <div className="mt-3 flex flex-col gap-2 text-[0.96rem] leading-7 text-[#42566f]">
        <div className="flex items-center gap-2">
          <Rocket size={16} className="text-[#1679FF]" />
          <span>Book in 2 clicks</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPinned size={16} className="text-[#1679FF]" />
          <span>Save your address</span>
        </div>
        <div className="flex items-center gap-2">
          <Download size={16} className="text-[#1679FF]" />
          <span>Faster access</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleInstall}
          disabled={isInstalling}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[#000000] px-6 py-4 text-[1.0625rem] font-medium leading-none text-white transition-colors hover:bg-[#232325] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
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
