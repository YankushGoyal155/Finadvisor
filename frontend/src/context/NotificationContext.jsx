import React, { createContext, useContext, useState, useCallback } from 'react';
import '../components/Notification.css';

const NotificationContext = createContext();

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showModal = useCallback(({ title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    setModal({ title, content, onConfirm, onCancel, confirmText, cancelText });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, showModal, closeModal }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} slide-in-toast`}>
            <div className="toast-icon">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'info' && 'ℹ️'}
              {toast.type === 'warning' && '⚠️'}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Modal / Popup Container */}
      {modal && (
        <div className="modal-overlay fade-in" onClick={closeModal}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            {modal.title && <h2 className="modal-title">{modal.title}</h2>}
            <div className="modal-body">
              {modal.content}
            </div>
            <div className="modal-actions">
              {modal.onCancel && (
                <button className="btn-secondary" onClick={() => { modal.onCancel(); closeModal(); }}>
                  {modal.cancelText}
                </button>
              )}
              {modal.onConfirm && (
                <button className="btn-primary" onClick={() => { modal.onConfirm(); closeModal(); }}>
                  {modal.confirmText}
                </button>
              )}
              {!modal.onCancel && !modal.onConfirm && (
                <button className="btn-primary" onClick={closeModal}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
