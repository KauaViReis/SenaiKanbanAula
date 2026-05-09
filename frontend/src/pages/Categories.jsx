import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Tag } from 'lucide-react';
import API_URL from '../config';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#808080');
  
  const token = localStorage.getItem('token');

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newCategoryName, color: newCategoryColor })
      });
      
      if (res.ok) {
        setNewCategoryName('');
        setNewCategoryColor('#808080');
        fetchCategories();
      }
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Tem certeza? Tarefas com essa categoria ficarão sem categoria.')) return;
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchCategories();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
    }
  };

  return (
    <div style={{ padding: '32px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FolderOpen size={28} color="var(--accent-color)" /> Gerenciar Categorias
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Organize suas tarefas em pastas com cores personalizadas.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Formulário de Criação */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', textShadow: 'var(--shadow-glow)' }}>Nova Categoria</h2>
          <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Nome da Categoria</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ex: Trabalho, Estudos..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Cor de Identificação</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  style={{ 
                    width: '40px', height: '40px', border: 'none', borderRadius: '50%', 
                    background: 'none', cursor: 'pointer', padding: 0
                  }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{newCategoryColor}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
              <Plus size={18} /> Adicionar Categoria
            </button>
          </form>
        </div>

        {/* Lista de Categorias */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Suas Categorias</h2>
          
          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
              Você ainda não criou nenhuma categoria.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '16px', background: 'var(--surface-color)', 
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-neu-inset)' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: cat.color || '#808080', boxShadow: 'var(--shadow-glow)' }}></div>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>{cat.name}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '8px' }}
                    title="Excluir Categoria"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
