import React, { useState } from 'react';
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
import { professionals } from '../data/mockData';

export default function Funcionarios({ appointments }) {
  const [selectedProf, setSelectedProf] = useState(null);
  const [payrollStatus, setPayrollStatus] = useState({}); // profId -> 'draft' | 'paid'
  const [receiptNumber, setReceiptNumber] = useState({}); // profId -> number

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
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center font-bold text-gold-400 text-lg shadow-inner">
                    {prof.initials}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{prof.name}</h4>
                    <p className="text-xs text-gray-400">{prof.specialty}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                  isPaid 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : isDraft
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}>
                  {isPaid ? 'Folha Paga' : isDraft ? 'Folha Gerada' : 'Aguardando Fechamento'}
                </span>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                
                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Concluídos</p>
                  <p className="text-lg font-bold text-white mt-1">{stats.totalCompleted}</p>
                </div>
                
                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Fatur. Bruto</p>
                  <p className="text-lg font-bold text-white mt-1">R$ {stats.grossRevenue.toFixed(0)}</p>
                </div>

                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl" title="Base de comissão = receita líquida após taxas de cartão">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Base Comis.</p>
                  <p className="text-lg font-bold text-gold-400 mt-1">R$ {stats.commissionBase.toFixed(0)}</p>
                </div>

                <div className="bg-black/30 border border-border-dark/60 p-3 rounded-xl" title="Comissão de 50% sobre o faturamento líquido">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Comissão (50%)</p>
                  <p className="text-lg font-extrabold text-gold-400 mt-1">R$ {stats.commission.toFixed(0)}</p>
                </div>

              </div>

              {/* Payment Methods Breakdown */}
              <div className="border-t border-border-dark/60 pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalhamento de Recebíveis</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold">Dinheiro</p>
                      <p className="font-bold text-white">R$ {stats.breakdown.cash.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <QrCode className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold">PIX</p>
                      <p className="font-bold text-white">R$ {stats.breakdown.pix.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold">Cartões (Bruto)</p>
                      <p className="font-bold text-white">R$ {stats.breakdown.cards.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
                
                {stats.cardFees > 0 && (
                  <p className="text-[10px] text-red-400 font-semibold mt-1">
                    * Taxas de cartão deduzidas: R$ {stats.cardFees.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>

              {/* Button */}
              <button
                type="button"
                onClick={() => handleGeneratePayroll(prof.id)}
                className={`mt-6 w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border ${
                  selectedProf === prof.id
                    ? 'bg-gold-400 text-black border-gold-400 btn-primary'
                    : 'bg-black/40 text-gold-400 border-gold-400/20 btn-secondary'
                }`}
              >
                <FileText className="w-4 h-4" />
                {isPaid ? 'Ver Recibo de Pagamento' : isDraft ? 'Ver Folha de Pagamento' : 'Gerar Folha de Pagamento'}
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
          <div className="bg-card-bg border border-border-dark rounded-2xl overflow-hidden max-w-2xl mx-auto shadow-2xl animate-modal-in">
            
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
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Colaborador</p>
                  <p className="text-base font-extrabold text-white mt-0.5">{prof.name}</p>
                  <p className="text-xs text-gray-400">{prof.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Status do Fechamento</p>
                  <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
                    isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {isPaid ? 'PAGO / LIQUIDADO' : 'AGUARDANDO PAGAMENTO'}
                  </span>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Discriminativo de Fechamento</p>
                <div className="border border-border-dark rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-black/30 p-2.5 font-bold text-gray-400 border-b border-border-dark">
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
                    className="flex-1 py-3 px-4 rounded-xl bg-gold-400 text-black text-xs font-bold flex items-center justify-center gap-2 btn-primary"
                  >
                    <Wallet className="w-4 h-4" />
                    Pagar Colaborador (R$ {stats.commission.toFixed(0)})
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

    </div>
  );
}
