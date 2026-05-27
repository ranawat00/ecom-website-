import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ 
  show, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmText = 'Yes, Delete', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  confirmColor = '#6B1D2F' 
}) => {
  if (!show) return null;

  return (
    <div 
      className="review-modal-overlay fade-in" 
      style={{ 
        zIndex: 1500, 
        backdropFilter: 'blur(6px)', 
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        className="review-modal-content" 
        style={{ 
          maxWidth: '420px', 
          width: '90%',
          padding: '30px', 
          borderRadius: '16px',
          backgroundColor: '#FDFBF7',
          boxShadow: '0 20px 40px rgba(60, 34, 38, 0.15)',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          animation: 'modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        {/* Warning Icon Banner */}
        <div 
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(107, 29, 47, 0.08)', 
            color: '#6B1D2F', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >
          <AlertTriangle size={30} color="#6B1D2F" />
        </div>

        {/* Header Title */}
        <h3 
          style={{ 
            color: '#3C2226', 
            fontSize: '1.35rem', 
            fontWeight: '800', 
            margin: '0 0 10px 0',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          {title}
        </h3>

        {/* Message Description */}
        <p 
          style={{ 
            color: '#8C7A7C', 
            fontSize: '0.95rem', 
            lineHeight: '1.5', 
            margin: '0 0 25px 0' 
          }}
        >
          {message}
        </p>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
          <button 
            type="button"
            onClick={onCancel} 
            className="btn-secondary-dashboard"
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              borderRadius: '8px', 
              border: '1px solid #D9D2C9',
              backgroundColor: '#F7F4EF',
              color: '#6E625F',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem'
            }}
          >
            {cancelText}
          </button>
          
          <button 
            type="button"
            onClick={onConfirm} 
            className="btn-primary-dashboard"
            style={{ 
              flex: 1,
              padding: '12px 20px', 
              borderRadius: '8px', 
              border: 'none',
              backgroundColor: confirmColor,
              color: '#FFFFFF',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem',
              boxShadow: `0 4px 12px ${confirmColor}33`
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Embedded CSS for scale-up keyframes */}
      <style>{`
        @keyframes modalScaleUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
