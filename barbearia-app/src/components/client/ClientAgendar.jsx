import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const SERVICES = [
  { id: 'corte', name: 'Corte', price: 45.00, duration: 30, description: 'Corte tradicional de cabelo, finalizado com lavagem e pomada modeladora.' },
  { id: 'barba', name: 'Barba', price: 35.00, duration: 30, description: 'Barba alinhada com toalha quente, navalha e óleo especial de hidratação.' },
  { id: 'corte_barba', name: 'Corte + Barba', price: 75.00, duration: 60, description: 'O serviço completo clássico. Cabelo e barba impecáveis com desconto.' },
  { id: 'sobrancelha', name: 'Sobrancelha', price: 20.00, duration: 20, description: 'Design de sobrancelha com navalha ou pinça para limpar a expressão.' }
];

const PROFESSIONALS = [
  { id: 'nicolas', name: 'Nicolas', initials: 'NI', rating: '4.9 ★', bio: 'Especialista em cortes clássicos com tesoura, fades modernos e barba tradicional com toalha quente.' },
  { id: 'gustavo', name: 'Gustavo', initials: 'GU', rating: '4.8 ★', bio: 'Expert em visagismo de barba, cortes degradê e designs modernos com acabamento impecável.' },
  { id: 'sem_preferencia', name: 'Sem preferência', initials: 'SP', rating: 'Auto', bio: 'Selecione esta opção para agendar com o primeiro profissional disponível no horário escolhido.' }
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ClientAgendar({ appointments, setAppointments, planState }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProf, setSelectedProf] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [latestBooking, setLatestBooking] = useState(null);

  // Helper to generate next 7 days (Today + 6)
  const getNext7Days = () => {
    const days = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayLabel = weekdays[d.getDay()];
      days.push({
        dateStr,
        dayLabel,
        formatted: `${dd}/${mm}`,
        label: `${dayLabel}, ${dd}/${mm}`
      });
    }
    return days;
  };

  const datesList = getNext7Days();

  // Check if a service is covered by the client's active plan
  const isPlanActive = planState === 'B';
  
  const isServiceCovered = (serviceId) => {
    if (!isPlanActive) return false;
    return serviceId === 'corte' || serviceId === 'barba' || serviceId === 'corte_barba';
  };

  // Helper to check if a slot is booked for the given professional and date
  const isSlotBooked = (time, dateStr, profId) => {
    if (!profId) return false;

    if (profId === 'sem_preferencia') {
      const nicolasBooked = appointments.some(app => 
        app.date === dateStr && 
        app.time === time && 
        app.professionalId === 'nicolas' && 
        app.status !== 'Cancelado'
      );
      const gustavoBooked = appointments.some(app => 
        app.date === dateStr && 
        app.time === time && 
        app.professionalId === 'gustavo' && 
        app.status !== 'Cancelado'
      );
      return nicolasBooked && gustavoBooked;
    } else {
      return appointments.some(app => 
        app.date === dateStr && 
        app.time === time && 
        app.professionalId === profId && 
        app.status !== 'Cancelado'
      );
    }
  };

  // Auto-advance handlers
  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSelectProf = (prof) => {
    setSelectedProf(prof);
    if (!selectedDate) {
      setSelectedDate(datesList[0]);
    }
    setStep(3);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset selected time when date changes
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedProf || !selectedDate || !selectedTime) return;

    let finalProfId = selectedProf.id;
    if (finalProfId === 'sem_preferencia') {
      const nicolasBooked = appointments.some(app => 
        app.date === selectedDate.dateStr && 
        app.time === selectedTime && 
        app.professionalId === 'nicolas' && 
        app.status !== 'Cancelado'
      );
      finalProfId = nicolasBooked ? 'gustavo' : 'nicolas';
    }

    const finalProf = PROFESSIONALS.find(p => p.id === finalProfId) || PROFESSIONALS[0];
    const isCovered = isServiceCovered(selectedService.id);
    const finalPrice = isCovered ? 0 : selectedService.price;

    const newBooking = {
      id: appointments.length + 1000, 
      clientName: 'João Silva',
      service: selectedService.name,
      price: finalPrice,
      duration: selectedService.duration,
      date: selectedDate.dateStr,
      dayLabel: selectedDate.dayLabel,
      time: selectedTime,
      professionalId: finalProfId,
      status: 'Agendado',
      paymentMethod: isCovered ? 'Plano' : null,
      fee: 0,
      netAmount: 0 
    };

    setAppointments([...appointments, newBooking]);

    setLatestBooking({
      ...newBooking,
      profName: finalProf.name
    });

    setShowSuccess(true);
  };

  const handleResetFlow = () => {
    setSelectedService(null);
    setSelectedProf(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setLatestBooking(null);
    setShowSuccess(false);
    setStep(1);
  };

  // SUCCESS STATE VIEW
  if (showSuccess && latestBooking) {
    const displayDate = datesList.find(d => d.dateStr === latestBooking.date);
    
    return (
      <div className="bg-card-bg border border-border-dark p-6 md:p-8 rounded-2xl text-center max-w-md mx-auto space-y-6 shadow-2xl animate-[slideUpIn_0.3s_ease-out]">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Agendado com sucesso!</h3>
          <p className="text-xs text-gray-400">
            Seu agendamento foi registrado e o barbeiro já está te aguardando.
          </p>
        </div>

        {/* Detail Card */}
        <div className="bg-black/40 border border-border-dark/60 rounded-xl p-4 text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-border-dark/40 pb-2">
            <span className="text-gray-500">Serviço</span>
            <span className="font-bold text-white">{latestBooking.service}</span>
          </div>
          <div className="flex justify-between border-b border-border-dark/40 pb-2">
            <span className="text-gray-500">Profissional</span>
            <span className="font-bold text-white">{latestBooking.profName}</span>
          </div>
          <div className="flex justify-between border-b border-border-dark/40 pb-2">
            <span className="text-gray-500">Data e Horário</span>
            <span className="font-bold text-white">
              {displayDate ? displayDate.label : latestBooking.date} às {latestBooking.time}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-gray-500">Valor</span>
            <span className="font-bold text-gold-400">
              {latestBooking.price === 0 ? 'R$0,00 (Incluído no Plano)' : currencyFormatter.format(latestBooking.price)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetFlow}
          className="w-full h-11 bg-gold-400 text-black text-xs font-bold rounded-xl hover:bg-gold-500 transition-all duration-200 btn-primary uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
        >
          Novo Agendamento
        </button>
      </div>
    );
  }

  // WIZARD FLOW VIEW
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-0">
      
      {/* Title */}
      <div className="text-center space-y-2 py-2">
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider select-none">
          Fazer Agendamento
        </h2>
        <p className="text-xs md:text-sm text-gray-500 font-semibold uppercase tracking-wider select-none">
          Reserve seu horário na barbearia de forma simples e rápida
        </p>
      </div>

      {/* Visual Stepper */}
      <div className="flex items-center justify-between px-4 max-w-md mx-auto text-xs md:text-sm font-bold uppercase tracking-wider select-none text-gray-500">
        <span className={step >= 1 ? 'text-gold-400 font-black' : ''}>1. Serviço</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
        <span className={step >= 2 ? 'text-gold-400 font-black' : ''}>2. Barbeiro</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
        <span className={step >= 3 ? 'text-gold-400 font-black' : ''}>3. Data/Hora</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
        <span className={step >= 4 ? 'text-gold-400 font-black' : ''}>4. Confirmar</span>
      </div>

      {/* STEP 1: CHOOSE SERVICE */}
      {step === 1 && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Selecione o serviço desejado:</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SERVICES.map((service) => {
              const covered = isServiceCovered(service.id);
              return (
                <div 
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className="bg-card-bg border border-border-dark p-6 rounded-2xl cursor-pointer hover:border-gold-400/40 transition-all duration-200 card-premium flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <h5 className="font-extrabold text-white text-base md:text-lg">{service.name}</h5>
                      <span className="text-sm md:text-base font-black text-gold-400 shrink-0">
                        {covered ? 'R$0,00' : currencyFormatter.format(service.price)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed mt-2">{service.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-border-dark/30">
                    <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">{service.duration} minutos</span>
                    {covered ? (
                      <span className="text-xs md:text-sm font-extrabold px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
                        No Plano
                      </span>
                    ) : (
                      <span className="text-xs md:text-sm font-bold text-gold-400 hover:text-gold-300 uppercase tracking-wider flex items-center gap-0.5 whitespace-nowrap shrink-0">
                        Selecionar <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE BARBER */}
      {step === 2 && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-3 mb-2">
            <button 
              type="button" 
              onClick={handleBack}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-border-dark text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer shrink-0 transition-colors btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Escolha o Profissional:</h4>
          </div>

          <div className="space-y-4">
            {PROFESSIONALS.map((prof) => (
              <div
                key={prof.id}
                onClick={() => handleSelectProf(prof)}
                className="bg-card-bg border border-border-dark p-5 md:p-6 rounded-2xl cursor-pointer hover:border-gold-400/40 transition-all duration-200 card-premium flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-base font-black text-gold-400 select-none shrink-0">
                    {prof.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h5 className="font-extrabold text-white text-base md:text-lg truncate">{prof.name}</h5>
                      <span className="text-xs md:text-sm font-bold text-gold-400 px-2 py-0.5 bg-gold-400/5 border border-gold-400/15 rounded whitespace-nowrap shrink-0">
                        {prof.rating}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-400 leading-normal mt-1.5 truncate sm:whitespace-normal">{prof.bio}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE DATE AND TIME */}
      {step === 3 && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleBack}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-border-dark text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer shrink-0 transition-colors btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Escolha a data e hora:</h4>
          </div>

          {/* Date Chips Slider */}
          <div className="space-y-3">
            <label className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider block">1. Selecione a data:</label>
            <div className="flex gap-2.5 overflow-x-auto pb-3.5 scrollbar-thin select-none">
              {datesList.map((date) => {
                const isSelected = selectedDate && selectedDate.dateStr === date.dateStr;
                return (
                  <button
                    key={date.dateStr}
                    type="button"
                    onClick={() => handleSelectDate(date)}
                    className={`flex flex-col items-center justify-center shrink-0 w-20 h-16 md:w-24 md:h-20 border rounded-xl text-center cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-gold-400 text-black border-gold-400 font-bold shadow-lg shadow-gold-400/10'
                        : 'bg-black/30 text-gray-400 border-border-dark hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs md:text-sm uppercase font-bold">{date.dayLabel}</span>
                    <span className="text-xs md:text-sm font-black mt-1">{date.formatted}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Grid selection */}
          {selectedDate && (
            <div className="space-y-4">
              <label className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider block">
                2. Horários disponíveis para {selectedDate.label}:
              </label>
              
              <div className="grid grid-cols-4 gap-3">
                {TIME_SLOTS.map((time) => {
                  const booked = isSlotBooked(time, selectedDate.dateStr, selectedProf.id);
                  const isSelected = selectedTime === time;

                  if (booked) {
                    return (
                      <div
                        key={time}
                        className="h-12 md:h-14 flex items-center justify-center rounded-xl border border-border-dark/30 bg-black/10 text-gray-700 text-xs md:text-sm font-semibold text-center select-none cursor-not-allowed"
                      >
                        {time}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleSelectTime(time)}
                      className={`h-12 md:h-14 flex items-center justify-center rounded-xl border text-xs md:text-sm font-bold text-center cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-emerald-500 text-black border-emerald-500 font-bold shadow-lg shadow-emerald-500/15'
                          : 'bg-black/30 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && selectedService && selectedProf && selectedDate && selectedTime && (
        <div className="space-y-6 max-w-2xl mx-auto animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleBack}
              className="w-11 h-11 flex items-center justify-center rounded-xl border border-border-dark text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer shrink-0 transition-colors btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">Resumo do agendamento:</h4>
          </div>

          <div className="bg-card-bg border border-border-dark rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            
            {/* Visual Header */}
            <div className="flex items-center gap-4 border-b border-border-dark/60 pb-5">
              <div className="w-14 h-14 bg-gold-400/10 border border-gold-400/20 rounded-2xl flex items-center justify-center text-gold-400">
                <Scissors className="w-7 h-7" />
              </div>
              <div>
                <h5 className="font-extrabold text-white text-base">Reserva Corleone</h5>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Confirme os detalhes abaixo</p>
              </div>
            </div>

            {/* List details */}
            <div className="space-y-4 text-xs md:text-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2.5"><Sparkles className="w-4 h-4 text-gray-600" /> Serviço</span>
                <span className="font-bold text-white text-right">{selectedService.name} ({selectedService.duration} min)</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2.5"><User className="w-4 h-4 text-gray-600" /> Profissional</span>
                <span className="font-bold text-white text-right">
                  {selectedProf.name} {selectedProf.id !== 'sem_preferencia' && `(${selectedProf.rating})`}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-gray-600" /> Data</span>
                <span className="font-bold text-white text-right">{selectedDate.label}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-gray-600" /> Horário</span>
                <span className="font-bold text-emerald-400 text-right">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border-dark/40 pt-4 text-gray-400">
                <span>Valor a pagar</span>
                <span className="font-black text-base md:text-lg text-gold-400">
                  {isServiceCovered(selectedService.id) ? (
                    <span className="flex flex-col items-end">
                      <span className="text-emerald-400 text-lg md:text-xl">R$0,00</span>
                      <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">Incluído no Plano</span>
                    </span>
                  ) : (
                    currencyFormatter.format(selectedService.price)
                  )}
                </span>
              </div>
            </div>

            {/* Warning if payment is local */}
            {!isServiceCovered(selectedService.id) && (
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs md:text-sm text-gray-400 leading-normal text-center">
                Este serviço não é coberto por seu plano e será cobrado no local.
              </div>
            )}

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirmBooking}
              className="w-full h-12 md:h-14 bg-emerald-500 text-black text-xs md:text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors btn-primary uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
            >
              Confirmar Agendamento
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
