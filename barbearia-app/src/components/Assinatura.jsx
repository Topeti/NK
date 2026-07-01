import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  X,
  BellRing,
  HelpCircle,
  FileText
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function Assinatura({ subClients, setSubClients }) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Ativa', 'Falha no pagamento', 'Cancelada', 'Pendente'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Details modal state
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailRender, setIsDetailRender] = useState(false);
  const [isDetailExiting, setIsDetailExiting] = useState(false);
 
  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastClient, setToastClient] = useState('');
 
  // Handle modal animation hooks
  useEffect(() => {
    if (isDetailOpen) {
      setIsDetailRender(true);
      setIsDetailExiting(false);
    } else if (isDetailRender) {
      setIsDetailExiting(true);
      const timer = setTimeout(() => {
        setIsDetailRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isDetailOpen, isDetailRender]);
 
  const handleOpenDetails = (client) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };
 
  const handleCloseDetails = () => {
    setIsDetailOpen(false);
  };
 
  const handleNotifyClient = (clientName) => {
    setToastClient(clientName);
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3500);
    return () => clearTimeout(timer);
  };

  // 1. Calculate dynamic statistics
  const totalActive = subClients.filter(c => c.status === 'Ativa').length;
  const totalFailed = subClients.filter(c => c.status === 'Falha no pagamento').length;
  const totalCanceled = subClients.filter(c => c.status === 'Cancelada').length;
  const totalPending = subClients.filter(c => c.status === 'Pendente').length;
  
  // MRR = sum of plan prices of active subscriptions
  const mrr = subClients
    .filter(c => c.status === 'Ativa')
    .reduce((sum, c) => sum + c.planPrice, 0);

  // 2. Filter subscriber list
  const filteredSubscribers = subClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          client.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Helper for status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ativa':
        return { label: 'Ativa', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'Falha no pagamento':
        return { label: 'Falha no Pgto', classes: 'bg-red-500/10 text-red-400 border-red-500/30' };
      case 'Cancelada':
        return { label: 'Cancelada', classes: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
      case 'Pendente':
        return { label: 'Pendente', classes: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' };
      default:
        return { label: status, classes: 'bg-white/5 text-gray-400 border-white/10' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Row with Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider select-none">
            Assinaturas
          </h2>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5 select-none">
            Dashboard administrativo de planos e receita recorrente
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Active */}
        <div className="bg-[#181818] border border-border-dark/60 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-2xl group-hover:bg-emerald-500/[0.04] transition-all duration-500"></div>
          <div className="flex justify-between items-start gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-wider select-none truncate">Ativas</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 sm:mt-2 tracking-tight truncate">{totalActive} Planos</h3>
              <div className="mt-2.5 sm:mt-3">
                <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none">
                  Funcionando
                </span>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-2.5 rounded-xl text-emerald-400 shrink-0 shadow-inner">
              <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Metric 2: Failures */}
        <div className="bg-[#181818] border border-border-dark/60 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/[0.02] rounded-full blur-2xl group-hover:bg-rose-500/[0.04] transition-all duration-500"></div>
          <div className="flex justify-between items-start gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-wider select-none truncate">Falha no Pagamento</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 sm:mt-2 tracking-tight truncate">{totalFailed} Contas</h3>
              <div className="mt-2.5 sm:mt-3">
                <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 select-none">
                  Requer Atenção
                </span>
              </div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 p-2 sm:p-2.5 rounded-xl text-red-400 shrink-0 shadow-inner">
              <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Metric 3: Canceled */}
        <div className="bg-[#181818] border border-border-dark/60 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.005] rounded-full blur-2xl group-hover:bg-white/[0.02] transition-all duration-500"></div>
          <div className="flex justify-between items-start gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-wider select-none truncate">Canceladas</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 sm:mt-2 tracking-tight truncate">{totalCanceled} Contas</h3>
              <div className="mt-2.5 sm:mt-3">
                <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/10 select-none">
                  Inativas
                </span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-2 sm:p-2.5 rounded-xl text-gray-400 shrink-0 shadow-inner">
              <XCircle className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Metric 4: MRR */}
        <div className="bg-[#181818] border border-border-dark/60 p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-gold-400/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/[0.02] rounded-full blur-2xl group-hover:bg-gold-400/[0.04] transition-all duration-500"></div>
          <div className="flex justify-between items-start gap-2 relative z-10">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-wider select-none truncate">MRR (Rec. Recorrente)</p>
              <h3 className="text-lg sm:text-xl font-black text-gold-400 mt-1.5 sm:mt-2 tracking-tight truncate">
                {currencyFormatter.format(mrr)}
              </h3>
              <div className="mt-2.5 sm:mt-3">
                <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-gold-400/10 text-gold-400 border border-gold-400/20 select-none">
                  Faturamento
                </span>
              </div>
            </div>
            <div className="bg-gold-400/10 border border-gold-400/20 p-2 sm:p-2.5 rounded-xl text-gold-400 shrink-0 shadow-inner">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card-bg border border-border-dark p-4 md:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          
          {/* Search Input */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar cliente ou plano..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-border-dark rounded-xl pl-10 pr-4 py-2.5 text-base md:text-sm text-white input-premium placeholder-gray-600 focus:outline-none"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 select-none">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer h-10 flex items-center gap-1.5 active:scale-97 hover:scale-[1.02] ${
                filterStatus === 'all'
                  ? 'bg-gold-400/10 border-gold-400 text-gold-400 shadow-[0_0_15px_rgba(212,168,67,0.15)] font-black'
                  : 'bg-black/40 text-gray-500 border-border-dark hover:text-gray-300 hover:border-white/10'
              }`}
            >
              Todas ({subClients.length})
            </button>
            <button
              onClick={() => setFilterStatus('Ativa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 active:scale-97 hover:scale-[1.02] ${
                filterStatus === 'Ativa'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black'
                  : 'bg-black/40 text-gray-500 border-border-dark hover:text-gray-300 hover:border-white/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${filterStatus === 'Ativa' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              Ativas ({totalActive})
            </button>
            <button
              onClick={() => setFilterStatus('Falha no pagamento')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 active:scale-97 hover:scale-[1.02] ${
                filterStatus === 'Falha no pagamento'
                  ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)] font-black'
                  : 'bg-black/40 text-gray-500 border-border-dark hover:text-gray-300 hover:border-white/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${filterStatus === 'Falha no pagamento' ? 'bg-rose-400 animate-pulse' : 'bg-gray-500'}`} />
              Falhas ({totalFailed})
            </button>
            <button
              onClick={() => setFilterStatus('Cancelada')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 active:scale-97 hover:scale-[1.02] ${
                filterStatus === 'Cancelada'
                  ? 'bg-white/10 border-white/40 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] font-black'
                  : 'bg-black/40 text-gray-500 border-border-dark hover:text-gray-300 hover:border-white/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${filterStatus === 'Cancelada' ? 'bg-white' : 'bg-gray-500'}`} />
              Canceladas ({totalCanceled})
            </button>
            <button
              onClick={() => setFilterStatus('Pendente')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 active:scale-97 hover:scale-[1.02] ${
                filterStatus === 'Pendente'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-black'
                  : 'bg-black/40 text-gray-500 border-border-dark hover:text-gray-300 hover:border-white/10'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${filterStatus === 'Pendente' ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
              Pendentes ({totalPending})
            </button>
          </div>

        </div>
      </div>

      {/* Responsive List View */}
      {/* 1. Desktop Table */}
      <div className="hidden md:block overflow-hidden border border-border-dark rounded-2xl bg-card-bg shadow-lg">
        <table className="w-full border-collapse text-left table-fixed">
          <thead>
            <tr className="border-b border-border-dark bg-black/20 text-gray-400 font-bold text-xs select-none">
              <th className="p-4 w-[240px]">Assinante</th>
              <th className="p-4">Plano</th>
              <th className="p-4 w-[110px] hidden xl:table-cell">Valor</th>
              <th className="p-4 w-[130px]">Status</th>
              <th className="p-4 w-[150px] hidden lg:table-cell">Próxima Cobrança</th>
              <th className="p-4 w-[120px] text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/60 text-xs md:text-sm">
            {filteredSubscribers.map((client) => {
              const badgeInfo = getStatusBadge(client.status);
              const isFailedRow = client.status === 'Falha no pagamento';
              
              return (
                <tr key={client.id} className="hover:bg-white/[0.01] transition-colors duration-150">
                  {/* Name column with avatar */}
                  <td className={`p-4 ${isFailedRow ? 'border-l-4 border-l-red-500 pl-3' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-xs font-bold text-gold-400 select-none shrink-0">
                        {client.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{client.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Plan Name */}
                  <td className="p-4">
                    <p className="font-semibold text-gray-200 truncate">{client.planName}</p>
                  </td>
                  
                  {/* Plan Value */}
                  <td className="p-4 hidden xl:table-cell">
                    <p className="font-bold text-white">
                      {currencyFormatter.format(client.planPrice)}
                      <span className="text-xs text-gray-500 font-normal">/mês</span>
                    </p>
                  </td>
                  
                  {/* Status Badge */}
                  <td className="p-4">
                    <span className={`inline-block text-xs font-extrabold px-2.5 py-1 rounded-full uppercase border select-none whitespace-nowrap shrink-0 ${badgeInfo.classes}`}>
                      {badgeInfo.label}
                    </span>
                  </td>
                  
                  {/* Next Billing/Cancellation date */}
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-gray-300 font-medium">
                      {client.status === 'Cancelada' ? (
                        <span className="text-red-400/80">
                          Cancelado em {client.cancellationDate}
                        </span>
                      ) : (
                        client.nextBilling || '-'
                      )}
                    </span>
                  </td>
                  
                  {/* Details Button */}
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(client)}
                      className="bg-black/30 border border-border-dark text-xs font-bold px-3 py-1.5 rounded-lg text-gold-400 hover:text-white hover:bg-white/5 active:scale-97 transition-all duration-200 btn-secondary cursor-pointer h-10 flex items-center justify-center inline-flex"
                    >
                      Ver detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Stacked Cards */}
      <div className="md:hidden space-y-4">
        {filteredSubscribers.map((client) => {
          const badgeInfo = getStatusBadge(client.status);
          
          return (
            <div 
              key={client.id}
              className="bg-[#181818] border border-border-dark p-5 rounded-2xl flex flex-col justify-between space-y-4 card-premium relative overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              {/* Card decorative mesh */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-white/[0.03] transition-all duration-500"></div>
              
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-xs font-black text-gold-400 select-none shrink-0 shadow-inner">
                    {client.initials}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-white text-sm truncate leading-tight">{client.name}</h5>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{client.email}</p>
                  </div>
                </div>
                
                <span className={`inline-block text-[9px] font-black px-2.5 py-1 rounded-full uppercase border shrink-0 tracking-wider ${badgeInfo.classes}`}>
                  {badgeInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-black/25 border border-border-dark/40 rounded-xl p-3">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">Plano</p>
                  <p className="text-gray-200 mt-0.5 font-bold text-xs truncate">{client.planName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">Mensalidade</p>
                  <p className="text-gold-400 mt-0.5 font-black text-xs">{currencyFormatter.format(client.planPrice)}</p>
                </div>
                <div className="col-span-2 border-t border-border-dark/30 pt-2 mt-1">
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">
                    {client.status === 'Cancelada' ? 'Cancelamento' : 'Próximo Vencimento'}
                  </p>
                  <p className={`mt-0.5 font-bold text-xs ${client.status === 'Cancelada' ? 'text-rose-400' : 'text-gray-300'}`}>
                    {client.status === 'Cancelada' ? client.cancellationDate : client.nextBilling || '-'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenDetails(client)}
                className="w-full py-3 bg-gold-400/5 hover:bg-gold-400/10 border border-gold-400/20 hover:border-gold-400/40 text-xs font-bold rounded-xl text-gold-400 flex items-center justify-center gap-1.5 active:scale-98 transition-all duration-200 cursor-pointer h-11"
              >
                <span>Ver detalhes da assinatura</span>
              </button>
            </div>
          );
        })}
      </div>

      {filteredSubscribers.length === 0 && (
        <div className="text-center py-12 bg-card-bg border border-border-dark rounded-2xl">
          <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">Nenhum assinante encontrado com os filtros aplicados.</p>
        </div>
      )}

      {/* DETAILS MODAL */}
      {isDetailRender && selectedClient && (() => {
        const client = selectedClient;
        const isFailed = client.status === 'Falha no pagamento';
        const isCanceled = client.status === 'Cancelada';
        
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div 
              className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${
                isDetailExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
              }`} 
              onClick={handleCloseDetails}
            ></div>
            
            {/* Modal Box */}
            <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col ${
              isDetailExiting ? 'animate-modal-out' : 'animate-modal-in'
            }`}>
              
              {/* Header */}
              <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-sm font-bold text-gold-400 select-none">
                    {client.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white truncate max-w-[240px]">{client.name}</h3>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ficha do Assinante</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
                
                {/* Status-specific warning banners */}
                {isFailed && (
                  <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-red-400 uppercase tracking-wide">Cobrança Rejeitada</p>
                        <p className="text-gray-300 mt-1">Motivo: {client.failureReason}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotifyClient(client.name)}
                      className="w-full py-2.5 px-3 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/10 h-10"
                    >
                      <BellRing className="w-3.5 h-3.5 whitespace-nowrap shrink-0" />
                      <span>Notificar cliente por WhatsApp</span>
                    </button>
                  </div>
                )}

                {isCanceled && (
                  <div className="p-4 bg-gray-500/5 border border-border-dark rounded-xl text-xs space-y-1">
                    <p className="font-bold text-gray-400 uppercase tracking-wide">Plano Cancelado</p>
                    <p className="text-gray-300">{client.cancellationReason}</p>
                    <p className="text-gray-500 text-[10px]">Data de desativação: {client.cancellationDate}</p>
                  </div>
                )}

                {/* Subscriptions Info Details */}
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Informações da Assinatura</p>
                  <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5 text-xs">
                    <div>
                      <p className="text-gray-500">Plano Selecionado</p>
                      <p className="font-bold text-white mt-0.5">{client.planName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor Mensal</p>
                      <p className="font-bold text-gold-400 mt-0.5">{currencyFormatter.format(client.planPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Forma de Pagamento</p>
                      <div className="flex items-center gap-1 mt-0.5 text-white">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">Card final •••• {client.cardLast4}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Método Operador</p>
                      <p className="font-medium text-white mt-0.5">{client.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Client Contact Info */}
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Contato do Cliente</p>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Histórico de Faturas</p>
                  {client.history && client.history.length > 0 ? (
                    <div className="border border-border-dark rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-3 bg-black/30 p-2.5 font-bold text-gray-400 border-b border-border-dark select-none">
                        <span>Data</span>
                        <span className="text-center">Valor</span>
                        <span className="text-right">Status</span>
                      </div>
                      {client.history.map((log) => (
                        <div key={log.id} className="grid grid-cols-3 p-2.5 border-b border-border-dark/60 last:border-b-0 text-gray-300">
                          <span>{log.date}</span>
                          <span className="text-center font-semibold text-white">{currencyFormatter.format(log.amount)}</span>
                          <span className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              log.status === 'Pago'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {log.status}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-border-dark rounded-xl text-center text-xs text-gray-500">
                      Nenhuma cobrança registrada neste ciclo.
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="w-full py-3 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary cursor-pointer hover:bg-white/5 transition-colors h-11"
                >
                  Fechar Painel
                </button>
              </div>

            </div>
          </div>
        );
      })()}
 
      {/* Toast de Sucesso */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center gap-3.5 backdrop-blur-md shadow-[0_4px_25px_rgba(16,185,129,0.2)] animate-backdrop-in max-w-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
          <div className="text-xs">
            <p className="font-black uppercase tracking-wider text-[10px]">Aviso Enviado</p>
            <p className="text-gray-300 mt-0.5 font-bold leading-normal">
              Notificação de cobrança enviada para <strong className="text-white">{toastClient}</strong> via WhatsApp com sucesso!
            </p>
          </div>
        </div>
      )}
 
    </div>
  );
}
