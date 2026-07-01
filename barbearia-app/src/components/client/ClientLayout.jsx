import React, { useState } from 'react';
import { 
  Scissors, 
  User, 
  ChevronDown,
  Calendar,
  CreditCard
} from 'lucide-react';
import ClientAgendar from './ClientAgendar';
import ClientAssinatura from './ClientAssinatura';

export default function ClientLayout({ 
  viewRole, 
  setViewRole, 
  subClients, 
  setSubClients, 
  appointments, 
  setAppointments 
}) {
  const [activeTab, setActiveTab] = useState('agendar'); // 'agendar' or 'assinatura'
  const [planState, setPlanState] = useState('B'); // 'A' (no plan), 'B' (active plan), 'C' (payment failure)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const menuItems = [
    { id: 'agendar', name: 'Agendar', mobileName: 'Agendar', icon: Calendar },
    { id: 'assinatura', name: 'Minha Assinatura', mobileName: 'Assinatura', icon: CreditCard },
  ];

  return (
    <>
      {/* ROOT WRAPPER — sem transform/filter para não quebrar o position:fixed da bottom nav */}
      <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col md:flex-row">
      
        {/* DESKTOP CLIENT SIDEBAR - Expands on hover like Admin sidebar */}
        <aside className="hidden md:flex flex-col w-16 hover:w-[220px] bg-card-bg border-r border-border-dark fixed h-full z-40 group sidebar-transition">
          {/* Brand/Logo */}
          <div className="p-4 pl-[13px] border-b border-border-dark flex items-center gap-0 h-[73px] overflow-hidden">
            <div className="bg-gold-400/10 p-2 rounded-lg border border-gold-400/30 shrink-0">
              <Scissors className="w-5 h-5 text-gold-400 transform -rotate-45" />
            </div>
            <div className="overflow-hidden whitespace-nowrap sidebar-label shrink-0">
              <h1 className="font-bold text-sm tracking-wider text-white">CORLEONE</h1>
              <p className="text-xs text-gold-400 font-semibold tracking-widest uppercase">Club &amp; Booking</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-x-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center h-12 px-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20 border-l-2 border-l-gold-400 shadow-[0_0_15px_rgba(212,168,67,0.05)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="w-8 flex justify-center shrink-0">
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-gold-400' : 'group-hover:scale-110'}`} />
                  </div>
                  <span className="overflow-hidden whitespace-nowrap sidebar-label shrink-0">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Client Profile Summary with Switcher Popover */}
          <div className="relative">
            {showRoleDropdown && (
              <div className="absolute bottom-[70px] left-2 right-2 bg-card-bg border border-border-dark rounded-xl py-1.5 shadow-2xl z-50 animate-modal-in select-none">
                <p className="text-xs font-bold text-gray-500 px-3 pb-1 border-b border-border-dark/60 uppercase tracking-wider">Alterar Papel</p>
                <button 
                  type="button"
                  onClick={() => setViewRole('admin')}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <span>Administrador</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowRoleDropdown(false)}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-gold-400 hover:bg-white/5 flex items-center justify-between cursor-pointer"
                >
                  <span>Cliente</span>
                  <span>✓</span>
                </button>
              </div>
            )}
            <div 
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="p-3 border-t border-border-dark bg-black/20 flex items-center gap-0 h-[65px] overflow-hidden cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400 font-semibold shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden whitespace-nowrap sidebar-label shrink-0">
                <p className="text-xs font-semibold text-white leading-tight">João Silva</p>
                <p className="text-xs text-gold-400 font-medium">Cliente</p>
              </div>
            </div>
          </div>
        </aside>

        {/* CLIENT MAIN CONTENT CONTAINER */}
        <main className="flex-1 flex flex-col md:pl-16 min-h-screen" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex-1 p-4 md:p-8 animate-[fadeIn_0.3s_ease-out]">
            {activeTab === 'agendar' && (
              <ClientAgendar 
                appointments={appointments}
                setAppointments={setAppointments}
                planState={planState}
              />
            )}

            {activeTab === 'assinatura' && (
              <ClientAssinatura 
                subClients={subClients}
                setSubClients={setSubClients}
                planState={planState}
                setPlanState={setPlanState}
              />
            )}
          </div>
        </main>
      </div>

      {/* MOBILE CLIENT BOTTOM NAVIGATION — fora de qualquer div com transform/filter para garantir position:fixed correto */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-card-bg/95 backdrop-blur-md border-t border-border-dark z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.4)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {showRoleDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
            <div className="absolute bottom-full mb-2 left-4 right-4 bg-card-bg border border-border-dark rounded-xl py-1.5 shadow-2xl z-50 animate-modal-in select-none">
              <p className="text-[10px] font-bold text-gray-500 px-3.5 pb-2 pt-1 border-b border-border-dark/60 uppercase tracking-wider">Alterar Papel</p>
              <button 
                type="button"
                onClick={() => {
                  setViewRole('admin');
                  setShowRoleDropdown(false);
                }}
                className="w-full text-left px-3.5 py-3 text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <span>Administrador</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowRoleDropdown(false)}
                className="w-full text-left px-3.5 py-3 text-xs font-bold text-gold-400 hover:bg-white/5 flex items-center justify-between cursor-pointer"
              >
                <span>Cliente</span>
                <span>✓</span>
              </button>
            </div>
          </>
        )}
        <div className="flex justify-around items-center px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 rounded-lg transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-gold-400 font-bold' : 'text-gray-400 font-medium'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'scale-110 text-gold-400' : ''}`} />
                <span className="text-[9px] sm:text-[10px] tracking-wide text-center truncate w-full px-1">{item.mobileName || item.name}</span>
              </button>
            );
          })}
          
          {/* Perfil/Role Switcher Mobile Tab */}
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 rounded-lg transition-all duration-200 active:scale-95 ${
              showRoleDropdown ? 'text-gold-400 font-bold' : 'text-gray-400 font-medium'
            }`}
          >
            <User className={`w-4.5 h-4.5 ${showRoleDropdown ? 'scale-110 text-gold-400' : ''}`} />
            <span className="text-[9px] sm:text-[10px] tracking-wide text-center">Perfil</span>
          </button>
        </div>
      </nav>
    </>
  );
}
