import React, { useEffect, useRef, useState } from 'react';
import { 
  TrendingUp, 
  CalendarDays, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  getWeekDates,
  monthlyRevenueData,
  monthlyRevenueStats,
  monthlyAppointmentsStats
} from '../data/mockData';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function Dashboard({ appointments, inventory, dailyRevData, professionals }) {
  const chartContainerRef = useRef(null);
  const [viewMode, setViewMode] = useState('diario');

  useEffect(() => {
    if (chartContainerRef.current) {
      const wrapper = chartContainerRef.current.querySelector('.recharts-wrapper');
      if (wrapper) {
        wrapper.removeAttribute('tabindex');
        wrapper.setAttribute('focusable', 'false');
      }
      const svg = chartContainerRef.current.querySelector('svg');
      if (svg) {
        svg.setAttribute('focusable', 'false');
        svg.removeAttribute('tabindex');
      }
    }
  }, [appointments, dailyRevData, viewMode]);

  const weekDates = getWeekDates();
  const todayDateStr = weekDates['Fri'].dateStr; // Simulating today as Friday from the mock week setup

  // 1. Daily Metrics
  const todayAppointments = appointments.filter(app => app.date === todayDateStr);
  const todayCompleted = todayAppointments.filter(app => app.status === 'Concluído');
  const todayRevenueFromApps = todayCompleted.reduce((sum, app) => sum + app.price, 0);
  const todayBaseRevenue = 520;
  const todayTotalRevenue = todayBaseRevenue + todayRevenueFromApps;
  const todayCount = todayAppointments.length;
  const todayCompletedCount = todayCompleted.length;

  // 2. Monthly Metrics
  const juneBase = monthlyRevenueData.find(m => m.month === 'Jun')?.total || 20400;
  const allCompletedAppsRevenue = appointments.filter(app => app.status === 'Concluído').reduce((sum, app) => sum + app.price, 0);
  const monthlyTotalRevenue = juneBase + allCompletedAppsRevenue;

  const monthlyTotalCount = monthlyAppointmentsStats.totalBase + appointments.length;
  const monthlyCompletedCount = monthlyAppointmentsStats.completedBase + appointments.filter(app => app.status === 'Concluído').length;

  // 3. Dynamic team occupancy calculated based on active appointment hours
  const profOccupancy = professionals.map(prof => {
    const profApps = appointments.filter(app => app.professionalId === prof.id && app.status !== 'Cancelado');
    const totalMinutes = profApps.reduce((sum, app) => sum + app.duration, 0);
    
    // Calibrated capacities to match baseline (Nicolas: ~65% at 220m, Gustavo: ~80% at 210m, default: 300m)
    const capacity = prof.id === 'nicolas' ? 338 : prof.id === 'gustavo' ? 262 : 300;
    const occupancy = Math.min(100, Math.round((totalMinutes / capacity) * 100));
    
    return {
      ...prof,
      occupancy
    };
  });

  const averageOccupancy = profOccupancy.length > 0
    ? profOccupancy.reduce((sum, p) => sum + p.occupancy, 0) / profOccupancy.length
    : 0;

  // 5. Chart Data
  const dailyChartData = dailyRevData.map(dayItem => {
    const dayMap = { 'Seg': 'Mon', 'Ter': 'Tue', 'Qua': 'Wed', 'Qui': 'Thu', 'Sex': 'Fri', 'Sáb': 'Sat', 'Dom': 'Sun' };
    const dateKey = dayMap[dayItem.day];
    const targetDate = weekDates[dateKey]?.dateStr;
    const dayAppsCompleted = appointments.filter(app => app.date === targetDate && app.status === 'Concluído');
    const dayAppsRevenue = dayAppsCompleted.reduce((sum, app) => sum + app.price, 0);
    return {
      name: dayItem.day,
      date: weekDates[dateKey]?.formatted || '',
      Receita: dayItem.total + dayAppsRevenue
    };
  });

  const monthlyChartData = monthlyRevenueData.map(monthItem => {
    const isJune = monthItem.month === 'Jun';
    const monthAppsRevenue = isJune ? appointments.filter(app => app.status === 'Concluído').reduce((sum, app) => sum + app.price, 0) : 0;
    return {
      name: monthItem.month,
      date: monthItem.label,
      Receita: monthItem.total + monthAppsRevenue
    };
  });

  const chartData = viewMode === 'diario' ? dailyChartData : monthlyChartData;

  return (
    <div className="space-y-8">
      {/* Top Header Row with Title and Segmented Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        {/* Title & Description */}
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider select-none">
            Dashboard
          </h2>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5 select-none">
            Gerenciamento em tempo real do seu negócio
          </p>
        </div>

        {/* Control: Segmented Toggle */}
        <div className="bg-card-bg border border-border-dark p-1 rounded-xl flex gap-1 shadow-inner select-none self-center md:self-auto relative h-10 w-48 sm:w-56">
          {/* Sliding Pill */}
          <div 
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] bg-gold-400 rounded-lg shadow-lg shadow-gold-400/20 transition-transform duration-300 ease-out ${
              viewMode === 'mensal' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
            }`}
          />
          <button
            onClick={() => setViewMode('diario')}
            className={`relative z-10 flex-1 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 cursor-pointer ${
              viewMode === 'diario' ? 'text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Diário
          </button>
          <button
            onClick={() => setViewMode('mensal')}
            className={`relative z-10 flex-1 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 cursor-pointer ${
              viewMode === 'mensal' ? 'text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        
        {/* Card 1: Revenue Card */}
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl relative overflow-hidden group hover:border-gold-400/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-3xl group-hover:bg-gold-400/10 transition-all duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 font-medium">
                {viewMode === 'diario' ? 'Faturamento de Hoje' : 'Faturamento do Mês'}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">
                {currencyFormatter.format(viewMode === 'diario' ? todayTotalRevenue : monthlyTotalRevenue)}
              </h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="text-emerald-500 font-semibold flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> {viewMode === 'diario' ? '+14.2%' : `+${monthlyRevenueStats.percentageChange}%`}
                </span>
                {viewMode === 'diario' ? 'em relação a ontem' : monthlyRevenueStats.comparisonText}
              </p>
            </div>
            <div className="bg-gold-400/10 border border-gold-400/20 p-3 rounded-xl text-gold-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Appointments Card */}
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl relative overflow-hidden group hover:border-gold-400/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-3xl group-hover:bg-gold-400/10 transition-all duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 font-medium">
                {viewMode === 'diario' ? 'Agendamentos de Hoje' : 'Agendamentos do Mês'}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">
                {viewMode === 'diario' ? `${todayCount} Clientes` : `${monthlyTotalCount} Clientes`}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                {viewMode === 'diario' ? (
                  <>
                    <span className="text-gold-400 font-semibold">{todayCompletedCount}</span> concluídos • <span className="text-gray-400 font-semibold">{todayCount - todayCompletedCount}</span> pendentes
                  </>
                ) : (
                  <>
                    <span className="text-gold-400 font-semibold">{monthlyCompletedCount}</span> concluídos • <span className="text-gray-400 font-semibold">{monthlyTotalCount - monthlyCompletedCount}</span> pendentes
                  </>
                )}
              </p>
            </div>
            <div className="bg-gold-400/10 border border-gold-400/20 p-3 rounded-xl text-gold-400">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Average Occupancy */}
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl relative overflow-hidden group hover:border-gold-400/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-3xl group-hover:bg-gold-400/10 transition-all duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400 font-medium">Ocupação Média das Cadeiras</p>
              <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">
                {averageOccupancy.toFixed(1)}%
              </h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                Taxa saudável recomendada: <span className="text-gold-400 font-semibold">75%</span>
              </p>
            </div>
            <div className="bg-gold-400/10 border border-gold-400/20 p-3 rounded-xl text-gold-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts & Side Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-card-bg border border-border-dark p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {viewMode === 'diario' ? 'Faturamento Diário' : 'Faturamento Mensal'}
              </h4>
              <p className="text-xs text-gray-400">
                {viewMode === 'diario' ? 'Desempenho financeiro bruto na semana atual.' : 'Desempenho financeiro bruto nos últimos 6 meses.'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/5 text-gray-400 border border-white/10">
              {viewMode === 'diario' ? 'Segunda a Domingo' : 'Janeiro a Junho'}
            </span>
          </div>

          <div ref={chartContainerRef} className="h-80 w-full select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 15, right: 15, left: 10, bottom: 10 }}
                style={{ overflow: 'visible' }}
                tabIndex={-1}
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A843" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#D4A843" stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  width={85}
                  tickMargin={8}
                  tickFormatter={(value) => currencyFormatter.format(value)}
                />
                <Tooltip 
                  cursor={false}
                  wrapperClassName="custom-tooltip-wrapper"
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    borderColor: '#2a2a2a', 
                    borderRadius: '12px',
                    color: '#ffffff'
                  }}
                  formatter={(value) => [currencyFormatter.format(value), 'Faturamento']}
                  labelFormatter={(label, items) => {
                    const item = items[0]?.payload;
                    return item ? `${label} (${item.date})` : label;
                  }}
                />
                <Bar 
                  dataKey="Receita" 
                  fill="url(#goldGradient)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                  className="chart-bar"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy and Alerts Column */}
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-white tracking-tight mb-2">Desempenho da Equipe</h4>
            <p className="text-xs text-gray-400 mb-6">Taxa de ocupação de cadeira e alertas de contratação.</p>

            <div className="space-y-6">
              {profOccupancy.map((prof) => {
                const isOverThreshold = prof.occupancy > 75;
                return (
                  <div key={prof.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-xs font-bold text-gold-400">
                          {prof.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{prof.name}</p>
                          <p className="text-xs text-gray-400">{prof.specialty}</p>
                        </div>
                      </div>
                      
                      {/* Badge indicator */}
                      <div>
                        {isOverThreshold ? (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-500">
                            <AlertTriangle className="w-3 h-3" /> Contratar
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
                            <CheckCircle className="w-3 h-3" /> Saudável
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Taxa de Ocupação</span>
                        <span className={`font-semibold ${isOverThreshold ? 'text-red-500' : 'text-emerald-500'}`}>
                          {prof.occupancy}%
                        </span>
                      </div>
                      <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isOverThreshold 
                              ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          }`}
                          style={{ width: `${prof.occupancy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hiring Callout Alert */}
          <div className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-white">Alerta de Recursos Humanos</p>
              <p className="text-xs text-gray-400 mt-1 leading-normal">
                O profissional <strong>Gustavo</strong> superou o limite recomendado de 75% de ocupação. Recomendamos abrir vagas de contratação para novos barbeiros.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
