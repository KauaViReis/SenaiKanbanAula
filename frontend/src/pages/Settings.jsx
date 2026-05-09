import React from 'react';
import { Settings as SettingsIcon, Bell, Moon, Shield, Palette } from 'lucide-react';

export default function Settings() {
  return (
    <div style={{ padding: '32px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingsIcon size={28} color="var(--accent-color)" /> Configurações
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ajuste suas preferências e personalize sua experiência.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px' }}>
        
        {/* Aparência */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={20} color="var(--accent-color)" /> Aparência (Em breve)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <p style={{ fontWeight: '500' }}>Tema do Sistema</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alternar entre Dark Neumorphism e Light Mode.</p>
            </div>
            <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-xl)', color: 'var(--text-secondary)' }}>
              Apenas Dark Mode disponível
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--warning-color)" /> Notificações (Em breve)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <p style={{ fontWeight: '500' }}>Lembretes de Tarefas</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Receber alertas sobre tarefas próximas do vencimento.</p>
            </div>
            <div style={{ width: '40px', height: '20px', background: 'var(--surface-color)', borderRadius: '10px', position: 'relative', boxShadow: 'var(--shadow-neu-inset)', opacity: 0.5 }}>
              <div style={{ width: '16px', height: '16px', background: 'var(--text-secondary)', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }}></div>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--success-color)" /> Segurança (Em breve)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <p style={{ fontWeight: '500' }}>Alterar Senha</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mantenha sua conta segura atualizando sua senha regularmente.</p>
            </div>
            <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px', opacity: 0.5, cursor: 'not-allowed' }}>
              Atualizar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
