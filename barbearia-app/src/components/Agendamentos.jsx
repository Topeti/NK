import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { services } from '../data/mockData';
import BaixaPagamento from './BaixaPagamento';
import AgendaCalendario from './AgendaCalendario';
import AgendaTabela from './AgendaTabela';

function FormDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isOpen]);

  return (
    <div className="relative w-full text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/40 border border-[#2a2a2a] hover:border-gold-400/50 focus:border-gold-400 px-4 py-3 rounded-xl text-sm text-white flex items-center justify-between gap-3 shadow-inner transition-all duration-200 cursor-pointer h-12"
      >
        <span>{selectedOption ? selectedOption.label : label}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'text-black bg-gold-400 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Reusable Custom Dropdown Component matching the design system
function CustomDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left w-full sm:w-56" onClick={(e) => e.stopPropagation()}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white flex items-center justify-between gap-3 shadow-inner hover:border-gold-400/50 hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.colorClass && (
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedOption.colorClass}`} />
            )}
            <span>{selectedOption ? selectedOption.label : label}</span>
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 left-0 mt-1.5 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'text-black bg-gold-400 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.colorClass && (
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-black' : opt.colorClass}`} />
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Agendamentos({ appointments, setAppointments, professionals }) {
  const [agendaMode, setAgendaMode] = useState('calendario'); // 'agenda' | 'calendario' (default is 'calendario')
  const [selectedProf, setSelectedProf] = useState('all'); // 'all', 'nicolas', 'gustavo'

  useEffect(() => {
    if (selectedProf !== 'all') {
      const exists = professionals.some(p => p.id === selectedProf);
      if (!exists) {
        setSelectedProf(agendaMode === 'agenda' ? (professionals[0]?.id || '') : 'all');
      }
    } else if (agendaMode === 'agenda' && selectedProf === 'all') {
      setSelectedProf(professionals[0]?.id || '');
    }
  }, [professionals, selectedProf, agendaMode]);
  
  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedAppForPayment, setSelectedAppForPayment] = useState(null);
  
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isBookRender, setIsBookRender] = useState(false);
  const [isBookExiting, setIsBookExiting] = useState(false);

  const [bookDetails, setBookDetails] = useState({
    clientName: '',
    serviceId: 'corte',
    professionalId: professionals[0]?.id || '',
    time: '08:00',
    date: ''
  });

  useEffect(() => {
    if (isBookOpen) {
      setIsBookRender(true);
      setIsBookExiting(false);
    } else if (isBookRender) {
      setIsBookExiting(true);
      const timer = setTimeout(() => {
        setIsBookRender(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isBookOpen, isBookRender]);

  // Date calculation helper for current week (Monday to Sunday)
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    const dayLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dayShortLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      list.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        label: dayLabels[i],
        shortLabel: dayShortLabels[i],
        formatted: `${dd}/${mm}`
      });
    }
    return list;
  };

  // Date calculation helper for today
  const getTodayDayObj = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    const dayLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dayShortLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    let dayIndex = today.getDay() - 1;
    if (dayIndex < 0) dayIndex = 6;
    
    return {
      dateStr: `${yyyy}-${mm}-${dd}`,
      label: dayLabels[dayIndex],
      shortLabel: dayShortLabels[dayIndex],
      formatted: `${dd}/${mm}`
    };
  };

  const currentWeekDays = getWeekDays();
  const todayDayObj = getTodayDayObj();
  const activeDate = todayDayObj.dateStr;

  const [mobileActiveDate, setMobileActiveDate] = useState(activeDate);
  const [mobileActivePeriod, setMobileActivePeriod] = useState('manha'); // 'manha' | 'tarde' | 'noite'

  // Time slots from 08:00 to 20:00
  const timeSlots = [];
  for (let h = 8; h <= 20; h++) {
    const hStr = String(h).padStart(2, '0');
    timeSlots.push(`${hStr}:00`);
    if (h < 20) {
      timeSlots.push(`${hStr}:30`);
    }
  }

  // Filter appointments for today
  const dayAppointments = appointments.filter(app => app.date === activeDate);

  // Status styling configurations (used by AgendaTabela)
  const statusStyles = {
    Agendado: 'bg-blue-500/10 border-blue-500/30 text-blue-400 card-premium',
    Confirmado: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 card-premium',
    Concluído: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 card-premium',
    Cancelado: 'bg-red-500/10 border-red-500/30 text-red-500 opacity-60 card-premium',
    'Não Compareceu': 'bg-rose-500/10 border-rose-500/30 text-rose-400 opacity-75 card-premium'
  };

  // Handle payment confirmation
  const handlePaymentConfirm = (id, method, fee, net) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === id) {
        if (method === 'Não Compareceu') {
          return {
            ...app,
            status: 'Não Compareceu',
            paymentMethod: null,
            fee: 0,
            netAmount: 0
          };
        }
        if (method === 'Cancelado') {
          return {
            ...app,
            status: 'Cancelado',
            previousStatus: app.status,
            paymentMethod: null,
            fee: 0,
            netAmount: 0
          };
        }
        return {
          ...app,
          status: 'Concluído',
          paymentMethod: method,
          fee,
          netAmount: net
        };
      }
      return app;
    }));
  };

  const handleReactivateAppointment = (id) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === id) {
        const restoredApp = { ...app, status: app.previousStatus || 'Agendado' };
        delete restoredApp.previousStatus;
        return restoredApp;
      }
      return app;
    }));
  };

  // Handle status toggle
  const handleToggleStatus = (id, currentStatus) => {
    let nextStatus = 'Agendado';
    if (currentStatus === 'Agendado') nextStatus = 'Confirmado';
    else if (currentStatus === 'Confirmado') nextStatus = 'Cancelado';
    else if (currentStatus === 'Cancelado') nextStatus = 'Não Compareceu';
    else if (currentStatus === 'Não Compareceu') nextStatus = 'Agendado';

    setAppointments(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: nextStatus, paymentMethod: null, fee: 0, netAmount: 0 };
      }
      return app;
    }));
  };

  // Handle book new appointment click
  const handleBookSlotClick = (time, profId, dateVal) => {
    setBookDetails({
      clientName: '',
      serviceId: 'corte',
      professionalId: profId || professionals[0]?.id || '',
      time: time,
      date: dateVal || activeDate
    });
    setIsBookOpen(true);
  };

  const handleBookConfirm = (e) => {
    e.preventDefault();
    if (!bookDetails.clientName.trim()) return;

    const selectedService = services.find(s => s.id === bookDetails.serviceId);
    const targetDate = bookDetails.date || activeDate;
    const allDaysList = agendaMode === 'calendario' ? currentWeekDays : [todayDayObj];
    const targetDayObj = allDaysList.find(d => d.dateStr === targetDate) || todayDayObj;
    
    const newApp = {
      id: Date.now(),
      clientName: bookDetails.clientName,
      service: selectedService.name,
      price: selectedService.price,
      duration: selectedService.duration,
      date: targetDate,
      dayLabel: targetDayObj ? targetDayObj.shortLabel : 'Seg',
      time: bookDetails.time,
      professionalId: bookDetails.professionalId,
      status: 'Agendado',
      paymentMethod: null,
      fee: 0,
      netAmount: 0
    };

    setAppointments(prev => [...prev, newApp]);
    setIsBookOpen(false);
  };

  // Handle Agenda / Calendário mode switching with option compatibility check
  const handleModeChange = (mode) => {
    setAgendaMode(mode);
    if (mode === 'agenda' && selectedProf === 'all') {
      setSelectedProf('nicolas'); // Redefine default to first professional
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row with Title, Segmented Toggle, and Dropdown Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        {/* Date Context Display (Title-style) */}
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider select-none">
            {agendaMode === 'agenda' ? 'Agenda de Hoje' : 'Semana Atual'}
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 select-none">
            {agendaMode === 'agenda' ? 'Horários do dia corrente' : 'Escala semanal de barbeiros'}
          </p>
        </div>

        {/* Controls: Segmented Toggle + Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Segmented Control */}
          <div className="hidden md:flex bg-card-bg border border-border-dark p-1 rounded-xl gap-1 shadow-inner select-none relative h-10 w-56 shrink-0">
            {/* Sliding Pill */}
            <div 
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-6px)] bg-gold-400 rounded-lg shadow-lg shadow-gold-400/20 transition-transform duration-300 ease-out ${
                agendaMode === 'calendario' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
              }`}
            />
            <button
              type="button"
              onClick={() => handleModeChange('agenda')}
              className={`relative z-10 flex-1 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                agendaMode === 'agenda' ? 'text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('calendario')}
              className={`relative z-10 flex-1 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                agendaMode === 'calendario' ? 'text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Calendário
            </button>
          </div>

          {/* Dropdown Filter */}
          <div className="shrink-0">
            <CustomDropdown
              label="Barbeiro"
              options={
                agendaMode === 'agenda'
                  ? professionals.map((prof) => {
                      let colorClass = 'bg-sky-500';
                      if (prof.id === 'gustavo') colorClass = 'bg-gold-400';
                      else if (prof.id !== 'nicolas') colorClass = 'bg-amber-500';
                      return { id: prof.id, label: prof.name, colorClass };
                    })
                  : [
                      { id: 'all', label: 'Todos Funcionários', colorClass: 'bg-gray-500/50' },
                      ...professionals.map((prof) => {
                        let colorClass = 'bg-sky-500';
                        if (prof.id === 'gustavo') colorClass = 'bg-gold-400';
                        else if (prof.id !== 'nicolas') colorClass = 'bg-amber-500';
                        return { id: prof.id, label: prof.name, colorClass };
                      })
                    ]
              }
              value={selectedProf}
              onChange={setSelectedProf}
            />
          </div>
        </div>
      </div>



      {/* MOBILE SCHEDULER VIEW (block md:hidden) */}
      <div className="block md:hidden space-y-5">
        
        {/* 1. Seletor de Dia Horizontal */}
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Selecione o Dia:</label>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
            {currentWeekDays.map((day) => {
              const isSelected = mobileActiveDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setMobileActiveDate(day.dateStr)}
                  className={`flex flex-col items-center justify-center shrink-0 w-16 h-14 border rounded-xl text-center cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gold-400 text-black border-gold-400 font-bold shadow-lg shadow-gold-400/10'
                      : 'bg-black/30 text-gray-400 border-border-dark hover:text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold">{day.shortLabel}</span>
                  <span className="text-xs font-black mt-0.5">{day.formatted}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Seletor de Período (Abas) */}
        <div className="flex gap-2 p-1 bg-black/40 border border-border-dark rounded-xl select-none w-full">
          {[
            { id: 'manha', label: 'Manhã', info: '08:00 - 12:00' },
            { id: 'tarde', label: 'Tarde', info: '12:00 - 18:00' },
            { id: 'noite', label: 'Noite', info: '18:00 - 20:00' }
          ].map((period) => {
            const isActive = mobileActivePeriod === period.id;
            return (
              <button
                key={period.id}
                type="button"
                onClick={() => setMobileActivePeriod(period.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-11 ${
                  isActive
                    ? 'bg-gold-400 text-black shadow-lg shadow-gold-400/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{period.label}</span>
                <span className={`text-[9px] font-medium opacity-80 ${isActive ? 'text-black/75' : 'text-gray-500'}`}>{period.info}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Grid de Horários do Barbeiro */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-400 px-1">
            <span className="font-semibold uppercase tracking-wider">Horários</span>
            <span className="font-semibold text-gold-400">
              {professionals.find(p => p.id === (selectedProf !== 'all' ? selectedProf : (professionals[0]?.id || '')) )?.name || ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timeSlots.filter(time => {
              const hour = parseInt(time.split(':')[0], 10);
              if (mobileActivePeriod === 'manha') return hour < 12;
              if (mobileActivePeriod === 'tarde') return hour >= 12 && hour < 18;
              return hour >= 18;
            }).map((slot) => {
              const activeMobileProf = selectedProf !== 'all' ? selectedProf : (professionals[0]?.id || '');
              
              // Find if there is an appointment covering this slot
              const activeProfAppointments = appointments.filter(
                app => app.date === mobileActiveDate && app.professionalId === activeMobileProf
              );
              
              const coveringApp = activeProfAppointments.find(app => {
                const [appH, appM] = app.time.split(':').map(Number);
                const appStart = appH * 60 + appM;
                const appEnd = appStart + app.duration;
                
                const [slotH, slotM] = slot.split(':').map(Number);
                const slotMin = slotH * 60 + slotM;
                
                return slotMin >= appStart && slotMin < appEnd;
              });

              if (coveringApp) {
                const isStartSlot = slot === coveringApp.time;
                const status = coveringApp.status;
                const isConcluidoOrFalta = status === 'Concluído' || status === 'Não Compareceu';
                const isCancelado = status === 'Cancelado';

                const handleSlotClick = () => {
                  if (isConcluidoOrFalta) return;
                  if (isCancelado) {
                    handleReactivateAppointment(coveringApp.id);
                  } else {
                    setSelectedAppForPayment(coveringApp);
                    setIsPaymentOpen(true);
                  }
                };

                if (!isStartSlot) {
                  // Covered slot
                  return (
                    <div
                      key={slot}
                      className="h-14 flex items-center justify-between rounded-xl px-4 bg-black/10 border border-border-dark/30 text-gray-600 text-xs font-medium select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{slot}</span>
                        <span>•</span>
                        <span className="italic">Ocupado ({coveringApp.clientName})</span>
                      </div>
                    </div>
                  );
                }

                // Main booking slot chip
                let statusColorClass = 'border-blue-500/30 text-blue-400 bg-blue-500/10';
                if (status === 'Confirmado') statusColorClass = 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10';
                if (status === 'Concluído') statusColorClass = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
                if (status === 'Cancelado') statusColorClass = 'border-red-500/30 text-red-500 bg-red-500/10';
                if (status === 'Não Compareceu') statusColorClass = 'border-rose-500/30 text-rose-400 bg-rose-500/10';

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={handleSlotClick}
                    className={`h-14 flex items-center justify-between rounded-xl px-4 border text-left cursor-pointer transition-all duration-150 active:scale-98 ${statusColorClass}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-white shrink-0">{slot}</span>
                      <span className="shrink-0">•</span>
                      <span className="font-extrabold truncate text-white">{coveringApp.clientName}</span>
                      <span className="text-[10px] opacity-75 truncate hidden xs:inline">({coveringApp.service})</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider shrink-0">{status}</span>
                  </button>
                );
              }

              // Empty slot (Livre)
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleBookSlotClick(slot, activeMobileProf, mobileActiveDate)}
                  className="h-14 flex items-center justify-between rounded-xl px-4 border border-dashed border-border-dark bg-black/30 hover:border-gold-400/50 hover:bg-white/5 text-xs text-gray-400 font-bold transition-all duration-150 active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gold-400">{slot}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-400">Livre</span>
                  </div>
                  <span className="text-gold-400 text-base font-extrabold">+</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESKTOP SCHEDULER VIEW */}
      <div className="hidden md:block">
        {agendaMode === 'agenda' ? (
          <AgendaTabela
            dayAppointments={dayAppointments}
            selectedProf={selectedProf}
            timeSlots={timeSlots}
            professionals={professionals}
            statusStyles={statusStyles}
            onBookClick={handleBookSlotClick}
            onToggleStatus={handleToggleStatus}
            onPaymentClick={(app) => {
              setSelectedAppForPayment(app);
              setIsPaymentOpen(true);
            }}
          />
        ) : (
          <AgendaCalendario
            appointments={appointments}
            selectedProf={selectedProf}
            professionals={professionals}
            days={currentWeekDays}
            statusStyles={statusStyles}
            onBookClick={handleBookSlotClick}
            onPaymentClick={(app) => {
              setSelectedAppForPayment(app);
              setIsPaymentOpen(true);
            }}
            onReactivate={handleReactivateAppointment}
          />
        )}
      </div>

      {/* MODAL 1: Payment Checkout Modal */}
      <BaixaPagamento
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedAppForPayment(null);
        }}
        appointment={selectedAppForPayment}
        onConfirm={handlePaymentConfirm}
      />

      {/* MODAL 2: Booking Form Modal */}
      {isBookRender && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${
              isBookExiting ? 'animate-backdrop-out' : 'animate-backdrop-in'
            }`} 
            onClick={() => setIsBookOpen(false)}
          ></div>
          <div className={`bg-card-bg border border-border-dark w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col ${
            isBookExiting ? 'animate-modal-out' : 'animate-modal-in'
          }`}>
            <form onSubmit={handleBookConfirm} className="flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-border-dark flex justify-between items-center bg-black/20 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-white">Agendar Novo Cliente</h3>
                  <p className="text-xs text-gray-400 mt-1">Preencha os dados do agendamento.</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsBookOpen(false)}
                  className="text-gray-400 hover:text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 btn-icon-only cursor-pointer shrink-0 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                
                {/* Client Name Input */}
                <div className="flex flex-col-reverse gap-1.5">
                  <input
                    type="text"
                    required
                    id="clientName"
                    placeholder="Ex: João Silva"
                    value={bookDetails.clientName}
                    onChange={(e) => setBookDetails(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-base md:text-sm text-white focus:outline-none input-premium peer"
                  />
                  <label htmlFor="clientName" className="text-xs font-bold text-gray-400 uppercase transition-all duration-200 peer-focus:text-gold-400 peer-focus:-translate-y-[2px]">Nome do Cliente</label>
                </div>

                {/* Professional Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Barbeiro</label>
                  <FormDropdown
                    label="Barbeiro"
                    options={professionals.map(p => ({
                      id: p.id,
                      label: `${p.name} (${p.specialty})`
                    }))}
                    value={bookDetails.professionalId}
                    onChange={(val) => setBookDetails(prev => ({ ...prev, professionalId: val }))}
                  />
                </div>

                {/* Service Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Serviço</label>
                  <FormDropdown
                    label="Serviço"
                    options={services.map(s => ({
                      id: s.id,
                      label: `${s.name} - R$ ${s.price.toFixed(2).replace('.', ',')} (${s.duration}min)`
                    }))}
                    value={bookDetails.serviceId}
                    onChange={(val) => setBookDetails(prev => ({ ...prev, serviceId: val }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Time Input */}
                  <div className="flex flex-col-reverse gap-1.5">
                    <input
                      type="text"
                      disabled
                      id="timeInput"
                      value={bookDetails.time}
                      className="w-full bg-black/20 border border-border-dark/60 rounded-xl px-4 py-3 text-sm text-gray-500 select-none cursor-not-allowed"
                    />
                    <label htmlFor="timeInput" className="text-xs font-bold text-gray-500 uppercase">Horário</label>
                  </div>

                  {/* Date Input */}
                  <div className="flex flex-col-reverse gap-1.5">
                    <input
                      type="text"
                      disabled
                      id="dateInput"
                      value={
                        bookDetails.date
                          ? (agendaMode === 'calendario' ? currentWeekDays : [todayDayObj]).find(d => d.dateStr === bookDetails.date)?.formatted || ''
                          : todayDayObj.formatted
                      }
                      className="w-full bg-black/20 border border-border-dark/60 rounded-xl px-4 py-3 text-sm text-gray-500 select-none cursor-not-allowed"
                    />
                    <label htmlFor="dateInput" className="text-xs font-bold text-gray-500 uppercase">Data</label>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-border-dark bg-black/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBookOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-border-dark text-xs font-bold text-gray-400 btn-secondary cursor-pointer hover:bg-white/5 transition-colors h-11"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gold-400 text-black text-xs font-bold btn-primary cursor-pointer hover:bg-gold-500 transition-colors h-11"
                >
                  Criar Agendamento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
