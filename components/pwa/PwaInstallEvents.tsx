'use client';

import { useEffect } from 'react';

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  }

  interface Window {
    __aftDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function PwaInstallEvents() {
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      window.__aftDeferredInstallPrompt = promptEvent;
      window.dispatchEvent(new CustomEvent('aft-install-available'));
    };

    const handleInstalled = () => {
      window.__aftDeferredInstallPrompt = null;
      window.localStorage.setItem('aft_app_installed', '1');
      window.dispatchEvent(new CustomEvent('aft-install-installed'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  return null;
}
