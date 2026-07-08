import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock,
  User
} from 'lucide-react';

export default function Checklist({ 
  professionals = [], 
  checklistTasks = [], 
  setChecklistTasks, 
  checklistHistory = [], 
  viewRole 
}) {
  const [activeTab, setActiveTab] = useState('diario'); // 'diario' | 'historico'
  const [selectedProfFilter, setSelectedProfFilter] = useState('all'); // for Admin view filter
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('all');

  const isEmployee = viewRole.startsWith('employee-');
  const employeeId = isEmployee ? viewRole.replace('employee-', '') : null;
  const currentEmployee = isEmployee ? professionals.find(p => p.id === employeeId) : null;

  // Filter tasks visible to current user
  const getVisibleTasks = () => {
    if (isEmployee) {
      // Employees see tasks assigned to 'all' or to themselves specifically
      return checklistTasks.filter(t => t.assignedTo === 'all' || t.assignedTo === employeeId);
    } else {
      // Admin filters by selected filter
      if (selectedProfFilter === 'all') return checklistTasks;
      return checklistTasks.filter(t => t.assignedTo === 'all' || t.assignedTo === selectedProfFilter);
    }
  };

  const visibleTasks = getVisibleTasks();

  // Handle task completion toggle
  const handleToggleTask = (taskId) => {
    const targetId = isEmployee ? employeeId : (selectedProfFilter !== 'all' ? selectedProfFilter : professionals[0]?.id);
    if (!targetId) return;

    setChecklistTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const isCompleted = !!task.completedBy[targetId];
        return {
          ...task,
          completedBy: {
            ...task.completedBy,
            [targetId]: !isCompleted
          }
        };
      }
      return task;
    }));
  };

  // Handle create task - Admin only
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const createdTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      assignedTo: newTaskAssignedTo,
      completedBy: {}
    };

    setChecklistTasks(prev => [...prev, createdTask]);
    setNewTaskText('');
  };

  // Handle delete task - Admin only
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Deseja excluir esta tarefa?')) {
      setChecklistTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  // Calculate stats for a professional
  const getProfChecklistStats = (profId) => {
    const profTasks = checklistTasks.filter(t => t.assignedTo === 'all' || t.assignedTo === profId);
    const total = profTasks.length;
    const completed = profTasks.filter(t => !!t.completedBy[profId]).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  // Group historical records by date
  const getGroupedHistory = () => {
    const grouped = {};
    checklistHistory.forEach(rec => {
      if (!grouped[rec.date]) {
        grouped[rec.date] = {};
      }
      if (!grouped[rec.date][rec.employeeId]) {
        grouped[rec.date][rec.employeeId] = { total: 0, completed: 0 };
      }
      grouped[rec.date][rec.employeeId].total += 1;
      if (rec.completed) {
        grouped[rec.date][rec.employeeId].completed += 1;
      }
    });

    // Format to array
    return Object.entries(grouped).map(([date, profs]) => {
      const records = Object.entries(profs).map(([empId, stats]) => {
        const prof = professionals.find(p => p.id === empId);
        return {
          employeeName: prof ? prof.name : empId,
          employeeInitials: prof ? prof.initials : '??',
          percent: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
          completed: stats.completed,
          total: stats.total
        };
      });
      return { date, records };
    }).sort((a, b) => b.date.localeCompare(a.date)); // Sort latest first
  };

  const historicalRecords = getGroupedHistory();

  return (
    <div className="space-y-8 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-border-dark">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
            Checklist Diário
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
            Gerenciamento e auditoria de rotinas diárias da equipe de barbeiros
          </p>
        </div>

        {/* Tab switchers & Admin selectors */}
        <div className="flex items-center gap-3 self-center md:self-auto shrink-0">
          <div className="bg-card-bg border border-border-dark p-1 rounded-xl flex gap-1 shadow-inner relative h-10 w-52">
            <button
              onClick={() => setActiveTab('diario')}
              className={`relative z-10 flex-1 flex items-center justify-center rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer ${
                activeTab === 'diario' ? 'text-black bg-gold-400 shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Diário
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`relative z-10 flex-1 flex items-center justify-center rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer ${
                activeTab === 'historico' ? 'text-black bg-gold-400 shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Histórico
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'diario' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main tasks list (Spans 2 columns on desktop) */}
          <div className="xl:col-span-2 bg-card-bg border border-border-dark p-6 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-dark/60">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gold-400" />
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">
                  {isEmployee ? 'Minhas Tarefas do Dia' : 'Lista Geral de Tarefas'}
                </h3>
              </div>

              {/* Admin filters */}
              {!isEmployee && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase">Filtrar Barbeiro:</span>
                  <select
                    value={selectedProfFilter}
                    onChange={(e) => setSelectedProfFilter(e.target.value)}
                    className="bg-black/40 border border-border-dark text-xs font-bold rounded-lg px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-gold-400"
                  >
                    <option value="all">Todos</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Tasks list */}
            <div className="space-y-3">
              {visibleTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-medium uppercase tracking-wider">
                  Nenhuma tarefa diária registrada.
                </div>
              ) : (
                visibleTasks.map(task => {
                  // Determine if completed
                  const isCompleted = isEmployee 
                    ? !!task.completedBy[employeeId]
                    : (selectedProfFilter !== 'all' ? !!task.completedBy[selectedProfFilter] : false);

                  // Task details text
                  let assignmentLabel = 'Todos';
                  if (task.assignedTo !== 'all') {
                    const prof = professionals.find(p => p.id === task.assignedTo);
                    assignmentLabel = prof ? prof.name : task.assignedTo;
                  }

                  const handleTaskClick = () => {
                    // Employees can click directly, admins can only toggle if they filtered by a specific professional
                    if (isEmployee || selectedProfFilter !== 'all') {
                      handleToggleTask(task.id);
                    }
                  };

                  return (
                    <div 
                      key={task.id}
                      onClick={handleTaskClick}
                      className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-150 relative ${
                        isCompleted 
                          ? 'bg-emerald-500/[0.02] border-emerald-500/20 text-emerald-400/90' 
                          : 'bg-black/10 border-border-dark/60 text-gray-300'
                      } ${isEmployee || selectedProfFilter !== 'all' ? 'cursor-pointer hover:border-gold-400/20' : ''}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Checkbox Icon */}
                        {(isEmployee || selectedProfFilter !== 'all') ? (
                          isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500 shrink-0 hover:text-white" />
                          )
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gold-400 shrink-0" />
                        )}

                        <div className="min-w-0">
                          <p className={`text-xs md:text-sm font-semibold truncate ${isCompleted ? 'line-through opacity-60' : ''}`}>
                            {task.text}
                          </p>
                          <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider block mt-1">
                            Atribuído a: <strong className="text-gray-400">{assignmentLabel}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Admin action: delete */}
                      {!isEmployee && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-white/5 cursor-pointer shrink-0 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick helper note for admins */}
            {!isEmployee && selectedProfFilter === 'all' && (
              <p className="text-[10px] text-gray-500 uppercase font-semibold text-center italic mt-4">
                * Para marcar tarefas concluídas administrativamente, filtre por um profissional específico.
              </p>
            )}
          </div>

          {/* Right sidebar column */}
          <div className="space-y-6">
            
            {/* Admin visual dashboard or Employee visual stats */}
            <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-5">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider pb-3 border-b border-border-dark/60 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-400" />
                {isEmployee ? 'Meu Progresso Hoje' : 'Progresso da Equipe'}
              </h3>

              <div className="space-y-5">
                {isEmployee ? (
                  (() => {
                    const stats = getProfChecklistStats(employeeId);
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <p className="text-xs text-gray-400 font-bold uppercase">Conclusão das Minhas Tarefas</p>
                          <span className="text-sm font-black text-gold-400">{stats.percent}% ({stats.completed}/{stats.total})</span>
                        </div>
                        
                        <div className="bg-black/40 h-3 rounded-full border border-border-dark overflow-hidden">
                          <div className="bg-gold-400 h-full rounded-full transition-all duration-500" style={{ width: `${stats.percent}%` }} />
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  professionals.map(p => {
                    const stats = getProfChecklistStats(p.id);
                    return (
                      <div key={p.id} className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-gold-400/10 border border-gold-400/20 text-[9px] font-black text-gold-400 flex items-center justify-center shrink-0">
                              {p.initials}
                            </span>
                            <span className="font-bold text-white truncate">{p.name}</span>
                          </div>
                          <span className="font-extrabold text-gold-400 shrink-0">{stats.percent}% ({stats.completed}/{stats.total})</span>
                        </div>
                        
                        <div className="bg-black/40 h-2 rounded-full border border-border-dark overflow-hidden">
                          <div className="bg-gold-400 h-full rounded-full transition-all duration-500" style={{ width: `${stats.percent}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Admin Add Task Form panel */}
            {!isEmployee && (
              <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-4">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider pb-1">Adicionar Nova Tarefa</h3>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Atribua obrigações diárias aos barbeiros</p>
                
                <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
                  <div className="flex flex-col-reverse gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Organizar toalhas limpas"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none input-premium text-left"
                    />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Descrição da Tarefa</label>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Responsabilidade</label>
                    <select
                      value={newTaskAssignedTo}
                      onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                      className="w-full bg-black/40 border border-border-dark rounded-xl px-4 py-3 text-xs font-bold text-gray-300 focus:outline-none focus:border-gold-400"
                    >
                      <option value="all">Todos Barbeiros (Geral)</option>
                      {professionals.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gold-400 hover:bg-gold-500 text-black py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 btn-primary cursor-pointer h-11"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    Criar Tarefa
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* Checklist History tab */
        <div className="bg-card-bg border border-border-dark p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border-dark/60">
            <Calendar className="w-5 h-5 text-gold-400" />
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Histórico de Conclusões de Rotina</h3>
          </div>

          <div className="space-y-6">
            {historicalRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs font-medium uppercase tracking-wider">
                Nenhum registro histórico de rotina arquivado.
              </div>
            ) : (
              historicalRecords.map(item => {
                // Formatting date for display: YYYY-MM-DD -> DD/MM/YYYY
                const [yyyy, mm, dd] = item.date.split('-');
                const formattedDate = `${dd}/${mm}/${yyyy}`;

                return (
                  <div key={item.date} className="space-y-3 bg-black/10 border border-border-dark/50 p-4 rounded-xl hover:border-gold-400/10 transition-all duration-200">
                    <h4 className="text-xs font-black text-gold-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gold-400" />
                      {formattedDate}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                      {item.records.map((rec, idx) => (
                        <div key={idx} className="bg-card-bg/60 p-3 rounded-lg border border-border-dark/40 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 flex items-center justify-center shrink-0">
                              {rec.employeeInitials}
                            </span>
                            <span className="font-bold text-gray-300 truncate">{rec.employeeName}</span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                              rec.percent === 100 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : rec.percent > 0
                                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {rec.percent}% ({rec.completed}/{rec.total})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
