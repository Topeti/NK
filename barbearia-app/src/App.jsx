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
  subscriptionClients 
} from './data/mockData';

// Custom CSS styles inside App are cleared, using index.css
import './App.css';

export default function App() {
  // Lift state up to synchronize updates across different views in real-time
  const [appointments, setAppointments] = useState(initialAppointments);
  const [inventory, setInventory] = useState(initialInventory);
  const [subClients, setSubClients] = useState(subscriptionClients);
  const [dailyRevData, setDailyRevData] = useState(dailyRevenue);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                appointments={appointments} 
                inventory={inventory} 
                dailyRevData={dailyRevData} 
              />
            } 
          />
          <Route 
            path="/agendamentos" 
            element={
              <Agendamentos 
                appointments={appointments} 
                setAppointments={setAppointments} 
              />
            } 
          />
          <Route 
            path="/funcionarios" 
            element={
              <Funcionarios 
                appointments={appointments} 
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
