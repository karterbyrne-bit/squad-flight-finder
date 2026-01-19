import { useState, useEffect } from 'react';
import { Button } from './shared/Button';

/**
 * InstallPrompt Component
 *
 * Handles PWA installation prompts for browsers that support it.
 * Shows a banner when the app can be installed and the user has enabled the setting.
 *
 * Browser Support:
 * - Chrome/Edge: Full support via beforeinstallprompt event
 * - Safari iOS: Manual instructions (Add to Home Screen from Share menu)
 * - Firefox: Limited support
 *
 * @param {Object} props
 * @param {boolean} props.enabled - Whether to show install prompts (from settings)
 * @param {Function} props.onDismiss - Callback when user dismisses the prompt
 */
const InstallPrompt = ({ enabled, onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Initialize isStandalone once
  const [isStandalone] = useState(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')
    );
  });

  // Initialize isIOS once
  const [isIOS] = useState(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  });

  // Initialize showPrompt based on iOS detection
  const [showPrompt, setShowPrompt] = useState(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');
    return ios && !standalone && enabled;
  });

  useEffect(() => {
    // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = e => {
      console.log('[InstallPrompt] beforeinstallprompt event fired');
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show our custom prompt if enabled
      if (enabled && !isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [enabled, isStandalone]);

  // Don't show if not enabled, already installed, or no prompt available
  if (!enabled || isStandalone || !showPrompt) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS doesn't support programmatic install, show instructions
      // Keep the prompt open so user can see the instructions
      return;
    }

    if (!deferredPrompt) {
      console.log('[InstallPrompt] No deferred prompt available');
      return;
    }

    // Show the browser's install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[InstallPrompt] User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[InstallPrompt] User accepted the install prompt');
    } else {
      console.log('[InstallPrompt] User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1">Install Squad Flight Finder</h3>

            {isIOS ? (
              <p className="text-xs opacity-90 mb-3">
                Tap the Share button{' '}
                <svg className="inline w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                </svg>
                then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-xs opacity-90 mb-3">
                Install the app for quick access and offline support
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              {!isIOS && (
                <Button
                  onClick={handleInstallClick}
                  variant="secondary"
                  size="sm"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-3 py-1.5 text-xs font-semibold"
                >
                  Install
                </Button>
              )}
              <button
                onClick={handleDismiss}
                className="text-xs font-medium opacity-90 hover:opacity-100 underline"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
