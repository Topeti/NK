import React, { useRef, useEffect } from 'react';
import { Clock, Check, DollarSign, Plus } from 'lucide-react';

export default function AgendaTabela({
  dayAppointments,
  selectedProf,
  timeSlots,
  professionals,
  statusStyles,
  onBookClick,
  onToggleStatus,
  onPaymentClick
}) {
  // Agenda mode only shows a single professional
  const activeProf = professionals.find(p => p.id === selectedProf) || professionals[0];

  // Filter appointments for the active professional
  const profApps = dayAppointments.filter(app => app.professionalId === activeProf.id);

  // Time comparator to check if a slot has already passed today
  const isSlotPassed = (slotTime) => {
    const today = new Date();
    const [slotH, slotM] = slotTime.split(':').map(Number);
    const currentH = today.getHours();
    const currentM = today.getMinutes();
    
    if (slotH < currentH) return true;
    if (slotH === currentH && slotM < currentM) return true;
    return false;
  };

  const activeRowRef = useRef(null);
  const containerRef = useRef(null);

  // Find the current active slot (first slot that has not passed yet)
  const activeSlot = timeSlots.find(slot => !isSlotPassed(slot)) || timeSlots[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && activeRowRef.current) {
        const container = containerRef.current;
        const row = activeRowRef.current;
        container.scrollTo({
          top: Math.max(0, row.offsetTop - 52),
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeProf.id]);
  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-auto border border-border-dark rounded-2xl bg-card-bg shadow-lg h-[calc(100vh-230px)] md:h-[calc(100vh-195px)] min-h-[380px] overflow-y-auto relative scrollbar-thin"
    >
      <table className="w-full border-collapse text-left table-fixed">
        <thead className="sticky top-0 z-20 bg-[#161616]">
          <tr className="border-b border-border-dark">
            {/* Sticky Time Header */}
            <th className="sticky top-0 left-0 z-30 bg-[#161616] p-3 text-xs font-bold text-gray-400 w-[100px] border-r border-border-dark select-none text-center">
              Horário
            </th>
            <th className="p-3 bg-[#161616] min-w-[280px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-xs font-bold text-gold-400">
                    {activeProf.initials}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white leading-tight">{activeProf.name}</h5>
                    <p className="text-[10px] text-gray-400 leading-none mt-0.5">{activeProf.specialty}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">
                  {profApps.length} agendados
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => {
            const passed = isSlotPassed(slot);
            
            // Find if there is an appointment covering this slot
            const coveringApp = profApps.find(app => {
              const [appH, appM] = app.time.split(':').map(Number);
              const appStart = appH * 60 + appM;
              const appEnd = appStart + app.duration;
              
              const [slotH, slotM] = slot.split(':').map(Number);
              const slotMin = slotH * 60 + slotM;
              
              return slotMin >= appStart && slotMin < appEnd;
            });

            // If coveringApp is found, but this is NOT the starting slot, we skip rendering the cell entirely.
            const isSkipped = coveringApp && slot !== coveringApp.time;

            return (
              <tr 
                key={slot} 
                ref={slot === activeSlot ? activeRowRef : null}
                className="border-b border-border-dark last:border-b-0 hover:bg-white/[0.01]"
              >
                {/* Sticky time column */}
                <td className="sticky left-0 z-10 bg-[#161616] p-2 text-center border-r border-border-dark text-xs font-bold text-gray-400 select-none">
                  {slot}
                </td>
                
                {!isSkipped && (
                  coveringApp ? (
                    <td 
                      rowSpan={Math.ceil(coveringApp.duration / 30)} 
                      className="p-1.5 align-top h-full"
                    >
                      <div 
                        className={`border rounded-xl p-2.5 flex flex-col justify-between h-full min-h-[52px] ${statusStyles[coveringApp.status]}`}
                      >
                        <div className="flex justify-between items-start gap-1 leading-none">
                          <div>
                            <div className="flex items-center gap-1 text-[10px] font-bold">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{coveringApp.time}</span>
                              <span className="text-[9px] opacity-75 ml-1">({coveringApp.duration}m)</span>
                            </div>
                            <p className="text-xs font-extrabold text-white mt-1 truncate max-w-[200px]">
                              {coveringApp.clientName}
                            </p>
                            <p className="text-[10px] opacity-80 truncate mt-0.5">{coveringApp.service}</p>
                          </div>
                          
                          <button 
                            onClick={() => onToggleStatus(coveringApp.id, coveringApp.status)}
                            title="Alternar status (Agendado -> Confirmado -> Cancelado)"
                            className={`text-[8px] font-extrabold tracking-wider px-1.5 py-0.5 rounded uppercase border border-current hover:bg-white/5 transition-all duration-150 btn-secondary cursor-pointer shrink-0 ${
                              coveringApp.status === 'Agendado' ? 'animate-badge-pulse' : ''
                            }`}
                          >
                            {coveringApp.status}
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-white/5 leading-none">
                          <span className="text-[10px] font-bold text-white">
                            R$ {coveringApp.price.toFixed(2).replace('.', ',')}
                          </span>

                          <div className="flex gap-2 shrink-0">
                            {coveringApp.status === 'Concluído' ? (
                              <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                <Check className="w-2.5 h-2.5" /> {coveringApp.paymentMethod}
                              </span>
                            ) : coveringApp.status === 'Cancelado' ? (
                              <span className="text-[9px] text-red-400 font-bold px-1.5 py-0.5">
                                Cancelado
                              </span>
                            ) : (
                              <button
                                onClick={() => onPaymentClick(coveringApp)}
                                className="bg-gold-400 text-black text-[9px] font-bold px-2 py-0.5 rounded hover:bg-gold-550 cursor-pointer transition-colors flex items-center gap-0.5"
                              >
                                <DollarSign className="w-2.5 h-2.5" /> Dar Baixa
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  ) : (
                    // Empty slot
                    <td className="p-1.5 align-top">
                      {passed ? (
                        <div
                          className="w-full min-h-[52px] h-full border border-dashed border-border-dark/30 rounded-xl px-4 py-2 flex items-center justify-between text-left opacity-30 cursor-not-allowed select-none bg-[#111]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-600">-</span>
                            <p className="text-xs font-semibold text-gray-600">Livre</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => onBookClick(slot, activeProf.id)}
                          className="w-full min-h-[52px] h-full border border-dashed border-border-dark rounded-xl px-4 py-2 flex items-center justify-between text-left group hover:border-gold-400/50 hover:bg-white/5 card-premium cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-500 group-hover:text-gold-400 transition-colors duration-200">
                              +
                            </span>
                            <p className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors duration-200">
                              Livre
                            </p>
                          </div>
                          <div className="w-5.5 h-5.5 rounded-lg border border-border-dark group-hover:border-gold-400/30 group-hover:bg-gold-400/10 flex items-center justify-center text-gray-500 group-hover:text-gold-400 transition-all duration-200">
                            <Plus className="w-3 h-3" />
                          </div>
                        </button>
                      )}
                    </td>
                  )
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
