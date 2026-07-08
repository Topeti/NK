import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Agendamentos from './components/Agendamentos';
import Funcionarios from './components/Funcionarios';
import Estoque from './components/Estoque';
import Assinatura from './components/Assinatura';
import Metas from './components/Metas';
import Checklist from './components/Checklist';

// Import initial mock data
import { 
  initialAppointments, 
  initialInventory, 
  dailyRevenue, 
  subscriptionClients,
  professionals as initialProfessionals,
  initialGoals,
  initialChecklistTasks,
  initialChecklistHistory,
  initialMissHistory
} from './data/mockData';

import ClientLayout from './components/client/ClientLayout';

// Custom CSS styles inside App are cleared, using index.css
import './App.css';

// Mock function for sending reminders
const sendReminder = (app) => {
  console.log(`[Lembrete de Agendamento] Enviando mensagem de confirmação para ${app.clientName} (Serviço: ${app.service}) às ${app.time}.`);
  // TODO: Integrar com API real de WhatsApp (ex: Twilio, Evolution API, Z-API) ou webhook (Make/Zapier)
  // Exemplo de webhook:
  // fetch('https://hook.us1.make.com/xxxxxxxxx', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     cliente: app.clientName,
  //     servico: app.service,
  //     horario: app.time,
  //     barbeiro: app.professionalId,
  //     telefone: '(11) 99999-9999'
  //   })
  // })
};

// Helper to get week dates
import { getWeekDates } from './data/mockData';

export default function App() {
  // Lift state up to synchronize updates across different views in real-time
  const [viewRole, setViewRole] = useState('admin'); // 'admin', 'client', or 'employee-[profId]'
  const [appointments, setAppointments] = useState(initialAppointments);
  const [inventory, setInventory] = useState(initialInventory);
  const [subClients, setSubClients] = useState(subscriptionClients);
  const [dailyRevData, setDailyRevData] = useState(dailyRevenue);
  const [professionals, setProfessionals] = useState(initialProfessionals);

  // Feature 1: Goals State
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('corleone_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  // Feature 2: Miss History State
  const [missHistory, setMissHistory] = useState(() => {
    const saved = localStorage.getItem('corleone_miss_history');
    return saved ? JSON.parse(saved) : initialMissHistory;
  });

  // Feature 3: Checklist States
  const [checklistTasks, setChecklistTasks] = useState(() => {
    const saved = localStorage.getItem('corleone_checklist_tasks');
    return saved ? JSON.parse(saved) : initialChecklistTasks;
  });

  const [checklistHistory, setChecklistHistory] = useState(() => {
    const saved = localStorage.getItem('corleone_checklist_history');
    return saved ? JSON.parse(saved) : initialChecklistHistory;
  });

  // Feature 4: Reminder Toast State
  const [toast, setToast] = useState(null);

  // Save states to localStorage when they change
  useEffect(() => {
    localStorage.setItem('corleone_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('corleone_miss_history', JSON.stringify(missHistory));
  }, [missHistory]);

  useEffect(() => {
    localStorage.setItem('corleone_checklist_tasks', JSON.stringify(checklistTasks));
  }, [checklistTasks]);

  useEffect(() => {
    localStorage.setItem('corleone_checklist_history', JSON.stringify(checklistHistory));
  }, [checklistHistory]);

  // Checklist Reset Logic on Day Turnover
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastReset = localStorage.getItem('corleone_last_checklist_reset');
    
    if (lastReset && lastReset !== todayStr) {
      // Move yesterday's completions to checklistHistory
      const newHistoryRecords = [];
      checklistTasks.forEach(task => {
        if (task.assignedTo === 'all') {
          professionals.forEach(prof => {
            newHistoryRecords.push({
              date: lastReset,
              employeeId: prof.id,
              taskId: task.id,
              taskText: task.text,
              completed: !!task.completedBy[prof.id]
            });
          });
        } else {
          newHistoryRecords.push({
            date: lastReset,
            employeeId: task.assignedTo,
            taskId: task.id,
            taskText: task.text,
            completed: !!task.completedBy[task.assignedTo]
          });
        }
      });

      const updatedHistory = [...checklistHistory, ...newHistoryRecords];
      setChecklistHistory(updatedHistory);
      localStorage.setItem('corleone_checklist_history', JSON.stringify(updatedHistory));

      // Reset today's completions
      const resetTasks = checklistTasks.map(t => ({
        ...t,
        completedBy: {}
      }));
      setChecklistTasks(resetTasks);
      localStorage.setItem('corleone_checklist_tasks', JSON.stringify(resetTasks));
      
      localStorage.setItem('corleone_last_checklist_reset', todayStr);
    } else if (!lastReset) {
      localStorage.setItem('corleone_last_checklist_reset', todayStr);
    }
  }, [checklistTasks, checklistHistory, professionals]);

  // Feature 4: Automatic Lembrete service loop (1h before check)
  useEffect(() => {
    const checkReminders = () => {
      const weekDates = getWeekDates();
      const todayDateStr = weekDates['Fri'].dateStr; // Simulated today is Friday
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTotalMin = currentH * 60 + currentM;

      setAppointments(prevApps => {
        let changed = false;
        const updated = prevApps.map(app => {
          // Check if appointment is today, is not cancelled/completed, and reminder wasn't sent yet
          if (app.date === todayDateStr && (app.status === 'Agendado' || app.status === 'Confirmado') && !app.reminderSent) {
            const [appH, appM] = app.time.split(':').map(Number);
            const appTotalMin = appH * 60 + appM;
            const diff = appTotalMin - currentTotalMin;

            // Trigger if exactly in [50, 70] minutes window (roughly 1h before)
            if (diff >= 50 && diff <= 70) {
              changed = true;
              sendReminder(app);
              setToast({
                id: Date.now(),
                message: `Lembrete automático enviado para ${app.clientName} (1h restante para o serviço de ${app.service} às ${app.time}).`
              });
              return { ...app, reminderSent: true };
            }
          }
          return app;
        });
        return changed ? updated : prevApps;
      });
    };

    // Check on load, then every 10 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toast Auto-close
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (viewRole === 'client') {
    return (
      <ClientLayout
        viewRole={viewRole}
        setViewRole={setViewRole}
        subClients={subClients}
        setSubClients={setSubClients}
        appointments={appointments}
        setAppointments={setAppointments}
        missHistory={missHistory}
        professionals={professionals}
      />
    );
  }

  return (
    <Router>
      <Layout viewRole={viewRole} setViewRole={setViewRole} professionals={professionals}>
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                appointments={appointments} 
                inventory={inventory} 
                dailyRevData={dailyRevData} 
                professionals={professionals}
              />
            } 
          />
          <Route 
            path="/agendamentos" 
            element={
              <Agendamentos 
                appointments={appointments} 
                setAppointments={setAppointments} 
                professionals={professionals}
                missHistory={missHistory}
                setMissHistory={setMissHistory}
              />
            } 
          />
          <Route 
            path="/funcionarios" 
            element={
              <Funcionarios 
                appointments={appointments} 
                setAppointments={setAppointments}
                professionals={professionals}
                setProfessionals={setProfessionals}
              />
            } 
          />
          <Route 
            path="/estoque" 
            element={
              <Estoque 
                inventory={inventory} 
                setInventory={setInventory} 
              />
            } 
          />
          <Route 
            path="/assinatura" 
            element={
              <Assinatura 
                subClients={subClients} 
                setSubClients={setSubClients} 
              />
            } 
          />
          <Route 
            path="/metas" 
            element={
              <Metas 
                appointments={appointments} 
                professionals={professionals}
                goals={goals}
                setGoals={setGoals}
                viewRole={viewRole}
              />
            } 
          />
          <Route 
            path="/checklist" 
            element={
              <Checklist 
                professionals={professionals}
                checklistTasks={checklistTasks}
                setChecklistTasks={setChecklistTasks}
                checklistHistory={checklistHistory}
                viewRole={viewRole}
              />
            } 
          />
        </Routes>
      </Layout>

      {/* Global Reminder Toast Alert */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-[#1a1a1a] border border-gold-400/40 text-gray-100 p-4 rounded-xl shadow-2xl max-w-sm flex items-start gap-3 animate-modal-in select-none">
          <div className="w-8 h-8 rounded-lg bg-gold-400/10 flex items-center justify-center text-gold-400 shrink-0 font-bold">
            📱
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Lembrete Automático</h5>
            <p className="text-xs text-gray-400 mt-1 leading-normal">{toast.message}</p>
          </div>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-gray-500 hover:text-white text-xs shrink-0 cursor-pointer p-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </Router>
  );
}

