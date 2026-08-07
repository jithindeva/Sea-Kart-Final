import { AlertTriangle, LogOut, CheckCircle2, Trash2, Truck } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'logout' | 'delivered' | 'out_of_delivery' | 'delete';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Yes, Proceed',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'logout'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'logout': return <LogOut style={{ width: 28, height: 28, color: '#f87171' }} />;
      case 'out_of_delivery': return <Truck style={{ width: 28, height: 28, color: '#60a5fa' }} />;
      case 'delivered': return <CheckCircle2 style={{ width: 28, height: 28, color: '#34d399' }} />;
      case 'delete': return <Trash2 style={{ width: 28, height: 28, color: '#f87171' }} />;
      default: return <AlertTriangle style={{ width: 28, height: 28, color: '#fbbf24' }} />;
    }
  };

  const getBtnBg = () => {
    switch (type) {
      case 'logout':
      case 'delete':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'delivered':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'out_of_delivery':
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      overflowY: 'auto',
    }}>
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-card { animation: modalPop 0.22s ease-out both; }
      `}</style>

      <div className="modal-card" style={{
        background: '#1e293b', border: '1px solid rgba(148,163,184,0.2)',
        borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '380px',
        textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Animated Top Rainbow Bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #6366f1, #8b5cf6, #3b82f6)',
          backgroundSize: '300% 100%',
          animation: 'rainbowSlide 3s linear infinite'
        }} />

        {/* Icon Circle */}
        <div style={{
          width: '60px', height: '60px', borderRadius: '20px', margin: '0 auto 16px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {getIcon()}
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.5 }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.3)',
              background: 'transparent', color: '#94a3b8', fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
              background: getBtnBg(), color: 'white', fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
