import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Agendamentos from './components/Agendamentos';
import Funcionarios from './components/Funcionarios';
import Estoque from './components/Estoque';
import Assinatura from './components/Assinatura';

// Import initial mock data
import { 
  initialAppointments, 
  initialInventory, 
  dailyRevenue, 
  subscriptionClients,
  professionals as initialProfessionals
} from './data/mockData';

import ClientLayout from './components/client/ClientLayout';

// Custom CSS styles inside App are cleared, using index.css
import './App.css';

export default function App() {
  // Lift state up to synchronize updates across different views in real-time
  const [viewRole, setViewRole] = useState('admin'); // 'admin' or 'client'
  const [appointments, setAppointments] = useState(initialAppointments);
  const [inventory, setInventory] = useState(initialInventory);
  const [subClients, setSubClients] = useState(subscriptionClients);
  const [dailyRevData, setDailyRevData] = useState(dailyRevenue);
  const [professionals, setProfessionals] = useState(initialProfessionals);

  if (viewRole === 'client') {
    return (
      <ClientLayout
        viewRole={viewRole}
        setViewRole={setViewRole}
        subClients={subClients}
        setSubClients={setSubClients}
        appointments={appointments}
        setAppointments={setAppointments}
      />
    );
  }

  return (
    <Router>
      <Layout viewRole={viewRole} setViewRole={setViewRole}>
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
        </Routes>
      </Layout>
    </Router>
  );
}
