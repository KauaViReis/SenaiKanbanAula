import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckCircle2, AlertCircle, Calendar, Tag, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export default function Home() {
  const [stats, setStats] = useState({ total: 0, completedToday: 0, overdue: 0 });
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user.name ? user.name.split(' ')[0] : 'Usuário';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Dashboard Stats
        const resStats = await fetch('http://localhost:5000/api/tasks/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resStats.ok) setStats(await resStats.json());

        // Fetch Weekly Stats
        const resWeekly = await fetch('http://localhost:5000/api/tasks/weekly-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resWeekly.ok) {
          const rawData = await resWeekly.json();
          // Format data for chart
          const formatted = rawData.map(item => {
            const date = new Date(item.date);
            // Formatar dia da semana ex: "Seg"
            const dayStr = date.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
            return {
              name: dayStr.charAt(0).toUpperCase() + dayStr.slice(1),
              Concluídas: item.completed
            };
          });
          setWeeklyStats(formatted);
        }

        // Fetch Upcoming Tasks (Limit to 5)
        const resTasks = await fetch('http://localhost:5000/api/tasks?is_archived=0', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resTasks.ok) {
          const tasksData = await resTasks.json();
          // Filter out completed, sort by due_date ascending
          const pending = tasksData.tasks
            .filter(t => t.status !== 'completed' && t.due_date)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 5);
          setUpcomingTasks(pending);
        }
      } catch (err) {
        console.error('Erro ao buscar dados da Home:', err);
      }
    };

    fetchData();
    window.addEventListener('taskSaved', fetchData);
    return () => window.removeEventListener('taskSaved', fetchData);
  }, [token]);

  return (
    <div style={{ padding: '32px' }}>
      <div className="top-bar" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', textShadow: 'var(--shadow-glow)' }}>
            {greeting}, {firstName}! 🚀
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Aqui está o resumo do seu desempenho.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card glass-panel" style={{ padding: '24px' }}>
          <div className="stat-icon"><LayoutDashboard size={24} /></div>
          <div className="stat-info">
            <h3 style={{ fontSize: '28px' }}>{stats.total}</h3>
            <p>Total de Tarefas</p>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ color: 'var(--success-color)' }}><CheckCircle2 size={24} /></div>
          <div className="stat-info">
            <h3 style={{ fontSize: '28px' }}>{stats.completedToday}</h3>
            <p>Concluídas Hoje</p>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ padding: '24px' }}>
          <div className="stat-icon" style={{ color: 'var(--danger-color)' }}><AlertCircle size={24} /></div>
          <div className="stat-info">
            <h3 style={{ fontSize: '28px' }}>{stats.overdue}</h3>
            <p>Atrasadas</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Gráfico de Desempenho */}
        <div className="glass-panel animate-fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Engajamento (Últimos 7 Dias)
          </h2>
          <div style={{ flex: 1, width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ background: 'var(--surface-color)', border: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-neu)' }}
                />
                <Bar dataKey="Concluídas" fill="var(--accent-color)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Próximas Tarefas */}
        <div className="glass-panel animate-fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Próximas a Vencer
            </h2>
            <Link to="/tasks" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
              Ver todas <ChevronRight size={16} />
            </Link>
          </div>

          {upcomingTasks.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Nenhuma tarefa urgente no radar. Bom trabalho!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcomingTasks.map(task => {
                const today = new Date().toISOString().split('T')[0];
                const taskDate = task.due_date ? task.due_date.split('T')[0] : null;
                const isOverdue = taskDate && taskDate < today;
                const isToday = taskDate === today;

                return (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-neu-inset)' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '15px', marginBottom: '4px', color: isOverdue ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                        {task.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {taskDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? 'var(--danger-color)' : isToday ? 'var(--warning-color)' : 'var(--text-secondary)' }}>
                            <Calendar size={12} /> {isToday ? 'Hoje' : new Date(task.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                        )}
                        <span className={`badge badge-${task.priority}`} style={{ padding: '0 6px', fontSize: '10px' }}>
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
