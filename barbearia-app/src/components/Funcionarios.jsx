import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  FileText,
  Wallet,
  CheckCircle,
  CreditCard,
  QrCode,
  Coins,
  Receipt,
  Download
} from 'lucide-react';

export default function Funcionarios({ appointments, setAppointments, professionals, setProfessionals }) {
  const [selectedProf, setSelectedProf] = useState(null);
  const [payrollStatus, setPayrollStatus] = useState({}); // profId -> 'draft' | 'paid'
  const [receiptNumber, setReceiptNumber] = useState({}); // profId -> number
  const payrollRef = useRef(null);

  // Add Professional Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddRender, setIsAddRender] = useState(false);
  const [isAddExiting, setIsAddExiting] = useState(false);

  const [newProf, setNewProf] = useState({
    name: ''
  });

  // Remove Professional Modal State
  const [profToRemove, setProfToRemove] = useState(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isRemoveRender, setIsRemoveRender] = useState(false);
  const [isRemoveExiting, setIsRemoveExiting] = useState(false);

  // Handle Add Modal open/close animation
  useEffect(() => {
    if (isAddOpen) {
      setIsAddRender(true);
      setIsAddExiting(false);
    } else if (isAddRender) {
      setIsAddExiting(true);
      const timer = setTimeout(() => {
        setIsAddRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isAddOpen, isAddRender]);

  // Handle Remove Modal open/close animation
  useEffect(() => {
    if (isRemoveOpen) {
      setIsRemoveRender(true);
      setIsRemoveExiting(false);
    } else if (isRemoveRender) {
      setIsRemoveExiting(true);
      const timer = setTimeout(() => {
        setIsRemoveRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isRemoveOpen, isRemoveRender]);

  const handleAddConfirm = (e) => {
    e.preventDefault();
    if (!newProf.name.trim()) return;

    // Auto-generate initials from full name
    const parts = newProf.name.trim().split(/\s+/);
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();

    const createdProf = {
      id: newProf.name.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newProf.name.trim(),
      specialty: 'Barbeiro',
      initials: initials.substring(0, 2)
    };

    setProfessionals(prev => [...prev, createdProf]);
    setNewProf({ name: '' });
    setIsAddOpen(false);
  };

  const handleInitiateRemove = (prof) => {
    setProfToRemove(prof);
    setIsRemoveOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (!profToRemove) return;

    // 1. Remove professional
    setProfessionals(prev => prev.filter(p => p.id !== profToRemove.id));

    // 2. Remove all pending/confirmed appointments for this professional
    setAppointments(prev => prev.filter(app => {
      // Keep completed or cancelled appointments, but remove others
      if (app.professionalId === profToRemove.id) {
        return app.status === 'Concluído' || app.status === 'Cancelado';
      }
      return true;
    }));

    // Reset payroll selection if this professional was selected
    if (selectedProf === profToRemove.id) {
      setSelectedProf(null);
    }

    setIsRemoveOpen(false);
    setProfToRemove(null);
  };

  // Compute dynamic stats for each professional
  const getProfStats = (profId) => {
    const profApps = appointments.filter(app => app.professionalId === profId && app.status === 'Concluído');

    const totalCompleted = profApps.length;
    const grossRevenue = profApps.reduce((sum, app) => sum + app.price, 0);
    const commissionBase = profApps.reduce((sum, app) => sum + app.netAmount, 0);
    const commission = parseFloat((commissionBase * 0.5).toFixed(2));

    const cash = profApps.filter(app => app.paymentMethod === 'Dinheiro').reduce((sum, app) => sum + app.price, 0);
    const pix = profApps.filter(app => app.paymentMethod === 'PIX').reduce((sum, app) => sum + app.price, 0);
    const debit = profApps.filter(app => app.paymentMethod === 'Débito').reduce((sum, app) => sum + app.price, 0);
    const credit = profApps.filter(app => app.paymentMethod === 'Crédito').reduce((sum, app) => sum + app.price, 0);
    const cardFees = profApps.reduce((sum, app) => sum + app.fee, 0);

    return {
      totalCompleted,
      grossRevenue,
      commissionBase,
      commission,
      cardFees,
      breakdown: {
        cash,
        pix,
        cards: debit + credit,
        debit,
        credit
      }
    };
  };

  const handleGeneratePayroll = (profId) => {
    setSelectedProf(profId);
    if (!payrollStatus[profId]) {
      setPayrollStatus(prev => ({ ...prev, [profId]: 'draft' }));
    }
    // Scroll to payroll section after state settles
    setTimeout(() => {
      payrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handlePaySalary = (profId) => {
    setPayrollStatus(prev => ({ ...prev, [profId]: 'paid' }));
    setReceiptNumber(prev => ({ ...prev, [profId]: Math.floor(100000 + Math.random() * 900000) }));
  };

  return (
    <div className="space-y-8">
      {/* Top Header Row with Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider select-none">
            Funcionários
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 select-none">
            Comissão, produção e fechamento de folha de pagamento
          </p>
        </div>

        {/* Add Employee Button */}
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-gold-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 btn-primary self-start md:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Novo Colaborador
        </button>
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {professionals.map((prof) => {
          const stats = getProfStats(prof.id);
          const isPaid = payrollStatus[prof.id] === 'paid';
          const isDraft = payrollStatus[prof.id] === 'draft';

          return (
            <div key={prof.id} className="bg-card-bg border border-border-dark p-6 rounded-2xl flex flex-col justify-between card-premium">

              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 sm:gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center font-bold text-gold-400 text-lg shadow-inner shrink-0">
                    {prof.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-white tracking-tight truncate">{prof.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{prof.specialty || 'Barbeiro'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-start">
                  <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-full uppercase border ${isPaid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isDraft
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}>
                    {isPaid ? 'Folha Paga' : isDraft ? 'Folha Gerada' : 'Aguardando Fechamento'}
                  </span>

                  {/* Premium Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleInitiateRemove(prof)}
                    className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-inner shrink-0"
                    title="Remover Colaborador"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">

                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Concluídos</p>
                  <p className="text-lg font-bold text-white mt-1">{stats.totalCompleted}</p>
                </div>

                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Fatur. Bruto</p>
                  <p className="text-lg font-bold text-white mt-1">R$ {stats.grossRevenue.toFixed(2).replace('.', ',')}</p>
                </div>

                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl" title="Base de comissão = receita líquida após taxas de cartão">
                  <p className="text-xs text-gray-500 uppercase font-bold">Base Comis.</p>
                  <p className="text-lg font-bold text-gold-400 mt-1">R$ {stats.commissionBase.toFixed(2).replace('.', ',')}</p>
                </div>

                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl" title="Comissão de 50% sobre o faturamento líquido">
                  <p className="text-xs text-gray-500 uppercase font-bold">Comissão (50%)</p>
                  <p className="text-lg font-extrabold text-gold-400 mt-1">R$ {stats.commission.toFixed(2).replace('.', ',')}</p>
                </div>

              </div>

              {/* Payment Methods Breakdown */}
              <div className="border-t border-border-dark/60 pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalhamento de Recebíveis</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Dinheiro</p>
                      <p className="font-bold text-white">R$ {stats.breakdown.cash.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <QrCode className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">PIX</p>
                      <p className="font-bold text-white">R$ {stats.breakdown.pix.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Cartões (Bruto)</p>
                      <p className="font-bold text-white">R$ {stats.breakdown.cards.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>

                {stats.cardFees > 0 && (
                  <p className="text-xs text-red-400 font-semibold mt-1">
                    * Taxas de cartão deduzidas: R$ {stats.cardFees.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>

              {/* Button */}
              <button
                type="button"
                onClick={() => handleGeneratePayroll(prof.id)}
                className={`mt-6 w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${selectedProf === prof.id
                    ? 'bg-gold-400 text-black border-gold-400 btn-primary'
                    : 'bg-black/40 text-gold-400 border-gold-400/20 btn-secondary'
                  }`}
              >
                <FileText className="w-4 h-4" />
                {isPaid ? 'Ver Recibo' : isDraft ? 'Ver Folha' : 'Gerar Folha'}
              </button>

            </div>
          );
        })}
      </div>

      {/* Payroll receipt preview */}
      {selectedProf && (() => {
        const prof = professionals.find(p => p.id === selectedProf);
        const stats = getProfStats(selectedProf);
        const isPaid = payrollStatus[selectedProf] === 'paid';

        return (
          <div ref={payrollRef} className="scroll-mt-4 bg-card-bg border border-border-dark rounded-2xl overflow-hidden max-w-2xl mx-auto shadow-2xl animate-modal-in">

            {/* Ticket Header */}
            <div className="p-6 bg-black/40 border-b border-border-dark flex justify-between items-center relative">
              {/* Decorative side ticket notches */}
              <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-dark-bg border-r border-border-dark"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-dark-bg border-l border-border-dark"></div>

              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6 text-gold-400" />
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-wider uppercase">Folha Demonstrativa</h4>
                  <p className="text-[10px] text-gray-500">Unidade Jardins • Corleone</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400">FECHAMENTO</p>
                <p className="text-xs text-white">Período Semanal</p>
              </div>
            </div>

            {/* Ticket Invoice Body */}
            <div className="p-6 space-y-6 relative">
              {/* Notches container */}
              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-dark-bg border-r border-border-dark"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-dark-bg border-l border-border-dark"></div>

              {/* Employee Summary */}
              <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Colaborador</p>
                  <p className="text-base font-extrabold text-white mt-0.5">{prof.name}</p>
                  <p className="text-xs text-gray-400">{prof.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Status do Fechamento</p>
                  <span className={`inline-block text-xs font-extrabold px-2 py-0.5 rounded-full mt-1 ${isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                    {isPaid ? 'PAGO / LIQUIDADO' : 'AGUARDANDO PAGAMENTO'}
                  </span>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Discriminativo de Fechamento</p>
                <div className="border border-border-dark rounded-xl overflow-x-auto scrollbar-none text-xs">
                  <div className="min-w-[450px]">
                    <div className="grid grid-cols-3 bg-black/30 p-2.5 font-bold text-gray-400 border-b border-border-dark select-none">
                      <span>Item</span>
                      <span className="text-right">Cálculo Base</span>
                      <span className="text-right">Total Acumulado</span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5 text-gray-300 border-b border-border-dark/60">
                      <span>Produção Bruta</span>
                      <span className="text-right">{stats.totalCompleted} serviços concluídos</span>
                      <span className="text-right font-medium text-white">R$ {stats.grossRevenue.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5 text-gray-300 border-b border-border-dark/60">
                      <span>Taxas de Cartão</span>
                      <span className="text-right">Dedução administrativa</span>
                      <span className="text-right text-red-400">- R$ {stats.cardFees.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5 text-gray-300 border-b border-border-dark/60">
                      <span>Base de Comissão</span>
                      <span className="text-right">Faturamento Líquido</span>
                      <span className="text-right font-medium text-emerald-400">R$ {stats.commissionBase.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="grid grid-cols-3 p-2.5 text-gold-400 bg-gold-400/5 font-bold">
                      <span>Comissão Final</span>
                      <span className="text-right">Taxa de repasse: 50%</span>
                      <span className="text-right">R$ {stats.commission.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt details if Paid */}
              {isPaid && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Pagamento Liquidado com Sucesso</span>
                  </div>
                  <p className="text-gray-400 mt-1">
                    Demonstrativo liquidado eletronicamente e transferido para a carteira vinculada do colaborador.
                  </p>
                  <div className="text-[10px] text-gray-500 pt-1 flex justify-between">
                    <span>Comprovante: #{receiptNumber[prof.id]}</span>
                    <span>Tipo: Transferência Interna</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProf(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-semibold text-gray-400 btn-secondary"
                >
                  Fechar Visualização
                </button>

                {!isPaid ? (
                  <button
                    type="button"
                    onClick={() => handlePaySalary(prof.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gold-400 text-black text-xs font-bold flex flex-col items-center justify-center gap-0.5 btn-primary min-h-[48px]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 shrink-0" />
                      <span>Pagar Colaborador</span>
                    </span>
                    <span className="text-[10px] font-black opacity-80">R$ {stats.commission.toFixed(2).replace('.', ',')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert('PDF gerado com sucesso! (Simulação de download)')}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 btn-secondary"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Recibo PDF
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL: Adicionar Colaborador */}
      {isAddRender && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isAddExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
              }`}
            onClick={() => setIsAddOpen(false)}
          ></div>
          <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col ${isAddExiting ? 'animate-modal-out' : 'animate-modal-in'
            }`}>
            <form onSubmit={handleAddConfirm} className="flex flex-col max-h-[90vh]">

              <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Novo Colaborador</h3>
                  <p className="text-xs text-gray-400 mt-1">Adicione um novo barbeiro ao time.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">

                {/* Name Input */}
                <div className="flex flex-col-reverse gap-1.5">
                  <input
                    type="text"
                    required
                    id="profName"
                    placeholder="Ex: Lucas Ferreira"
                    value={newProf.name}
                    onChange={(e) => setNewProf(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer text-left"
                  />
                  <label htmlFor="profName" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Nome Completo</label>
                </div>

              </div>

              <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary cursor-pointer hover:bg-white/5 transition-colors h-11"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gold-400 text-black text-xs font-bold btn-primary cursor-pointer hover:bg-gold-500 transition-colors h-11"
                >
                  Confirmar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Remover Colaborador (Confirmação) */}
      {isRemoveRender && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${isRemoveExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
              }`}
            onClick={() => setIsRemoveOpen(false)}
          ></div>
          <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col ${isRemoveExiting ? 'animate-modal-out' : 'animate-modal-in'
            }`}>

            <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Aviso de Remoção</h3>
                  <p className="text-xs text-gray-400 mt-1">Confirmar o desligamento do profissional.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRemoveOpen(false)}
                className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <p className="text-sm text-gray-300">
                Tem certeza que deseja remover o colaborador <strong>{profToRemove?.name}</strong>?
              </p>

              <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl text-xs space-y-2">
                <p className="font-bold text-red-400">Impactos no sistema:</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                  <li>
                    Todos os <strong>agendamentos pendentes ou confirmados</strong> de {profToRemove?.name} na agenda serão removidos automaticamente.
                  </li>
                  <li>
                    Agendamentos já <strong>concluídos</strong> no passado serão preservados para fins de relatórios e faturamento no Dashboard.
                  </li>
                  <li>
                    O colaborador não estará mais disponível para novas marcações.
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsRemoveOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary cursor-pointer hover:bg-white/5 transition-colors h-11"
              >
                Manter Funcionário
              </button>
              <button
                type="button"
                onClick={handleRemoveConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-bold btn-danger cursor-pointer hover:bg-red-700 transition-colors h-11"
              >
                Remover e Atualizar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
