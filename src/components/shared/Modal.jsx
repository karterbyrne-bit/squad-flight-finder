import React from 'react';
import { Button } from './Button';

/**
 * Modal - Reusable modal component with backdrop
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {React.ReactNode} footer - Optional footer content
 * @param {string} maxWidth - Max width class (default: 'max-w-md')
 * @param {boolean} showCloseButton - Show close button in footer
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl p-6 ${maxWidth} w-full`}>
        {title && (
          <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        )}

        <div className="mb-6">
          {children}
        </div>

        {(footer || showCloseButton) && (
          <div className="flex gap-3">
            {footer || (
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ConfirmModal - Modal for confirmation dialogs
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  cancelText = 'Cancel'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      footer={
        <>
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            fullWidth
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
};

/**
 * InputModal - Modal with text input
 */
export const InputModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  value,
  onChange,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      footer={
        <>
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {message && <p className="text-gray-600 mb-4">{message}</p>}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        autoFocus
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:border-purple-400 focus:outline-none transition-all"
      />
    </Modal>
  );
};
