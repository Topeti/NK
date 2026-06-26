import React, { useState, useEffect } from 'react';
import { DollarSign, Plus } from 'lucide-react';

export default function AgendaCalendario({
  appointments,
  selectedProf,
  professionals,
  days,
  onBookClick,
  onToggleStatus,
  onPaymentClick
}) {
  const [nowMinutes, setNowMinutes] = useState(null);
  const [todayDateStr, setTodayDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      setTodayDateStr(todayStr);

      const currentMinutes = today.getHours() * 60 + today.getMinutes();
      // Work hours 08:00 to 20:00 (480 to 1200 minutes)
      if (currentMinutes >= 480 && currentMinutes <= 1200) {
        setNowMinutes(currentMinutes - 480);
      } else {
        setNowMinutes(null);
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const getSlotIndex = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return Math.floor(((h * 60 + m) - 480) / 30);
  };

  const calculateEndTimeStr = (timeStr, durationMin) => {
    const [h, m] = timeStr.split(':').map(Number);
    const endMinutes = h * 60 + m + durationMin;
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    return `${endH}:${endM}`;
  };

  // 24 time slot rows (08:00 to 19:30)
  const slotTimes = [];
  for (let h = 8; h < 20; h++) {
    const hStr = String(h).padStart(2, '0');
    slotTimes.push(`${hStr}:00`);
    slotTimes.push(`${hStr}:30`);
  }

  // Packing logic for overlap resolution on a discrete 30-min grid
  const getPackedAppointmentsForDay = (dateStr) => {
    const dayApps = appointments.filter(
      app => app.date === dateStr && (selectedProf === 'all' || app.professionalId === selectedProf)
    );

    const mappedApps = dayApps.map(app => {
      const startSlot = getSlotIndex(app.time);
      const spanSlots = Math.max(1, Math.ceil(app.duration / 30));
      return {
        ...app,
        startSlot,
        spanSlots,
        endSlot: startSlot + spanSlots
      };
    });

    // Sort by start slot, then slot span descending
    const sortedApps = mappedApps.sort((a, b) => {
      if (a.startSlot !== b.startSlot) return a.startSlot - b.startSlot;
      return b.spanSlots - a.spanSlots;
    });

    const clusters = [];
    let currentCluster = [];
    let clusterEnd = 0;

    sortedApps.forEach(app => {
      if (currentCluster.length === 0 || app.startSlot < clusterEnd) {
        currentCluster.push(app);
        clusterEnd = Math.max(clusterEnd, app.endSlot);
      } else {
        clusters.push(currentCluster);
        currentCluster = [app];
        clusterEnd = app.endSlot;
      }
    });
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    const packedApps = [];
    clusters.forEach(cluster => {
      const columns = [];
      cluster.forEach(app => {
        let colIndex = 0;
        while (colIndex < columns.length) {
          const col = columns[colIndex];
          const overlaps = col.some(cApp => {
            return app.startSlot < cApp.endSlot && cApp.startSlot < app.endSlot;
          });
          if (!overlaps) {
            break;
          }
          colIndex++;
        }
        if (colIndex === columns.length) {
          columns.push([]);
        }
        columns[colIndex].push(app);
        app.col = colIndex;
      });

      cluster.forEach(app => {
        packedApps.push({
          ...app,
          col: app.col,
          totalCols: columns.length
        });
      });
    });

    return packedApps;
  };

  // Styles map based on professional responsible
  const getProfStyle = (profId) => {
    if (profId === 'nicolas') {
      return 'bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500/15 card-premium cursor-pointer';
    }
    if (profId === 'gustavo') {
      return 'bg-gold-400/10 border-gold-400/30 text-gold-400 hover:bg-gold-400/15 card-premium cursor-pointer';
    }
    return 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/15 card-premium cursor-pointer';
  };

  // Responsive widths and scrolling based on number of columns (days)
  const minWidthVal = days.length === 1 
    ? '100%' 
    : days.length <= 7 
      ? '960px' 
      : `${days.length * 110 + 64}px`;

  const colWidthClass = days.length === 1 
    ? 'flex-1 min-w-[280px]' 
    : 'flex-1 min-w-[120px] md:min-w-[150px]';

  return (
    <div className="w-full overflow-x-auto border border-border-dark rounded-2xl bg-card-bg shadow-lg p-4 h-[calc(100vh-230px)] md:h-[calc(100vh-195px)] min-h-[380px] overflow-y-auto scrollbar-thin">
      <div className="relative" style={{ minWidth: minWidthVal }}>
        
        {/* Days Header */}
        <div className="flex border-b border-border-dark pb-3 mb-4 pl-[64px]">
          {days.map((day) => {
            const isToday = day.dateStr === todayDateStr;
            return (
              <div key={day.dateStr} className={`${colWidthClass} text-center select-none`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isToday ? 'text-gold-400' : 'text-gray-400'}`}>
                  {day.shortLabel}
                </span>
                <span className={`block text-base font-extrabold mt-0.5 ${isToday ? 'text-gold-400' : 'text-white'}`}>
                  {day.formatted}
                </span>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid Container (height is 24 slots * 48px = 1152px) */}
        <div className="flex relative h-[1152px] select-none">
          
          {/* Discrete Time Labels Axis (Left side) */}
          <div className="w-[64px] shrink-0 text-right pr-4 select-none relative">
            {slotTimes.map((h, idx) => (
              <div key={h} className="absolute right-4 text-[10px] font-bold text-gray-500 h-[48px] flex items-center justify-end" style={{ top: `${idx * 48}px` }}>
                {h}
              </div>
            ))}
          </div>

          {/* Background Hour Lines (Solid for hours, dashed for 30m) */}
          <div className="absolute inset-0 left-[64px] pointer-events-none z-0">
            {slotTimes.map((h, idx) => {
              const isHour = h.endsWith(':00');
              return (
                <div
                  key={h}
                  className={`absolute left-0 right-0 border-t ${
                    isHour ? 'border-border-dark' : 'border-border-dark/30 border-dashed'
                  }`}
                  style={{ top: `${idx * 48}px` }}
                />
              );
            })}
            <div className="absolute left-0 right-0 border-t border-border-dark" style={{ top: `${24 * 48}px` }} />
          </div>

          {/* Columns for each day */}
          <div className="flex flex-1 relative z-10 border-l border-border-dark/30">
            {days.map((day) => {
              const dayApps = getPackedAppointmentsForDay(day.dateStr);
              const isDayToday = day.dateStr === todayDateStr;

              return (
                <div 
                  key={day.dateStr} 
                  className={`${colWidthClass} border-r border-border-dark/30 last:border-r-0 relative h-full group/col hover:bg-white/[0.005] transition-colors duration-150`}
                >
                  {/* Invisible 30-min booking slots in the background */}
                  {slotTimes.map((slot, idx) => {
                    return (
                      <button
                        key={slot}
                        onClick={() => onBookClick(slot, selectedProf !== 'all' ? selectedProf : null, day.dateStr)}
                        className="absolute left-0 right-0 w-full h-[48px] hover:bg-gold-400/[0.03] transition-colors duration-150 cursor-pointer flex items-center justify-center focus:outline-none group/slot"
                        style={{ top: `${idx * 48}px` }}
                        title={`Agendar para as ${slot}`}
                      >
                        <Plus className="w-3.5 h-3.5 text-gold-400 opacity-0 group-hover/slot:opacity-100 transition-opacity duration-150" />
                      </button>
                    );
                  })}

                  {/* "Now" live line indicator (continuous position overlay) */}
                  {isDayToday && nowMinutes !== null && (
                    <div 
                      className="absolute left-0 right-0 border-t-2 border-gold-400 z-30 pointer-events-none flex items-center" 
                      style={{ top: `${nowMinutes * 1.6}px` }} // 1 min = 48px / 30m = 1.6px
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-400 -ml-1.5 absolute left-0 shadow-[0_0_8px_#D4A843]" />
                    </div>
                  )}

                  {/* Absolute positioned appointments */}
                  {dayApps.map((app) => {
                    const topPx = app.startSlot * 48;
                    const heightPx = app.spanSlots * 48 - 4;
                    const leftPercent = app.col * (100 / app.totalCols);
                    const widthPercent = 100 / app.totalCols;

                    const showInitials = selectedProf === 'all';
                    const profObj = professionals.find(p => p.id === app.professionalId);
                    const initials = profObj ? profObj.initials : '??';

                    return (
                      <div
                        key={app.id}
                        onClick={() => onToggleStatus(app.id, app.status)}
                        className={`absolute border rounded-xl overflow-hidden text-left z-20 transition-all duration-200 ${getProfStyle(app.professionalId)}`}
                        style={{ 
                          top: `${topPx}px`, 
                          height: `${heightPx}px`, 
                          left: `${leftPercent}%`, 
                          width: `calc(${widthPercent}% - 2px)` 
                        }}
                      >
                        {app.spanSlots === 1 ? (
                          // 30-MIN COMPACT CARD LAYOUT (height = 44px)
                          <div className="flex items-center justify-between h-full w-full p-2 leading-none">
                            <div className="min-w-0 flex flex-col justify-center">
                              <p className="text-[11px] font-bold text-white truncate leading-tight">
                                {app.clientName}
                              </p>
                              <span className="text-[9px] font-semibold opacity-75 mt-0.5">
                                {app.time}–{calculateEndTimeStr(app.time, app.duration)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {app.status !== 'Concluído' && app.status !== 'Cancelado' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPaymentClick(app);
                                  }}
                                  className="bg-gold-400 text-black p-0.5 rounded hover:bg-gold-505 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-150 shrink-0"
                                  title="Dar Baixa"
                                >
                                  <DollarSign className="w-2.5 h-2.5" />
                                </button>
                              )}
                              {showInitials && (
                                <span className="w-4 h-4 rounded-full bg-white/15 text-white flex items-center justify-center text-[8px] font-bold shrink-0" title={profObj?.name}>
                                  {initials}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          // MULTI-SLOT EXPANDED CARD LAYOUT (height >= 92px)
                          <div className="flex flex-col justify-between h-full w-full p-2 text-[10px] md:text-xs">
                            <div>
                              <div className="flex items-center justify-between gap-1 leading-none">
                                <span className="text-[9px] font-semibold opacity-75">
                                  {app.time}–{calculateEndTimeStr(app.time, app.duration)}
                                </span>
                                {showInitials && (
                                  <span className="w-4.5 h-4.5 rounded-full bg-white/15 text-white flex items-center justify-center text-[8px] font-bold shrink-0" title={profObj?.name}>
                                    {initials}
                                  </span>
                                )}
                              </div>
                              <p className="font-extrabold text-white mt-1.5 truncate leading-tight">{app.clientName}</p>
                            </div>

                            <div className="flex justify-end items-center mt-1 pt-1.5 border-t border-white/5 leading-none">
                              {app.status !== 'Concluído' && app.status !== 'Cancelado' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPaymentClick(app);
                                  }}
                                  className="bg-gold-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded hover:bg-gold-505 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-150 shrink-0"
                                  title="Dar Baixa"
                                >
                                  <DollarSign className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
