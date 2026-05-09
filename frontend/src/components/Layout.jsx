import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Home, FolderOpen, Settings, Plus } from 'lucide-react';
import TaskModal from './TaskModal';

export default function Layout({ setAuth }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Início', icon: <Home size={18} /> },
    { path: '/tasks', label: 'Minhas Tarefas', icon: <LayoutDashboard size={18} /> },
    { path: '/categories', label: 'Categorias', icon: <FolderOpen size={18} /> },
    { path: '/settings', label: 'Configurações', icon: <Settings size={18} /> }
  ];

  return (
    <div className="dashboard-layout animate-fade-in" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside className="sidebar glass-panel" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTop: 0, borderBottom: 0, display: 'flex', flexDirection: 'column' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', textShadow: 'var(--shadow-glow)' }}>
            <LayoutDashboard size={24} color="var(--accent-color)" />
            NeumorphTask
          </h2>
          
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Navegação
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', 
                        color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)', 
                        fontWeight: isActive ? '500' : 'normal', 
                        textDecoration: 'none',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-lg)',
                        background: isActive ? 'var(--surface-color)' : 'transparent',
                        boxShadow: isActive ? 'var(--shadow-neu-inset)' : 'none',
                        transition: 'all 0.3s'
                      }}
                    >
                      {item.icon} {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--danger-color)', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0 8px', fontSize: '14px', transition: 'color 0.2s' }}>
            Sair da Conta
          </button>
          
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'var(--text-primary)', padding: '8px', borderRadius: 'var(--radius-lg)', transition: 'background 0.2s', _hover: { background: 'rgba(255,255,255,0.05)' } }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-color)', boxShadow: 'var(--shadow-neu)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name || user.email}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ver Perfil</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>

      {/* Floating Action Button Global */}
      <button 
        className="btn-primary"
        onClick={() => setIsTaskModalOpen(true)}
        title="Criar Tarefa"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxShadow: 'var(--shadow-glow), var(--shadow-neu)',
          zIndex: 900
        }}
      >
        <Plus size={32} />
      </button>

      {/* Modal Global de Tarefas */}
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
}
