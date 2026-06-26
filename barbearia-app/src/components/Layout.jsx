import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Package, 
  CreditCard,
  User
} from 'lucide-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Agendamentos', path: '/agendamentos', icon: Calendar },
    { name: 'Funcionários', path: '/funcionarios', icon: Users },
    { name: 'Estoque', path: '/estoque', icon: Package },
    { name: 'Assinatura', path: '/assinatura', icon: CreditCard },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col md:flex-row">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-16 hover:w-[220px] bg-card-bg border-r border-border-dark fixed h-full z-20 group sidebar-transition">
        {/* Brand/Logo */}
        <div className="p-4 border-b border-border-dark flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-3 h-[73px] overflow-hidden">
          <div className="bg-gold-400/10 p-2 rounded-lg border border-gold-400/30 shrink-0">
            <Scissors className="w-5 h-5 text-gold-400 transform -rotate-45" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto overflow-hidden whitespace-nowrap sidebar-label w-0 group-hover:w-auto transition-all duration-[180ms] ease-out delay-[100ms] shrink-0">
            <h1 className="font-bold text-sm tracking-wider text-white">CORLEONE</h1>
            <p className="text-[9px] text-gold-400 font-semibold tracking-widest uppercase">Barber Manager</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-center group-hover:justify-start h-12 px-0 group-hover:px-4 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20 border-l-2 border-l-gold-400 shadow-[0_0_15px_rgba(212,168,67,0.05)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="w-8 flex justify-center shrink-0">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-gold-400' : 'group-hover:scale-110'}`} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto overflow-hidden whitespace-nowrap sidebar-label w-0 group-hover:w-auto transition-all duration-[180ms] ease-out delay-[100ms] ml-0 group-hover:ml-3">
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="p-3 border-t border-border-dark bg-black/20 flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-3 h-[65px] overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-400 font-semibold shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto overflow-hidden whitespace-nowrap sidebar-label w-0 group-hover:w-auto transition-all duration-[180ms] ease-out delay-[100ms] shrink-0">
            <p className="text-xs font-semibold text-white leading-tight">Administrador</p>
            <p className="text-[9px] text-gray-500">Unidade Jardins</p>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card-bg/95 backdrop-blur-md border-t border-border-dark z-50 px-2 py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.4)]">
        <div className="flex justify-around items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all duration-200 ${
                  isActive ? 'text-gold-400' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col md:pl-16 min-h-screen pb-20 md:pb-0">
        {/* Page Content wrapper */}
        <div className="flex-1 p-4 md:p-8 animate-[fadeIn_0.3s_ease-out]">
          {children}
        </div>
      </main>
    </div>
  );
}
