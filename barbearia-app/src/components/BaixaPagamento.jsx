import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, QrCode, UserX, XCircle } from 'lucide-react';
import { calculateNetAndFee } from '../data/mockData';

export default function BaixaPagamento({ isOpen, onClose, appointment, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [feeDetails, setFeeDetails] = useState({ fee: 0, netAmount: 0 });
  const [render, setRender] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setIsExiting(false);
      setShowConfirmCancel(false);
    } else if (render) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, render]);

  useEffect(() => {
    if (appointment) {
      if (paymentMethod === 'Não Compareceu' || paymentMethod === 'Cancelado') {
        setFeeDetails({ fee: 0, netAmount: 0 });
      } else {
        const details = calculateNetAndFee(appointment.price, paymentMethod);
        setFeeDetails(details);
      }
    }
  }, [appointment, paymentMethod]);

  if (!render || !appointment) return null;

  const handleConfirm = () => {
    if (paymentMethod === 'Cancelado' && !showConfirmCancel) {
      setShowConfirmCancel(true);
      return;
    }
    onConfirm(appointment.id, paymentMethod, feeDetails.fee, feeDetails.netAmount);
    setShowConfirmCancel(false);
    onClose();
  };

  const paymentMethods = [
    { id: 'Dinheiro', name: 'Dinheiro', icon: DollarSign, feePercent: '0%' },
    { id: 'PIX', name: 'PIX', icon: QrCode, feePercent: '0%' },
    { id: 'Débito', name: 'Débito', icon: CreditCard, feePercent: '1.5%' },
    { id: 'Crédito', name: 'Crédito', icon: CreditCard, feePercent: '3.0%' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${
          isExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
        }`}
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col ${
        isExiting ? 'animate-modal-out' : 'animate-modal-in'
      }`}>
        
        {/* Safety cancellation confirmation dialog overlay */}
        {showConfirmCancel && (
          <div className="absolute inset-0 bg-black/95 flex flex-col justify-center p-6 text-center space-y-6 z-50 animate-modal-in">
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">Confirmar Cancelamento</h4>
              <p className="text-xs text-gray-400 leading-normal">
                Tem certeza que deseja cancelar este agendamento? Essa ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  onConfirm(appointment.id, 'Cancelado', 0, 0);
                  setShowConfirmCancel(false);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer h-11"
              >
                Sim, Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmCancel(false)}
                className="w-full py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 hover:bg-white/5 transition-colors cursor-pointer h-11"
              >
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Dar Baixa no Atendimento</h3>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Selecione a forma de pagamento do cliente.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-1">
          {/* Appointment Details summary */}
          <div className="p-4 sm:p-6 bg-white/5 border-b border-border-dark flex justify-between items-center">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-gold-400 tracking-wider">Cliente</span>
              <p className="text-xs sm:text-sm font-semibold text-white mt-0.5">{appointment.clientName}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{appointment.service} • {appointment.time}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider">Valor do Serviço</span>
              <p className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                R${appointment.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* Main Content Form */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Method Selection */}
            <div className="space-y-3">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border text-left btn-secondary cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gold-400/10 border-gold-400 text-gold-400 shadow-[0_0_15px_rgba(212,168,67,0.05)] font-bold' 
                          : 'bg-black/30 border-border-dark text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-gold-400/20 text-gold-400' : 'bg-white/5 text-gray-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white">{method.name}</p>
                        <p className="text-[10px] text-gray-500">Taxa: {method.feePercent}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-t border-[#2a2a2a] my-2" />

            {/* Other Actions Section */}
            <div className="space-y-3">
              <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Outras Ações</label>
              
              <div className="flex flex-col gap-2">
                {/* Missed Appointment (No-Show) Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Não Compareceu')}
                  className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'Não Compareceu'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.05)] font-bold'
                      : 'bg-black/30 border-border-dark text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${paymentMethod === 'Não Compareceu' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-400'}`}>
                    <UserX className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Cliente não compareceu (Falta)</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">Registrar ausência do cliente e zerar cobrança</p>
                  </div>
                </button>

                {/* Cancel Appointment Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cancelado')}
                  className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'Cancelado'
                      ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)] font-bold'
                      : 'bg-black/30 border-border-dark text-gray-400 hover:bg-white/5 hover:border-red-500/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${paymentMethod === 'Cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">Cancelar Agendamento</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">Cancela o agendamento sem cobrança</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Fees Breakdown */}
            <div className="bg-black/40 rounded-2xl border border-border-dark p-4 sm:p-5 space-y-2">
              {paymentMethod === 'Não Compareceu' ? (
                <div className="text-center py-1 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-rose-400">Ausência Registrada</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-normal">
                    Este atendimento será marcado como <strong className="text-gray-300">Não Compareceu</strong>. Nenhuma cobrança ou comissão será gerada.
                  </p>
                </div>
              ) : paymentMethod === 'Cancelado' ? (
                <div className="text-center py-1 space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-red-400">Cancelamento de Agendamento</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-normal">
                    Este atendimento será marcado como <strong className="text-gray-300">Cancelado</strong>. Nenhuma cobrança ou comissão será gerada.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Valor Bruto:</span>
                    <span className="text-white font-semibold">R${appointment.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Taxa Administrativa ({paymentMethod === 'Dinheiro' || paymentMethod === 'PIX' ? '0%' : paymentMethod === 'Débito' ? '1.5%' : '3%'}):</span>
                    <span className={`font-semibold ${feeDetails.fee > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      - R${feeDetails.fee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <hr className="border-border-dark my-1.5" />

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gold-400">Faturamento Líquido:</span>
                    <span className="text-sm sm:text-base font-black text-gold-400">
                      R${feeDetails.netAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Irreversible warning */}
            {paymentMethod === 'Cancelado' && (
              <p className="text-[10px] sm:text-xs font-semibold text-red-400 text-center tracking-wide animate-pulse">
                Essa ação não pode ser desfeita.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary h-11 cursor-pointer hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold h-11 transition-all duration-200 cursor-pointer ${
              paymentMethod === 'Não Compareceu'
                ? 'bg-rose-500 text-white hover:bg-rose-600 active:scale-97'
                : paymentMethod === 'Cancelado'
                  ? 'bg-red-500 text-white hover:bg-red-600 active:scale-97'
                  : 'bg-gold-400 text-black hover:bg-gold-500 active:scale-97'
            }`}
          >
            {paymentMethod === 'Não Compareceu' 
              ? 'Confirmar Falta' 
              : paymentMethod === 'Cancelado' 
                ? 'Confirmar Cancelamento' 
                : 'Confirmar Recebimento'}
          </button>
        </div>

      </div>
    </div>
  );
}
