import React, { useState } from 'react';
import {
  CreditCard,
  Sparkles,
  Check,
  AlertTriangle,
  ShieldCheck,
  X,
  RefreshCw
} from 'lucide-react';

const PLANS = [
  {
    id: 'corte_ilimitado',
    name: 'Corte Ilimitado',
    price: 89.90,
    perks: ['Cortes de cabelo ilimitados', 'Prioridade nos agendamentos', 'Desconto em produtos (10%)']
  },
  {
    id: 'corte_barba_mensal',
    name: 'Corte + Barba Mensal',
    price: 129.90,
    perks: ['Cortes e barbas ilimitados', 'Prioridade nos agendamentos', '1 serviço de sobrancelha grátis/mês', 'Cerveja cortesia em cada visita'],
    popular: true
  },
  {
    id: 'vip_ilimitado',
    name: 'VIP Ilimitado',
    price: 179.90,
    perks: ['Todos os serviços ilimitados (Cabelo, Barba, Sobrancelha)', 'Sem restrição de horário', 'Desconto em produtos (15%)', 'Acesso à área VIP']
  }
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ClientAssinatura({ subClients, setSubClients, planState, setPlanState }) {
  // Modal states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Handle Form input masks
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvv(value);
  };

  // Close Modals
  const closeSubscribeModal = () => {
    setIsSubscribeOpen(false);
    setSelectedPlan(null);
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvv('');
  };

  // Submit subscription
  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      alert('Por favor, preencha todos os dados do cartão.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setPlanState('B');

      const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '4259';
      const activePlan = selectedPlan || PLANS[1];

      const newJoao = {
        id: 999,
        name: 'João Silva',
        initials: 'JS',
        planName: activePlan.name,
        planPrice: activePlan.price,
        status: 'Ativa',
        nextBilling: '26/07/2026',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-8888',
        cardLast4: last4,
        paymentMethod: 'Cartão de Crédito',
        history: [
          { id: 901, date: '26/06/2026', amount: activePlan.price, status: 'Pago' }
        ]
      };

      setSubClients([...subClients.filter(c => c.name !== 'João Silva'), newJoao]);

      closeSubscribeModal();
    }, 1500);
  };

  // Submit Cancel Subscription
  const handleCancelSubmit = () => {
    setPlanState('A');

    setSubClients(subClients.map(c =>
      c.name === 'João Silva'
        ? {
          ...c,
          status: 'Cancelada',
          cancellationDate: '26/06/2026',
          cancellationReason: 'Cancelada pelo cliente no painel'
        }
        : c
    ));
    setIsCancelOpen(false);
  };

  // Trigger payment card update for failure (State C -> State B)
  const handleUpdatePayment = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setPlanState('B');

      setSubClients(subClients.map(c =>
        c.name === 'João Silva'
          ? { ...c, status: 'Ativa', nextBilling: '15/07/2026' }
          : c
      ));

      closeSubscribeModal();
    }, 1500);
  };

  return (
    <div className="space-y-6">

      {/* 1. MODO DEMO PRESENTATION HEADER */}
      <div className="bg-black/40 border border-border-dark p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs select-none">
        <div className="flex items-center gap-2 text-gray-400 font-bold">
          <Sparkles className="w-4 h-4 text-gold-400 animate-pulse animate-badge-pulse" />
          <span>APRESENTAÇÃO: Estados da Assinatura:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPlanState('A');
              setSubClients(subClients.filter(c => c.name !== 'João Silva'));
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-black border transition-all duration-200 cursor-pointer h-10 flex items-center active:scale-97 ${planState === 'A'
                ? 'bg-gold-400 text-black border-gold-400'
                : 'bg-black/30 text-gray-400 border-border-dark hover:text-white'
              }`}
          >
            Estado A: Sem Plano
          </button>

          <button
            type="button"
            onClick={() => {
              setPlanState('B');
              const hasJoao = subClients.some(c => c.name === 'João Silva');
              const activePlan = PLANS[1];
              const activeJoao = {
                id: 999,
                name: 'João Silva',
                initials: 'JS',
                planName: activePlan.name,
                planPrice: activePlan.price,
                status: 'Ativa',
                nextBilling: '26/07/2026',
                email: 'joao.silva@email.com',
                phone: '(11) 99999-8888',
                cardLast4: '4582',
                paymentMethod: 'Cartão de Crédito',
                history: [
                  { id: 901, date: '26/06/2026', amount: activePlan.price, status: 'Pago' }
                ]
              };
              if (!hasJoao) {
                setSubClients([...subClients, activeJoao]);
              } else {
                setSubClients(subClients.map(c => c.name === 'João Silva' ? activeJoao : c));
              }
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-black border transition-all duration-200 cursor-pointer h-10 flex items-center active:scale-97 ${planState === 'B'
                ? 'bg-emerald-500 text-black border-emerald-500'
                : 'bg-black/30 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/5'
              }`}
          >
            Estado B: Plano Ativo
          </button>

          <button
            type="button"
            onClick={() => {
              setPlanState('C');
              const failedJoao = {
                id: 999,
                name: 'João Silva',
                initials: 'JS',
                planName: PLANS[1].name,
                planPrice: PLANS[1].price,
                status: 'Falha no pagamento',
                nextBilling: '15/06/2026',
                email: 'joao.silva@email.com',
                phone: '(11) 99999-8888',
                cardLast4: '8832',
                paymentMethod: 'Cartão de Crédito',
                failureReason: 'Cartão recusado em 15/06',
                history: [
                  { id: 901, date: '15/06/2026', amount: PLANS[1].price, status: 'Recusado' },
                  { id: 902, date: '15/05/2026', amount: PLANS[1].price, status: 'Pago' }
                ]
              };
              const filtered = subClients.filter(c => c.name !== 'João Silva');
              setSubClients([...filtered, failedJoao]);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-black border transition-all duration-200 cursor-pointer h-10 flex items-center active:scale-97 ${planState === 'C'
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-black/30 text-red-400 border-red-500/20 hover:bg-red-500/5'
              }`}
          >
            Estado C: Falha no Pagamento
          </button>
        </div>
      </div>

      {/* STATE A: NO ACTIVE PLAN */}
      {planState === 'A' && (
        <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
          <div className="text-center max-w-lg mx-auto space-y-2 py-4">
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Assine o clube e economize</h3>
            <p className="text-xs text-gray-400">
              Seja um cliente VIP da Corleone. Faça cortes e barbas ilimitadas pagando um valor fixo mensal. Mantendo o visual sempre em dia sem surpresas no fim do mês!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`bg-card-bg border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-200 card-premium ${plan.popular ? 'border-gold-400/50 shadow-[0_0_20px_rgba(212,168,67,0.06)]' : 'border-border-dark'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gold-400 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg select-none">
                    Mais Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-white text-base">{plan.name}</h4>
                    <p className="text-2xl font-black text-gold-400 mt-2">
                      {currencyFormatter.format(plan.price)}
                      <span className="text-xs text-gray-500 font-normal">/mês</span>
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-400 pt-2 border-t border-border-dark/60">
                    {plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsSubscribeOpen(true);
                  }}
                  className={`w-full h-11 mt-6 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${plan.popular
                      ? 'bg-gold-400 text-black hover:bg-gold-500 btn-primary'
                      : 'bg-black/30 border border-border-dark text-gold-400 hover:bg-white/5 btn-secondary'
                    }`}
                >
                  Assinar Agora
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE B & C: ACTIVE PLAN OR PAYMENT FAILURE */}
      {(planState === 'B' || planState === 'C') && (
        <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">

          {/* Failure Alert Banner (State C only) */}
          {planState === 'C' && (
            <div className="p-4 bg-red-500/5 border border-red-500/25 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold text-red-400 uppercase tracking-widest">Atenção: Assinatura Suspensa</p>
                  <p className="text-gray-300 mt-1">Falha no pagamento — Cartão recusado em 15/06</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(PLANS[1]);
                  setIsSubscribeOpen(true);
                }}
                className="w-full sm:w-auto h-10 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-red-500/10 shrink-0 uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Atualizar Cartão
              </button>
            </div>
          )}

          {/* Active Plan Card Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Plan Info Card */}
            <div className="bg-card-bg border border-border-dark p-6 rounded-2xl md:col-span-2 space-y-5">
              <div className="flex justify-between items-start pb-4 border-b border-border-dark/60">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Seu Plano Corleone</span>
                  <h4 className="font-bold text-white text-base mt-0.5">Corte + Barba Mensal</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Assinante desde 15/04/2026
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border select-none whitespace-nowrap shrink-0 ${planState === 'B'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                  {planState === 'B' ? 'Ativa' : 'Suspensa'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Valor Mensal</p>
                  <p className="font-black text-white text-base mt-0.5">{currencyFormatter.format(129.90)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Próxima Cobrança</p>
                  <p className="font-bold text-gray-200 text-sm mt-1">
                    {planState === 'B' ? '15/07/2026' : 'Em atraso'}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-border-dark/40">
                  <p className="text-gray-400 mb-2 font-medium uppercase tracking-wider text-sm">Serviços incluídos</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cortes de cabelo ilimitados</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Barbas ilimitadas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Prioridade no agendamento</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cerveja cortesia a cada corte</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-dark/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsCancelOpen(true)}
                  className="h-10 px-4 text-xs font-bold text-red-500 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center"
                >
                  Cancelar Assinatura
                </button>
              </div>
            </div>

            {/* Plan Usage History */}
            <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-4">
              <div>
                <h5 className="text-sm font-medium text-white">Histórico de Uso</h5>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Últimos atendimentos no plano</p>
              </div>

              <div className="space-y-4 text-xs">

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400 font-bold select-none text-xs">
                    18
                  </div>
                  <div>
                    <p className="font-bold text-gray-200">Corte + Barba</p>
                    <p className="text-xs text-gray-500">Nicolas · 18 Jun, 14:00</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400 font-bold select-none text-xs">
                    04
                  </div>
                  <div>
                    <p className="font-bold text-gray-200">Corte de Cabelo</p>
                    <p className="text-xs text-gray-500">Gustavo · 04 Jun, 10:30</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400 font-bold select-none text-xs">
                    21
                  </div>
                  <div>
                    <p className="font-bold text-gray-200">Corte + Barba</p>
                    <p className="text-xs text-gray-500">Nicolas · 21 Mai, 16:30</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBSCRIBE / UPDATE CARD MODAL */}
      {isSubscribeOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-in" onClick={closeSubscribeModal}></div>

          <div className="bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col animate-modal-in">
            {/* Header */}
            <div className="p-5 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">
                  {planState === 'C' ? 'Atualizar Cartão' : 'Assinar Plano'}
                </h3>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mt-0.5">
                  {planState === 'C' ? 'Insira novos dados de pagamento' : selectedPlan?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={closeSubscribeModal}
                className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={planState === 'C' ? handleUpdatePayment : handleSubscribeSubmit} className="flex flex-col max-h-[80vh] overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-left">

                {/* Plan price banner */}
                {planState !== 'C' && selectedPlan && (
                  <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold">Total Mensal:</span>
                    <span className="font-black text-gold-400 text-sm">{currencyFormatter.format(selectedPlan.price)}/mês</span>
                  </div>
                )}

                {/* Card Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Número do Cartão</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full bg-black/40 border border-border-dark rounded-xl pl-10 pr-4 py-3 text-xs text-white input-premium placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Card Holder Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nome Impresso no Cartão</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="EX: JOÃO A SILVA"
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-xs text-white input-premium placeholder-gray-600 focus:outline-none"
                  />
                </div>

                {/* Expiry & CVV Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Validade</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-xs text-white input-premium placeholder-gray-600 text-center focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">CVV</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={handleCvvChange}
                      placeholder="•••"
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-xs text-white input-premium placeholder-gray-600 text-center focus:outline-none"
                    />
                  </div>
                </div>

                {/* Secure info tag */}
                <div className="flex items-center gap-2 text-xs text-gray-500 justify-center py-1 select-none">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dados protegidos por criptografia SSL.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeSubscribeModal}
                  className="w-1/2 h-11 border border-border-dark rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 h-11 bg-gold-400 hover:bg-gold-500 text-black text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>{planState === 'C' ? 'Salvar' : 'Assinar'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CANCEL SUBSCRIPTION CONFIRMATION MODAL */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-in" onClick={() => setIsCancelOpen(false)}></div>

          <div className="bg-card-bg border border-border-dark w-full max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 p-6 space-y-4 animate-modal-in text-center max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-base">Cancelar Assinatura?</h4>
              <p className="text-xs text-gray-400 leading-relaxed text-left sm:text-center">
                Tem certeza que deseja cancelar sua assinatura do clube? Ao cancelar, você perderá cortes ilimitados grátis e seus agendamentos voltarão a ser cobrados pelo valor cheio.
              </p>
            </div>

            <div className="flex gap-3 pt-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCancelOpen(false)}
                className="w-1/2 h-11 border border-border-dark rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center btn-secondary"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                className="w-1/2 h-11 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center btn-danger"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
