import React from 'react';
import { Settings } from 'lucide-react';
import { Modal } from './shared/Modal';

/**
 * SettingsPanel Component
 *
 * Displays app settings in a modal dialog.
 * Currently includes PWA install prompt settings.
 * Follows the pattern from SearchOptions.jsx
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the settings modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Object} props.settings - Settings object from useSettings hook
 * @param {Function} props.onToggleAddToHomeScreen - Callback to toggle add to home screen setting
 */
const SettingsPanel = ({ isOpen, onClose, settings, onToggleAddToHomeScreen }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="App Settings">
      <div className="space-y-6">
        {/* PWA Settings Section */}
        <div>
          <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-600" />
            Installation
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-blue-200 space-y-3">
            {/* Add to Home Screen Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.allowAddToHomeScreen}
                onChange={onToggleAddToHomeScreen}
                className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                  Allow "Add to Home Screen" prompts
                </span>
                <p className="text-xs text-gray-500">
                  {settings.allowAddToHomeScreen
                    ? 'You will see prompts to install this app on your device'
                    : 'Installation prompts are disabled'}
                </p>
              </div>
            </label>

            {/* Info Box */}
            <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-200/50">
              <div className="flex gap-2">
                <svg
                  className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-medium">What is "Add to Home Screen"?</p>
                  <p>
                    Install this app on your device for quick access, offline support, and a native
                    app-like experience. Works on most modern browsers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future sections can be added here */}
        {/* Example:
        <div>
          <h3 className="text-md font-bold text-gray-800 mb-3">
            Notifications
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-blue-200">
            ...
          </div>
        </div>
        */}
      </div>
    </Modal>
  );
};

export default SettingsPanel;
