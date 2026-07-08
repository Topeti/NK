import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Award, 
  Percent, 
  CalendarDays, 
  DollarSign, 
  ChevronRight, 
  Users,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart, 
  Area
} from 'recharts';
import { getWeekDates, monthlyRevenueData, dailyRevenue } from '../data/mockData';

export default function Metas({ 
  appointments = [], 
  professionals = [], 
  goals = [], 
  setGoals, 
  viewRole 
}) {
  const [activePeriod, setActivePeriod] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Modals state
  const [newGoal, setNewGoal] = useState({
    level: 'general',
    professionalId: '',
    type: 'revenue',
    value: '',
    period: 'weekly'
  });

  const isEmployee = viewRole.startsWith('employee-');
  const employeeId = isEmployee ? viewRole.replace('employee-', '') : null;
  const currentEmployee = isEmployee ? professionals.find(p => p.id === employeeId) : null;

  // Filter goals to show
  const filteredGoals = goals.filter(goal => {
    // Filter by period
    if (goal.period !== activePeriod) return false;
    
    // If employee, only show general goals or goals assigned to them
    if (isEmployee) {
      return goal.level === 'general' || (goal.level === 'employee' && goal.professionalId === employeeId);
    }
    return true;
  });

  // Today Date simulation details (same as Dashboard.jsx)
  const weekDates = getWeekDates();
  const todayDateStr = weekDates['Fri'].dateStr; // Friday is simulated today

  // Calculate elapsed time in the period
  const getElapsedPercent = () => {
    const now = new Date();
    if (activePeriod === 'daily') {
      // Work hours 08:00 to 20:00 (12 hours)
      const currentH = now.getHours();
      if (currentH < 8) return 0;
      if (currentH >= 20) return 100;
      return Math.round(((currentH - 8) / 12) * 100);
    } else if (activePeriod === 'weekly') {
      // simulated Friday = 5th day of 7
      return Math.round((5 / 7) * 100);
    } else {
      // simulated day 8 of July
      return Math.round((8 / 31) * 100);
    }
  };

  const elapsedPercent = getElapsedPercent();

  // Dynamic calculations based on appointments
  const getGoalProgress = (goal) => {
    // 1. Filter appointments for this period
    let periodApps = [];
    if (goal.period === 'daily') {
      periodApps = appointments.filter(app => app.date === todayDateStr);
    } else if (goal.period === 'weekly') {
      const dates = Object.values(weekDates).map(d => d.dateStr);
      periodApps = appointments.filter(app => dates.includes(app.date));
    } else {
      // Monthly: current month (simulated July 2026 -> 2026-07)
      const currentYearMonth = todayDateStr.substring(0, 7);
      periodApps = appointments.filter(app => app.date.startsWith(currentYearMonth));
    }

    // 2. Filter by level / employee
    if (goal.level === 'employee') {
      periodApps = periodApps.filter(app => app.professionalId === goal.professionalId);
    }

    // 3. Compute metric value
    if (goal.type === 'revenue') {
      const completedApps = periodApps.filter(app => app.status === 'Concluído');
      const appRev = completedApps.reduce((sum, app) => sum + app.price, 0);
      
      // Add baseline revenues for realistic mock values
      let baseline = 0;
      if (goal.level === 'general') {
        if (goal.period === 'daily') baseline = 350;
        else if (goal.period === 'weekly') baseline = 2800;
        else baseline = 12000;
      } else {
        if (goal.period === 'daily') baseline = 150;
        else if (goal.period === 'weekly') baseline = 1200;
        else baseline = 5000;
      }
      return appRev + baseline;
    } else if (goal.type === 'appointments') {
      const completedCount = periodApps.filter(app => app.status === 'Concluído').length;
      let baseline = 0;
      if (goal.level === 'general') {
        if (goal.period === 'daily') baseline = 6;
        else if (goal.period === 'weekly') baseline = 38;
        else baseline = 150;
      } else {
        if (goal.period === 'daily') baseline = 3;
        else if (goal.period === 'weekly') baseline = 18;
        else baseline = 70;
      }
      return completedCount + baseline;
    } else if (goal.type === 'occupancy') {
      // Calculate active hours occupancy
      const activeApps = periodApps.filter(app => app.status !== 'Cancelado');
      const totalMinutes = activeApps.reduce((sum, app) => sum + app.duration, 0);
      
      let capacity = 300; // minutes
      if (goal.level === 'general') {
        const numProfs = professionals.length || 2;
        let baseCap = 300 * numProfs;
        if (goal.period === 'weekly') baseCap = baseCap * 5;
        else if (goal.period === 'monthly') baseCap = baseCap * 22;
        capacity = baseCap;
      } else {
        let baseCap = goal.professionalId === 'nicolas' ? 338 : goal.professionalId === 'gustavo' ? 262 : 300;
        if (goal.period === 'weekly') baseCap = baseCap * 5;
        else if (goal.period === 'monthly') baseCap = baseCap * 22;
        capacity = baseCap;
      }
      
      return Math.min(100, Math.round((totalMinutes / capacity) * 100));
    }
    return 0;
  };

  const handleAddOrEditGoal = (e) => {
    e.preventDefault();
    if (!newGoal.value || isNaN(newGoal.value)) return;

    const valueNum = parseFloat(newGoal.value);

    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? { 
        ...g, 
        level: newGoal.level,
        professionalId: newGoal.level === 'employee' ? newGoal.professionalId : undefined,
        type: newGoal.type,
        value: valueNum,
        period: newGoal.period
      } : g));
      setEditingGoal(null);
    } else {
      const createdGoal = {
        id: `goal-${Date.now()}`,
        level: newGoal.level,
        professionalId: newGoal.level === 'employee' ? (newGoal.professionalId || professionals[0]?.id) : undefined,
        type: newGoal.type,
        value: valueNum,
        period: newGoal.period
      };
      setGoals(prev => [...prev, createdGoal]);
    }

    setIsAddOpen(false);
    setNewGoal({
      level: 'general',
      professionalId: '',
      type: 'revenue',
      value: '',
      period: activePeriod
    });
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      level: goal.level,
      professionalId: goal.professionalId || '',
      type: goal.type,
      value: goal.value.toString(),
      period: goal.period
    });
    setIsAddOpen(true);
  };

  const handleDeleteClick = (goalId) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      setGoals(prev => prev.filter(g => g.id !== goalId));
    }
  };

  // Recharts Chart Data generator based on metric types
  const getChartData = () => {
    if (activePeriod === 'daily') {
      return dailyRevenue.map(d => ({
        name: d.day,
        value: d.total
      }));
    } else if (activePeriod === 'weekly') {
      return dailyRevenue.map(d => ({
        name: d.day,
        value: d.total * 1.2
      }));
    } else {
      return monthlyRevenueData.map(m => ({
        name: m.month,
        value: m.total
      }));
    }
  };

  const chartData = getChartData();

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
            Gestão de Metas
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
            Metas automáticas baseadas em atendimentos, faturamento e ocupação
          </p>
        </div>

        <div className="flex items-center gap-3 self-center md:self-auto">
          {/* Period Toggle */}
          <div className="bg-card-bg border border-border-dark p-1 rounded-xl flex gap-1 shadow-inner relative h-10 w-60">
            {['daily', 'weekly', 'monthly'].map((p) => {
              const labelMap = { daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal' };
              const isActive = activePeriod === p;
              return (
                <button
                  key={p}
                  onClick={() => {
                    setActivePeriod(p);
                    setNewGoal(prev => ({ ...prev, period: p }));
                  }}
                  className={`relative z-10 flex-1 flex items-center justify-center rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-black bg-gold-400 shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {labelMap[p]}
                </button>
              );
            })}
          </div>

          {/* Add Button - Admin only */}
          {!isEmployee && (
            <button
              onClick={() => {
                setEditingGoal(null);
                setNewGoal({
                  level: 'general',
                  professionalId: professionals[0]?.id || '',
                  type: 'revenue',
                  value: '',
                  period: activePeriod
                });
                setIsAddOpen(true);
              }}
              className="bg-gold-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 btn-primary shrink-0 cursor-pointer h-10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nova Meta
            </button>
          )}
        </div>
      </div>

      {/* Simulated Time elapsed Pace Indicator Box */}
      <div className="bg-card-bg border border-border-dark p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 card-premium">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ritmo do Período ({activePeriod === 'daily' ? 'Hoje' : activePeriod === 'weekly' ? 'Semana' : 'Mês'})</h4>
            <p className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">Tempo decorrido aproximado no ciclo comercial</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
          <div className="flex-1 sm:w-48 bg-black/40 h-2.5 rounded-full border border-border-dark overflow-hidden">
            <div className="bg-gold-400 h-full rounded-full transition-all duration-500" style={{ width: `${elapsedPercent}%` }} />
          </div>
          <span className="text-sm font-black text-gold-400 min-w-[36px] text-right">{elapsedPercent}%</span>
        </div>
      </div>

      {/* Goals Listing grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* General Goals Card */}
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border-dark/60">
            <Target className="w-5 h-5 text-gold-400" />
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Metas da Barbearia (Gerais)</h3>
          </div>

          <div className="space-y-6">
            {filteredGoals.filter(g => g.level === 'general').length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs font-medium uppercase tracking-wider">
                Nenhuma meta geral definida para este período.
              </div>
            ) : (
              filteredGoals.filter(g => g.level === 'general').map(goal => {
                const currentVal = getGoalProgress(goal);
                const pct = goal.value > 0 ? Math.min(100, Math.round((currentVal / goal.value) * 100)) : 0;
                
                // Pacing status calculation
                const onPace = pct >= elapsedPercent;

                return (
                  <div key={goal.id} className="space-y-2 border border-border-dark/40 bg-black/10 p-4 rounded-xl relative hover:border-gold-400/20 transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase text-gold-400 tracking-widest bg-gold-400/5 px-2 py-0.5 rounded border border-gold-400/10">
                          {goal.type === 'revenue' ? 'Faturamento' : goal.type === 'appointments' ? 'Atendimentos' : 'Taxa de Ocupação'}
                        </span>
                        
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-lg font-black text-white">
                            {goal.type === 'revenue' ? `R$ ${currentVal.toFixed(2).replace('.', ',')}` : goal.type === 'occupancy' ? `${currentVal}%` : `${currentVal} serv.`}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            de {goal.type === 'revenue' ? `R$ ${goal.value.toFixed(2).replace('.', ',')}` : goal.type === 'occupancy' ? `${goal.value}%` : `${goal.value} serv.`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border shrink-0 ${
                          onPace 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {onPace ? 'No ritmo' : 'Abaixo do ritmo'}
                        </span>

                        {!isEmployee && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleEditClick(goal)}
                              className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer transition-colors"
                              title="Editar Meta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(goal.id)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer transition-colors"
                              title="Remover Meta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 bg-black/40 h-2 rounded-full overflow-hidden border border-border-dark/60">
                        <div className="bg-gradient-to-r from-gold-500 to-gold-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-black text-white min-w-[28px] text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Employee Goals Card */}
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border-dark/60">
            <Award className="w-5 h-5 text-gold-400" />
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Metas por Colaborador</h3>
          </div>

          <div className="space-y-6">
            {filteredGoals.filter(g => g.level === 'employee').length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs font-medium uppercase tracking-wider">
                Nenhuma meta individual definida para este período.
              </div>
            ) : (
              filteredGoals.filter(g => g.level === 'employee').map(goal => {
                const currentVal = getGoalProgress(goal);
                const pct = goal.value > 0 ? Math.min(100, Math.round((currentVal / goal.value) * 100)) : 0;
                const onPace = pct >= elapsedPercent;
                const employee = professionals.find(p => p.id === goal.professionalId);

                return (
                  <div key={goal.id} className="space-y-2 border border-border-dark/40 bg-black/10 p-4 rounded-xl relative hover:border-gold-400/20 transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-gold-400/10 border border-gold-400/20 text-[9px] font-bold text-gold-400 flex items-center justify-center shrink-0">
                            {employee?.initials || '??'}
                          </span>
                          <span className="text-xs font-bold text-gray-300 truncate max-w-[120px]">{employee?.name}</span>
                          <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">• {goal.type === 'revenue' ? 'Faturamento' : goal.type === 'appointments' ? 'Atendimentos' : 'Ocupação'}</span>
                        </div>
                        
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-base font-black text-white">
                            {goal.type === 'revenue' ? `R$ ${currentVal.toFixed(2).replace('.', ',')}` : goal.type === 'occupancy' ? `${currentVal}%` : `${currentVal} serv.`}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            de {goal.type === 'revenue' ? `R$ ${goal.value.toFixed(2).replace('.', ',')}` : goal.type === 'occupancy' ? `${goal.value}%` : `${goal.value} serv.`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border shrink-0 ${
                          onPace 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {onPace ? 'No ritmo' : 'Abaixo'}
                        </span>

                        {!isEmployee && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleEditClick(goal)}
                              className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer transition-colors"
                              title="Editar Meta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(goal.id)}
                              className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/5 cursor-pointer transition-colors"
                              title="Remover Meta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 bg-black/40 h-2 rounded-full overflow-hidden border border-border-dark/60">
                        <div className="bg-gradient-to-r from-gold-500 to-gold-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-black text-white min-w-[28px] text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Historical chart Recharts */}
      <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-400" />
            Histórico e Performance Comercial
          </h3>
          <p className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">Visão histórica de faturamento para calibração de metas</p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a843" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#d4a843" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} />
              <YAxis stroke="#666" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', borderRadius: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#d4a843" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODAL: Adicionar / Editar Meta */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsAddOpen(false)}
          />
          
          <div className="bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col animate-modal-in">
            <form onSubmit={handleAddOrEditGoal} className="flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {editingGoal ? 'Editar Meta' : 'Criar Nova Meta'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Configure os critérios da meta.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                {/* Level (General / Employee) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Nível da Meta</label>
                  <div className="grid grid-cols-2 gap-3 bg-black/30 p-1 border border-border-dark rounded-xl select-none">
                    <button
                      type="button"
                      onClick={() => setNewGoal(prev => ({ ...prev, level: 'general', professionalId: '' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        newGoal.level === 'general' ? 'bg-gold-400 text-black shadow-inner' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Barbearia Geral
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGoal(prev => ({ ...prev, level: 'employee', professionalId: professionals[0]?.id || '' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        newGoal.level === 'employee' ? 'bg-gold-400 text-black shadow-inner' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Por Colaborador
                    </button>
                  </div>
                </div>

                {/* Professional Selection if Level is Employee */}
                {newGoal.level === 'employee' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase">Colaborador Atribuído</label>
                    <select
                      value={newGoal.professionalId}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, professionalId: e.target.value }))}
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400"
                    >
                      {professionals.map(p => (
                        <option key={p.id} value={p.id} className="bg-card-bg text-white">{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Metric Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Tipo da Meta</label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400"
                  >
                    <option value="revenue" className="bg-card-bg">Faturamento (R$)</option>
                    <option value="appointments" className="bg-card-bg">Número de Atendimentos</option>
                    <option value="occupancy" className="bg-card-bg">Taxa de Ocupação de Cadeira (%)</option>
                  </select>
                </div>

                {/* Value Input */}
                <div className="flex flex-col-reverse gap-1.5">
                  <input
                    type="number"
                    required
                    min="1"
                    id="goalVal"
                    placeholder={newGoal.type === 'revenue' ? 'Ex: 5000' : newGoal.type === 'occupancy' ? 'Ex: 80' : 'Ex: 25'}
                    value={newGoal.value}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium peer"
                  />
                  <label htmlFor="goalVal" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400">
                    Valor Alvo ({newGoal.type === 'revenue' ? 'R$' : newGoal.type === 'occupancy' ? '%' : 'Qtd.'})
                  </label>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary cursor-pointer h-11"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gold-400 text-black text-xs font-bold btn-primary cursor-pointer h-11"
                >
                  {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
