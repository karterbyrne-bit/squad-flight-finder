import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'squad_flight_settings';

const DEFAULT_SETTINGS = {
  allowAddToHomeScreen: true,
  installPromptDismissed: false,
  installPromptDismissedAt: null,
};

/**
 * Custom hook for managing app settings with localStorage persistence
 * Follows the existing hook pattern used in the codebase (similar to useTravelers.js)
 *
 * @returns {Object} Settings state and update functions
 */
export const useSettings = () => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new settings are present
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('[Settings] Error loading settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('[Settings] Error saving settings to localStorage:', error);
    }
  }, [settings]);

  /**
   * Update a specific setting
   */
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Toggle the "Allow Add to Home Screen" setting
   */
  const toggleAddToHomeScreen = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      allowAddToHomeScreen: !prev.allowAddToHomeScreen,
    }));
  }, []);

  /**
   * Mark install prompt as dismissed
   */
  const dismissInstallPrompt = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      installPromptDismissed: true,
      installPromptDismissedAt: new Date().toISOString(),
    }));
  }, []);

  /**
   * Reset install prompt dismissal (e.g., after 7 days)
   */
  const resetInstallPromptDismissal = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      installPromptDismissed: false,
      installPromptDismissedAt: null,
    }));
  }, []);

  /**
   * Check if we should show install prompt
   * Don't show if:
   * - User has disabled the setting
   * - User dismissed it recently (within 7 days)
   */
  const shouldShowInstallPrompt = useCallback(() => {
    if (!settings.allowAddToHomeScreen) {
      return false;
    }

    if (settings.installPromptDismissed && settings.installPromptDismissedAt) {
      const dismissedDate = new Date(settings.installPromptDismissedAt);
      const daysSinceDismissal = (new Date() - dismissedDate) / (1000 * 60 * 60 * 24);

      // Reset dismissal after 7 days
      if (daysSinceDismissal > 7) {
        resetInstallPromptDismissal();
        return true;
      }

      return false;
    }

    return true;
  }, [settings, resetInstallPromptDismissal]);

  /**
   * Reset all settings to defaults
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSetting,
    toggleAddToHomeScreen,
    dismissInstallPrompt,
    resetInstallPromptDismissal,
    shouldShowInstallPrompt,
    resetSettings,
  };
};
