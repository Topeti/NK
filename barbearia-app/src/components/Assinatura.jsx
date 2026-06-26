import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  AlertOctagon, 
  Calendar, 
  History, 
  Sparkles, 
  HelpCircle,
  X,
  Lock,
  Plus
} from 'lucide-react';

export default function Assinatura({ subClients, setSubClients }) {
  const [activeClientKey, setActiveClientKey] = useState('clientA'); // 'clientA' or 'clientB'
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isCardModalRender, setIsCardModalRender] = useState(false);
  const [isCardModalExiting, setIsCardModalExiting] = useState(false);

  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    if (isCardModalOpen) {
      setIsCardModalRender(true);
      setIsCardModalExiting(false);
    } else if (isCardModalRender) {
      setIsCardModalExiting(true);
      const timer = setTimeout(() => {
        setIsCardModalRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isCardModalOpen]);

  const client = subClients[activeClientKey];
  const isActive = client.status === 'Ativo';

  const handleCardChangeSubmit = (e) => {
    e.preventDefault();
    if (!cardForm.number.trim()) return;

    // Get last 4 digits
    const last4 = cardForm.number.replace(/\s/g, '').slice(-4) || '9999';

    // Update parent state
    setSubClients(prev => ({
      ...prev,
      [activeClientKey]: {
        ...prev[activeClientKey],
        cardLast4: last4
      }
    }));

    // Reset card form and close modal
    setCardForm({ name: '', number: '', expiry: '', cvv: '' });
    setIsCardModalOpen(false);
  };

  const handleScheduleClick = () => {
    if (!isActive) return;
    alert(`Agendamento pelo Plano Ilimitado liberado para o cliente ${client.name}! (Simulação de agendamento concluída)`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row with Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider select-none">
            Assinatura
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 select-none">
            Planos recorrentes, histórico e faturamento de membros
          </p>
        </div>
      </div>

      {/* Simulation Selector Bar */}
      <div className="bg-card-bg border border-border-dark p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="text-base font-bold text-white tracking-tight">Simulador de Visualização do Cliente</h4>
          <p className="text-xs text-gray-400 mt-1">Alterne entre os clientes para simular estados de assinatura ativos e expirados.</p>
        </div>

        {/* Toggle Segment */}
        <div className="flex gap-2 bg-black/40 border border-border-dark p-1.5 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveClientKey('clientA')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold btn-secondary ${
              activeClientKey === 'clientA' 
                ? 'bg-gold-400 text-black text-black/90 shadow-lg' 
                : 'text-gray-400 border border-transparent'
            }`}
          >
            Cliente A (Bernardo - Ativo)
          </button>
          <button
            onClick={() => setActiveClientKey('clientB')}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-lg text-xs font-bold btn-secondary ${
              activeClientKey === 'clientB' 
                ? 'bg-gold-400 text-black text-black/90 shadow-lg' 
                : 'text-gray-400 border border-transparent'
            }`}
          >
            Cliente B (Carlos - Expirado)
          </button>
        </div>
      </div>

      {/* Main Grid: Card detail + Usage history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Subscription details Card */}
        <div className="lg:col-span-2 bg-card-bg border border-border-dark rounded-2xl overflow-hidden card-premium flex flex-col justify-between relative">
          
          {/* Top Decorative bar */}
          <div className={`h-1.5 w-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

          {/* Body */}
          <div className="p-6 space-y-6">
            
            {/* Status & Name */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Cliente Conectado</span>
                <h3 className="text-xl font-bold text-white mt-1">{client.name}</h3>
                <p className="text-xs text-gold-400 font-medium mt-0.5">{client.planName}</p>
              </div>

              {/* Status Badge */}
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                isActive 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}>
                {isActive ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Plano Ativo</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4 text-red-500" />
                    <span>Plano Expirado</span>
                  </>
                )}
              </span>
            </div>

            {/* Plan Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/30 border border-border-dark/60 p-4 rounded-xl">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Mensalidade</p>
                <p className="text-lg font-bold text-white mt-0.5">{client.planPrice}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">
                  {isActive ? 'Próxima Cobrança' : 'Expirou Em'}
                </p>
                <p className="text-lg font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  {client.nextBilling}
                </p>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Forma de Cobrança</p>
              <div className="flex items-center justify-between p-4 bg-black/20 border border-border-dark rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-lg text-gray-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Cartão de Crédito Visa</p>
                    <p className="text-xs text-gray-500">Final •••• •••• •••• {client.cardLast4}</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg border border-border-dark text-xs font-bold text-gray-400 btn-secondary"
                >
                  Trocar Cartão
                </button>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border-dark bg-black/20 flex flex-col sm:flex-row gap-3 justify-between items-center">
            
            {/* Tooltip text if expired */}
            <div className="w-full sm:w-auto text-center sm:text-left">
              {!isActive && (
                <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                  Renove seu plano para agendar
                </span>
              )}
              {isActive && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  Agendamentos ilimitados autorizados
                </span>
              )}
            </div>

            {/* Book button */}
            <button
              type="button"
              onClick={handleScheduleClick}
              disabled={!isActive}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-gold-400 text-black btn-primary'
                  : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
              }`}
              title={!isActive ? 'Renove seu plano para agendar' : 'Fazer Agendamento'}
            >
              <Plus className="w-4 h-4" />
              Agendar Pelo Plano
            </button>

          </div>

        </div>

        {/* Usage history panel */}
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl card-premium">
          <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-gold-400" />
            <h4 className="text-base font-bold text-white tracking-tight">Utilização no Mês</h4>
          </div>

          <div className="space-y-4">
            {client.history.map((hItem) => (
              <div 
                key={hItem.id} 
                className="p-3 bg-black/30 border border-border-dark/60 rounded-xl space-y-1.5 relative overflow-hidden group card-premium"
              >
                {/* Visual badge inside history */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold">{hItem.date}</span>
                    <p className="text-sm font-bold text-white mt-0.5">{hItem.service}</p>
                    <p className="text-xs text-gray-400">Atendido por: {hItem.professional}</p>
                  </div>
                  
                  {/* Premium star seal */}
                  <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 border border-gold-400/20">
                    <Sparkles className="w-2.5 h-2.5" /> PLANO
                  </span>
                </div>
              </div>
            ))}

            {client.history.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">Nenhum serviço consumido neste mês.</p>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: Card Exchange Modal */}
      {isCardModalRender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${
              isCardModalExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
            }`} 
            onClick={() => setIsCardModalOpen(false)}
          ></div>
          
          <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden ${
            isCardModalExiting ? 'animate-modal-out' : 'animate-modal-in'
          }`}>
            <form onSubmit={handleCardChangeSubmit}>
              
              {/* Header */}
              <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Alterar Cartão de Crédito</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">As próximas mensalidades serão debitadas aqui.</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsCardModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 btn-icon-only"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-4">
                
                {/* Cardholder Name */}
                <div className="flex flex-col-reverse gap-1.5">
                  <input
                    type="text"
                    required
                    id="cardName"
                    placeholder="Ex: BERNARDO SOUZA"
                    value={cardForm.name}
                    onChange={(e) => setCardForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer uppercase placeholder-gray-600"
                  />
                  <label htmlFor="cardName" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Nome no Cartão</label>
                </div>

                {/* Card Number */}
                <div className="flex flex-col-reverse gap-1.5">
                  <input
                    type="text"
                    required
                    id="cardNumber"
                    maxLength="19"
                    placeholder="4589 1234 5678 9012"
                    value={cardForm.number}
                    onChange={(e) => {
                      // Basic card formatter
                      const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardForm(prev => ({ ...prev, number: val }));
                    }}
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer placeholder-gray-600 font-mono"
                  />
                  <label htmlFor="cardNumber" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Número do Cartão</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiration Date */}
                  <div className="flex flex-col-reverse gap-1.5">
                    <input
                      type="text"
                      required
                      id="cardExpiry"
                      maxLength="5"
                      placeholder="MM/AA"
                      value={cardForm.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardForm(prev => ({ ...prev, expiry: val }));
                      }}
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer placeholder-gray-600"
                    />
                    <label htmlFor="cardExpiry" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Validade</label>
                  </div>

                  {/* CVV */}
                  <div className="flex flex-col-reverse gap-1.5">
                    <input
                      type="password"
                      required
                      id="cardCvv"
                      maxLength="3"
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer placeholder-gray-600 font-mono"
                    />
                    <label htmlFor="cardCvv" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">CVC / CVV</label>
                  </div>
                </div>

                {/* Safe credentials warning */}
                <div className="flex gap-2 items-center text-[10px] text-gray-500 mt-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-gold-400" />
                  <span>Ambiente criptografado. Suas informações de cartão estão seguras.</span>
                </div>

              </div>

              {/* Actions */}
              <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-sm font-semibold text-gray-400 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gold-400 text-black text-sm font-bold btn-primary"
                >
                  Confirmar Cartão
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
