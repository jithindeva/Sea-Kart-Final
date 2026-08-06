import React, { useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: string;
  onSuccess: (paymentMethod: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, total, onSuccess }) => {
  const [processingState, setProcessingState] = useState<'IDLE' | 'REDIRECTING' | 'PROCESSING'>('IDLE');
  const [selectedMethod, setSelectedMethod] = useState('');

  if (!isOpen) return null;

  const handlePayment = async (method: string) => {
    setSelectedMethod(method);
    setProcessingState('REDIRECTING');
    
    // Simulate redirecting to the UPI app
    setTimeout(() => {
      setProcessingState('PROCESSING');
      
      // Simulate user entering UPI PIN and completing payment
      setTimeout(() => {
        toast.success(`Payment successful via ${method}`);
        onSuccess(method);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {processingState === 'IDLE' ? (
          <>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-blue-950 mb-2">Complete Payment</h2>
            <p className="text-slate-500 mb-6">Total amount to pay: <span className="font-bold text-blue-900">{total}</span></p>

            <div className="space-y-3">
              <Button 
                onClick={() => handlePayment('Google Pay')}
                variant="outline" 
                className="w-full h-16 rounded-2xl flex items-center justify-start gap-4 hover:border-blue-500 hover:bg-blue-50 text-lg transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="font-bold text-[#4285F4]">G</span>
                </div>
                Google Pay
              </Button>

              <Button 
                onClick={() => handlePayment('PhonePe')}
                variant="outline" 
                className="w-full h-16 rounded-2xl flex items-center justify-start gap-4 hover:border-purple-500 hover:bg-purple-50 text-lg transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="font-bold text-[#5f259f]">P</span>
                </div>
                PhonePe
              </Button>

              <Button 
                onClick={() => handlePayment('Paytm')}
                variant="outline" 
                className="w-full h-16 rounded-2xl flex items-center justify-start gap-4 hover:border-[#00baf2] hover:bg-sky-50 text-lg transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="font-bold text-[#00baf2]">pay</span>
                </div>
                Paytm
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <Smartphone className="w-10 h-10 text-blue-600" />
              </div>
              {processingState === 'PROCESSING' && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-950 mb-2">
                {processingState === 'REDIRECTING' ? `Opening ${selectedMethod}...` : 'Processing Payment...'}
              </h3>
              <p className="text-slate-500 text-sm">
                {processingState === 'REDIRECTING' 
                  ? 'Please wait while we securely redirect you to the app.' 
                  : 'Please complete the payment on your mobile device.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal;
