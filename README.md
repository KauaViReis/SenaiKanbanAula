# 📊 Senai Kanban Aula

Um sistema de gerenciamento de tarefas (Kanban) completo e moderno, desenvolvido para facilitar a organização e produtividade. Este projeto conta com um dashboard interativo, sistema de autenticação e organização por categorias.

---

## ✨ Funcionalidades

- **Autenticação Segura**: Sistema de login e registro utilizando JWT.
- **Quadro Kanban**: Visualização clara de tarefas por status.
- **Categorização**: Organize suas tarefas por categorias personalizadas.
- **Dashboard de Métricas**: Gráficos interativos utilizando Recharts para acompanhar a produtividade.
- **Interface Responsiva**: Design moderno e adaptável para diferentes dispositivos.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- [React](https://reactjs.org/) (Vite)
- [React Router Dom](https://reactrouter.com/)
- [Recharts](https://recharts.org/)
- [Lucide React](https://lucide.dev/) (Ícones)
- Vanilla CSS (Design Personalizado)

### Backend
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)
- [JWT](https://jwt.io/) (Autenticação)

---

## 📦 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v18+)
- npm ou yarn

### 1. Configuração do Backend
```bash
cd backend
npm install
npm run dev
```
*O servidor iniciará na porta padrão configurada (geralmente 3000).*

### 2. Configuração do Frontend
```bash
cd frontend
npm install
npm run dev
```
*Acesse a URL gerada pelo Vite (geralmente http://localhost:5173).*

---

## 🛠️ Estrutura do Projeto

```text
senaiKanbanAula/
├── backend/    # Servidor Express e banco de dados SQLite
├── frontend/   # Aplicação React com Vite
└── docs/       # Documentação adicional
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ para a aula de desenvolvimento do SENAI.
