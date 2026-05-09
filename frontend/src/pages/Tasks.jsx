import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Calendar, Tag, Edit2, Trash2, Archive, ArchiveRestore, CheckSquare, Columns, List } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import API_URL from '../config';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [viewArchived, setViewArchived] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  
  // Edit state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState(null);

  const token = localStorage.getItem('token');

  const fetchTasks = async () => {
    try {
      let url = `${API_URL}/api/tasks?search=${search}&is_archived=${viewArchived ? '1' : '0'}`;
      if (filterPriority) url += `&priority=${filterPriority}`;
      if (filterTag) url += `&tag=${filterTag}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTasks(data.tasks);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    const handleTaskSaved = () => fetchTasks();
    window.addEventListener('taskSaved', handleTaskSaved);
    return () => window.removeEventListener('taskSaved', handleTaskSaved);
  }, [search, filterPriority, filterTag, viewArchived]);

  const handleEditTask = (task) => {
    setEditingTaskData({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
      tags: task.tags ? task.tags.join(', ') : '',
      subtasks: task.subtasks || [],
      status: task.status,
      category_id: task.category_id || ''
    });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa permanentemente?')) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchTasks();
    } catch (err) { console.error('Erro ao excluir tarefa', err); }
  };

  const toggleArchiveStatus = async (task) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_archived: task.is_archived ? 0 : 1 })
      });
      if (res.ok) fetchTasks();
    } catch (err) { console.error('Erro ao arquivar tarefa', err); }
  };

  const toggleTaskStatus = async (task, forcedStatus = null) => {
    const newStatus = forcedStatus || (task.status === 'completed' ? 'pending' : 'completed');
    try {
      const res = await fetch(`${API_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchTasks();
    } catch (err) { console.error('Erro ao atualizar tarefa', err); }
  };

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task && task.status !== status) toggleTaskStatus(task, status);
  };

  const renderTaskCard = (task) => {
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter(st => st.is_completed).length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    return (
      <div 
        key={task.id} 
        className="task-item animate-fade-in" 
        draggable={viewMode === 'kanban'}
        onDragStart={(e) => handleDragStart(e, task.id)}
        style={{ 
          position: 'relative',
          ...(viewMode === 'kanban' ? { flexDirection: 'column', alignItems: 'flex-start', cursor: 'grab', paddingRight: '40px' } : {})
        }}
      >
        <div className="task-main" style={{ width: '100%', alignItems: viewMode === 'kanban' ? 'flex-start' : 'center' }}>
          <div 
            className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
            onClick={() => toggleTaskStatus(task, task.status === 'completed' ? 'pending' : 'completed')}
            style={{ flexShrink: 0, marginTop: viewMode === 'kanban' ? '2px' : '0' }}
          >
            {task.status === 'completed' && <CheckCircle2 size={16} color="white" />}
          </div>
          
          <div style={{ flex: 1 }}>
            <h4 className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}>{task.title}</h4>
            {task.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{task.description}</p>}
            
            {totalSubtasks > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span><CheckSquare size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Progresso</span>
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--surface-color)', borderRadius: '2px', overflow: 'hidden', boxShadow: 'var(--shadow-neu-inset)' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-color)', transition: 'width 0.3s ease', boxShadow: 'var(--shadow-glow)' }}></div>
                </div>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: viewMode === 'kanban' ? '12px' : '0' }}>
                {task.tags.map(tag => (
                  <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-color)', padding: '2px 8px', borderRadius: '12px', boxShadow: 'var(--shadow-neu-inset)' }}>
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: viewMode === 'kanban' ? 'row' : 'column', alignItems: viewMode === 'kanban' ? 'center' : 'flex-end', justifyContent: 'space-between', width: viewMode === 'kanban' ? '100%' : 'auto', gap: '8px', marginTop: viewMode === 'kanban' ? '8px' : '0' }}>
            <div className="task-meta" style={{ flexDirection: 'row', gap: '8px', flexWrap: 'wrap', fontSize: viewMode === 'kanban' ? '11px' : '13px' }}>
              <span className={`badge badge-${task.priority}`} style={{ padding: viewMode === 'kanban' ? '2px 6px' : '4px 8px', fontSize: viewMode === 'kanban' ? '10px' : '12px', boxShadow: 'var(--shadow-neu-inset)' }}>
                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
              </span>
              {task.due_date && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <Calendar size={viewMode === 'kanban' ? 12 : 14} /> 
                  {new Date(task.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              )}
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: viewMode === 'kanban' ? 'column' : 'row', 
              gap: viewMode === 'kanban' ? '4px' : '12px',
              position: viewMode === 'kanban' ? 'absolute' : 'static',
              top: viewMode === 'kanban' ? '16px' : 'auto',
              right: viewMode === 'kanban' ? '12px' : 'auto'
            }}>
              {!viewArchived && (
                <button onClick={() => handleEditTask(task)} title="Editar" style={{ background: 'transparent', color: 'var(--text-secondary)', padding: viewMode === 'kanban' ? '6px' : '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={viewMode === 'kanban' ? 14 : 16} />
                </button>
              )}
              <button onClick={() => toggleArchiveStatus(task)} title={viewArchived ? "Desarquivar" : "Arquivar"} style={{ background: 'transparent', color: 'var(--warning-color)', padding: viewMode === 'kanban' ? '6px' : '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {viewArchived ? <ArchiveRestore size={viewMode === 'kanban' ? 14 : 16} /> : <Archive size={viewMode === 'kanban' ? 14 : 16} />}
              </button>
              <button onClick={() => handleDeleteTask(task.id)} title="Excluir" style={{ background: 'transparent', color: 'var(--danger-color)', padding: viewMode === 'kanban' ? '6px' : '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={viewMode === 'kanban' ? 14 : 16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Minhas Tarefas</h1>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => setViewArchived(false)} 
              style={{ background: 'none', border: 'none', color: !viewArchived ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: !viewArchived ? '600' : 'normal', cursor: 'pointer', padding: 0 }}
            >
              Ativas
            </button>
            <button 
              onClick={() => setViewArchived(true)} 
              style={{ background: 'none', border: 'none', color: viewArchived ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: viewArchived ? '600' : 'normal', cursor: 'pointer', padding: 0 }}
            >
              Arquivadas
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--surface-color)', padding: '4px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-neu-inset)' }}>
            <button onClick={() => setViewMode('list')} style={{ padding: '8px 12px', borderRadius: 'var(--radius-lg)', background: viewMode === 'list' ? 'var(--surface-color)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: viewMode === 'list' ? 'var(--shadow-neu)' : 'none', transition: 'all 0.3s' }}>
              <List size={18} />
            </button>
            <button onClick={() => setViewMode('kanban')} style={{ padding: '8px 12px', borderRadius: 'var(--radius-lg)', background: viewMode === 'kanban' ? 'var(--surface-color)' : 'transparent', color: viewMode === 'kanban' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: viewMode === 'kanban' ? 'var(--shadow-neu)' : 'none', transition: 'all 0.3s' }}>
              <Columns size={18} />
            </button>
          </div>

          <div style={{ position: 'relative', width: '160px' }}>
            <Tag size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" className="input-field" placeholder="Tag..." style={{ paddingLeft: '36px', borderRadius: 'var(--radius-xl)', padding: '10px 16px' }} value={filterTag} onChange={(e) => setFilterTag(e.target.value)} />
          </div>

          <select className="input-field" style={{ width: '160px', padding: '10px 16px', borderRadius: 'var(--radius-xl)' }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="">Urgência</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
          
          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" className="input-field" placeholder="Buscar..." style={{ paddingLeft: '36px', borderRadius: 'var(--radius-xl)', padding: '10px 16px' }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="task-list glass-panel" style={{ padding: '32px' }}>
          {tasks.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              {viewArchived ? 'Você não tem tarefas arquivadas.' : 'Nenhuma tarefa encontrada. Clique no botão + para criar.'}
            </p>
          ) : (
            tasks.map(task => renderTaskCard(task))
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', minHeight: '60vh' }}>
          {['pending', 'in_progress', 'completed'].map((status, i) => {
            const title = status === 'pending' ? 'A Fazer' : status === 'in_progress' ? 'Em Andamento' : 'Concluído';
            const color = status === 'pending' ? 'var(--warning-color)' : status === 'in_progress' ? 'var(--accent-color)' : 'var(--success-color)';
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div 
                key={status} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)}
                className="glass-panel" style={{ padding: '24px' }}
              >
                <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
                  {title} ({columnTasks.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {columnTasks.map(task => renderTaskCard(task))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reutilizando o TaskModal para edição rápida daqui */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        editingTaskId={editingTaskData?.id}
        initialData={editingTaskData}
      />
    </div>
  );
}
