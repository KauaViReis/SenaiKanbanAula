import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, editingTaskId, initialData }) {
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  
  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [task, setTask] = useState({
    title: '', description: '', priority: 'medium', status: 'pending', due_date: getTodayDate(), tags: '', subtasks: [], category_id: ''
  });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (initialData) {
        setTask({ ...initialData, category_id: initialData.category_id || '', status: initialData.status || 'pending' });
      } else {
        setTask({ title: '', description: '', priority: 'medium', status: 'pending', due_date: getTodayDate(), tags: '', subtasks: [], category_id: '' });
      }
    }
  }, [isOpen, initialData]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) setCategories(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories([...categories, cat]);
        setTask({ ...task, category_id: cat.id });
        setShowNewCategory(false);
        setNewCategoryName('');
      }
    } catch (err) { console.error(err); }
  };

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!task.title.trim()) return;

    const token = localStorage.getItem('token');
    const tagsArray = typeof task.tags === 'string' 
      ? task.tags.split(',').map(t => t.trim()).filter(t => t) 
      : task.tags;

    try {
      const method = editingTaskId ? 'PUT' : 'POST';
      const endpoint = editingTaskId ? `/api/tasks/${editingTaskId}` : '/api/tasks';
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...task, tags: tagsArray })
      });
      
      if (res.ok) {
        window.dispatchEvent(new Event('taskSaved'));
        onClose();
      }
    } catch (err) {
      console.error('Erro ao salvar tarefa', err);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setTask({ ...task, subtasks: [...task.subtasks, { title: newSubtaskTitle, is_completed: false }] });
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (index) => {
    const updated = [...task.subtasks];
    updated[index].is_completed = !updated[index].is_completed;
    setTask({ ...task, subtasks: updated });
  };

  const removeSubtask = (index) => {
    const updated = [...task.subtasks];
    updated.splice(index, 1);
    setTask({ ...task, subtasks: updated });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSave} style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: 'var(--shadow-neu)', animation: 'fadeIn 0.3s' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--accent-color)', textShadow: 'var(--shadow-glow)' }}>
          {editingTaskId ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <input type="text" className="input-field" placeholder="Título da tarefa..." required value={task.title} onChange={e => setTask({...task, title: e.target.value})} />
          <input type="date" className="input-field" required value={task.due_date} onChange={e => setTask({...task, due_date: e.target.value})} />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {!showNewCategory ? (
              <>
                <select className="input-field" style={{ flex: 1 }} value={task.category_id} onChange={e => setTask({...task, category_id: e.target.value})}>
                  <option value="">Sem Categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={() => setShowNewCategory(true)} style={{ background: 'var(--surface-color)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'var(--text-secondary)', cursor: 'pointer', boxShadow: 'var(--shadow-neu)' }}>
                  <Plus size={16} />
                </button>
              </>
            ) : (
              <>
                <input type="text" className="input-field" style={{ flex: 1 }} placeholder="Nova categoria..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                <button type="button" onClick={handleCreateCategory} style={{ background: 'var(--accent-color)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'white', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>
                  Ok
                </button>
                <button type="button" onClick={() => setShowNewCategory(false)} style={{ background: 'var(--surface-color)', border: 'none', borderRadius: 'var(--radius-md)', padding: '0 12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  X
                </button>
              </>
            )}
          </div>

          <select className="input-field" value={task.priority} onChange={e => setTask({...task, priority: e.target.value})}>
            <option value="high">Alta Urgência</option>
            <option value="medium">Média Urgência</option>
            <option value="low">Baixa Urgência</option>
          </select>

          {editingTaskId && (
            <select className="input-field" value={task.status} onChange={e => setTask({...task, status: e.target.value})}>
              <option value="pending">A Fazer</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
            </select>
          )}

          <input type="text" className="input-field" style={{ gridColumn: editingTaskId ? 'span 2' : 'span 1' }} placeholder="Tags (separadas por vírgula)" value={task.tags} onChange={e => setTask({...task, tags: e.target.value})} />
        </div>
        
        <textarea className="input-field" placeholder="Descrição (opcional)" rows="2" value={task.description} onChange={e => setTask({...task, description: e.target.value})}></textarea>

        <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-neu-inset)' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Checklist (Subtarefas)</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {task.subtasks.map((st, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div onClick={() => toggleSubtask(i)} style={{ width: '20px', height: '20px', borderRadius: '6px', background: st.is_completed ? 'var(--accent-color)' : 'var(--surface-color)', boxShadow: st.is_completed ? 'var(--shadow-glow)' : 'var(--shadow-neu-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {st.is_completed && <CheckCircle2 size={12} color="var(--bg-color)" />}
                </div>
                <span style={{ flex: 1, textDecoration: st.is_completed ? 'line-through' : 'none', color: st.is_completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{st.title}</span>
                <button type="button" onClick={() => removeSubtask(i)} style={{ background: 'transparent', color: 'var(--danger-color)' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="text" className="input-field" placeholder="Adicionar passo..." value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }} />
            <button type="button" className="btn-primary" onClick={handleAddSubtask} style={{ padding: '0 20px' }}><Plus size={18} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onClose} style={{ background: 'var(--surface-color)', padding: '12px 24px', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-neu)', fontWeight: '600' }}>Cancelar</button>
          <button type="submit" className="btn-primary">{editingTaskId ? 'Salvar Alterações' : 'Criar Tarefa'}</button>
        </div>
      </form>
    </div>
  );
}
