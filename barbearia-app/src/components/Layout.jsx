import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Package, 
  CreditCard,
  User,
  Target,
  ClipboardList,
  MoreHorizontal
} from 'lucide-react';

export default function Layout({ children, viewRole, setViewRole, professionals = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isEmployee = viewRole.startsWith('employee-');
  const employeeId = isEmployee ? viewRole.replace('employee-', '') : null;
  const currentProf = isEmployee ? professionals.find(p => p.id === employeeId) : null;

  // Define all possible menu items
  const menuItems = [
    { name: 'Dashboard', mobileName: 'Início', path: '/', icon: LayoutDashboard },
    { name: 'Agendamentos', mobileName: 'Agenda', path: '/agendamentos', icon: Calendar },
    { name: 'Metas', mobileName: 'Metas', path: '/metas', icon: Target },
    { name: 'Checklist', mobileName: 'Checklist', path: '/checklist', icon: ClipboardList },
    { name: 'Funcionários', mobileName: 'Equipe', path: '/funcionarios', icon: Users, adminOnly: true },
    { name: 'Estoque', mobileName: 'Estoque', path: '/estoque', icon: Package, adminOnly: true },
    { name: 'Assinatura', mobileName: 'Planos', path: '/assinatura', icon: CreditCard, adminOnly: true },
  ];

  // Filter items for desktop navigation based on viewRole
  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly && isEmployee) return false;
    return true;
  });

  // Filter items for mobile bottom nav (max 4 main tabs, others go to 'Mais' or hidden for employees)
  const mobileMenuItems = menuItems.filter(item => {
    if (item.adminOnly) return false; // Admins access these through 'Mais', employees don't see them
    return true;
  });

  const currentPath = location.pathname;

  return (
    <>
      {/* ROOT WRAPPER — sem transform/filter para não quebrar o position:fixed da bottom nav */}
      <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col md:flex-row">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-16 hover:w-[220px] bg-card-bg border-r border-border-dark fixed h-full z-40 group sidebar-transition">
          {/* Brand/Logo */}
          <div className="p-4 pl-[13px] border-b border-border-dark flex items-center gap-0 h-[73px] overflow-hidden">
            <div className="bg-gold-400/10 p-2 rounded-lg border border-gold-400/30 shrink-0">
              <Scissors className="w-5 h-5 text-gold-400 transform -rotate-45" />
            </div>
            <div className="overflow-hidden whitespace-nowrap sidebar-label shrink-0">
              <h1 className="font-bold text-sm tracking-wider text-white">CORLEONE</h1>
              <p className="text-xs text-gold-400 font-semibold tracking-widest uppercase">Barber Manager</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-x-hidden">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
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

          {/* User Profile Summary & Role Switcher */}
          <div className="relative">
            {showRoleDropdown && (
              <div className="absolute bottom-[70px] left-2 right-2 bg-card-bg border border-border-dark rounded-xl py-1.5 shadow-2xl z-50 animate-modal-in select-none">
                <p className="text-xs font-bold text-gray-500 px-3 pb-1.5 border-b border-border-dark/60 uppercase tracking-wider">Alterar Papel</p>
                <button 
                  type="button"
                  onClick={() => {
                    setViewRole('admin');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-white/5 flex items-center justify-between cursor-pointer ${
                    viewRole === 'admin' ? 'text-gold-400' : 'text-gray-400'
                  }`}
                >
                  <span>Administrador</span>
                  {viewRole === 'admin' && <span>✓</span>}
                </button>
                
                {/* Professionals Selection */}
                {professionals.map((prof) => (
                  <button 
                    key={prof.id}
                    type="button"
                    onClick={() => {
                      setViewRole(`employee-${prof.id}`);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-white/5 flex items-center justify-between cursor-pointer ${
                      viewRole === `employee-${prof.id}` ? 'text-gold-400' : 'text-gray-400'
                    }`}
                  >
                    <span>Barbeiro: {prof.name}</span>
                    {viewRole === `employee-${prof.id}` && <span>✓</span>}
                  </button>
                ))}

                <button 
                  type="button"
                  onClick={() => {
                    setViewRole('client');
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-white/5 flex items-center justify-between border-t border-border-dark/40 cursor-pointer ${
                    viewRole === 'client' ? 'text-gold-400' : 'text-gray-400'
                  }`}
                >
                  <span>Cliente (Simulador)</span>
                  {viewRole === 'client' && <span>✓</span>}
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
                <p className="text-xs font-semibold text-white leading-tight truncate">
                  {viewRole === 'admin' ? 'Administrador' : currentProf ? currentProf.name : 'Funcionário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {viewRole === 'admin' ? 'Painel Admin' : 'Barbeiro Corleone'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT CONTAINER */}
        <main className="flex-1 flex flex-col md:pl-16 min-h-screen" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Page Content wrapper */}
          <div className="flex-1 p-4 md:p-8 animate-[fadeIn_0.3s_ease-out]">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION — fora de qualquer div com transform/filter para garantir position:fixed correto */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-card-bg/95 backdrop-blur-md border-t border-border-dark z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.4)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* More admin pages modal popover */}
        {showMoreMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
            <div className="absolute bottom-full mb-2 right-12 w-48 bg-card-bg border border-border-dark rounded-xl py-1.5 shadow-2xl z-50 animate-modal-in select-none">
              <p className="text-[10px] font-bold text-gray-500 px-3.5 pb-2 pt-1 border-b border-border-dark/60 uppercase tracking-wider">Mais Opções</p>
              <button 
                type="button"
                onClick={() => {
                  navigate('/funcionarios');
                  setShowMoreMenu(false);
                }}
                className={`w-full text-left px-3.5 py-3 text-xs font-bold hover:bg-white/5 flex items-center gap-2.5 cursor-pointer ${
                  currentPath === '/funcionarios' ? 'text-gold-400' : 'text-gray-300'
                }`}
              >
                <Users className="w-4 h-4 text-gold-400" />
                <span>Funcionários</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  navigate('/estoque');
                  setShowMoreMenu(false);
                }}
                className={`w-full text-left px-3.5 py-3 text-xs font-bold hover:bg-white/5 flex items-center gap-2.5 cursor-pointer ${
                  currentPath === '/estoque' ? 'text-gold-400' : 'text-gray-300'
                }`}
              >
                <Package className="w-4 h-4 text-gold-400" />
                <span>Estoque</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  navigate('/assinatura');
                  setShowMoreMenu(false);
                }}
                className={`w-full text-left px-3.5 py-3 text-xs font-bold hover:bg-white/5 flex items-center gap-2.5 cursor-pointer ${
                  currentPath === '/assinatura' ? 'text-gold-400' : 'text-gray-300'
                }`}
              >
                <CreditCard className="w-4 h-4 text-gold-400" />
                <span>Assinatura</span>
              </button>
            </div>
          </>
        )}

        {showRoleDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
            <div className="absolute bottom-full mb-2 right-4 w-48 bg-card-bg border border-border-dark rounded-xl py-1.5 shadow-2xl z-50 animate-modal-in select-none">
              <p className="text-[10px] font-bold text-gray-500 px-3.5 pb-2 pt-1 border-b border-border-dark/60 uppercase tracking-wider">Alterar Papel</p>
              <button 
                type="button"
                onClick={() => {
                  setViewRole('admin');
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-3.5 py-3 text-xs font-bold hover:bg-white/5 flex items-center justify-between cursor-pointer ${
                  viewRole === 'admin' ? 'text-gold-400' : 'text-gray-400'
                }`}
              >
                <span>Administrador</span>
                {viewRole === 'admin' && <span>✓</span>}
              </button>
              
              {professionals.map((prof) => (
                <button 
                  key={prof.id}
                  type="button"
                  onClick={() => {
                    setViewRole(`employee-${prof.id}`);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-3 text-xs font-bold hover:bg-white/5 flex items-center justify-between cursor-pointer ${
                    viewRole === `employee-${prof.id}` ? 'text-gold-400' : 'text-gray-400'
                  }`}
                >
                  <span>Barbeiro: {prof.name}</span>
                  {viewRole === `employee-${prof.id}` && <span>✓</span>}
                </button>
              ))}

              <button 
                type="button"
                onClick={() => {
                  setViewRole('client');
                  setShowRoleDropdown(false);
                }}
                className={`w-full text-left px-3.5 py-3 text-xs font-bold hover:bg-white/5 hover:text-white flex items-center justify-between border-t border-border-dark/40 cursor-pointer ${
                  viewRole === 'client' ? 'text-gold-400' : 'text-gray-400'
                }`}
              >
                <span>Cliente (Simulador)</span>
                {viewRole === 'client' && <span>✓</span>}
              </button>
            </div>
          </>
        )}
        <div className="flex justify-around items-center px-2 py-2">
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 rounded-lg transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-gold-400 font-bold' : 'text-gray-400 font-medium'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'scale-110 text-gold-400' : ''}`} />
                <span className="text-[9px] sm:text-[10px] tracking-wide text-center truncate w-full px-1">{item.mobileName || item.name}</span>
              </button>
            );
          })}
          
          {/* Admin "Mais" tab on mobile */}
          {!isEmployee && (
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 rounded-lg transition-all duration-200 active:scale-95 ${
                showMoreMenu || ['/funcionarios', '/estoque', '/assinatura'].includes(currentPath) ? 'text-gold-400 font-bold' : 'text-gray-400 font-medium'
              }`}
            >
              <MoreHorizontal className={`w-4.5 h-4.5 ${showMoreMenu ? 'scale-110 text-gold-400' : ''}`} />
              <span className="text-[9px] sm:text-[10px] tracking-wide text-center">Mais</span>
            </button>
          )}

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

