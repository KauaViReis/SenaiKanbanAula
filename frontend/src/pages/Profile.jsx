import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function Profile({ setAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isSaving, setIsSaving] = useState(false);

  const avatars = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Jack',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Nala',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Lucky',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam'
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    navigate('/login');
  };

  const handleUpdateAvatar = async (url) => {
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ avatar: url })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Erro ao atualizar avatar', err);
    }
    setIsSaving(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '40px', minHeight: '100%' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-color)', 
            margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: 'bold', boxShadow: 'var(--shadow-glow)'
          }}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              user.name ? user.name[0].toUpperCase() : 'U'
            )}
          </div>
          
          <h1 style={{ marginBottom: '8px' }}>Meu Perfil</h1>
          
          <div className="form-group" style={{ textAlign: 'left', marginTop: '32px' }}>
            <label>Nome Completo</label>
            <div className="input-field" style={{ background: 'var(--surface-color)', color: 'var(--text-secondary)' }}>
              {user.name || 'Não informado'}
            </div>
          </div>
          
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>E-mail</label>
            <div className="input-field" style={{ background: 'var(--surface-color)', color: 'var(--text-secondary)' }}>
              {user.email}
            </div>
          </div>

          <div style={{ textAlign: 'left', marginTop: '32px', padding: '24px', background: 'var(--surface-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-neu-inset)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={18} /> Escolha um Boneco
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              {avatars.map((url, i) => (
                <div 
                  key={i} 
                  onClick={() => handleUpdateAvatar(url)}
                  style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: user.avatar === url ? 'var(--accent-color)' : 'var(--bg-color)', 
                    padding: '4px', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: user.avatar === url ? 'var(--shadow-glow)' : 'var(--shadow-neu)',
                    opacity: isSaving ? 0.5 : 1,
                    pointerEvents: isSaving ? 'none' : 'auto'
                  }}
                >
                  <img src={url} alt={`Avatar ${i}`} style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white' }} />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleLogout} className="btn-primary" style={{ marginTop: '32px', background: 'var(--danger-color)', width: '100%' }}>
            <LogOut size={18} /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
