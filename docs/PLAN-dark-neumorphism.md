# Plano de UI/UX: Dark Neumorphism

Este documento contém o brainstorm e o portão socrático para a reformulação do design do Dashboard para o estilo **Dark Neumorphism** (Neomorfismo Escuro).

---

## 🧠 Brainstorm: Estilo Visual Neumorphism Dark

### Contexto
O Neomorfismo (Soft UI) baseia-se na ideia de que os elementos da interface parecem "extrudados" do próprio fundo, usando combinações precisas de sombras escuras e brilhos claros. No *Dark Mode*, isso exige muito cuidado com contraste, pois o fundo não pode ser 100% preto (senão não é possível desenhar a sombra escura).

---

### Opção A: Neomorfismo Puro (Clássico)
Todos os cartões, inputs e botões seguem a regra estrita do Neomorfismo: fundos com a exata mesma cor do plano de fundo da página, elevados por uma sombra dupla (uma clara no canto superior esquerdo e uma muito escura no canto inferior direito).

✅ **Prós:**
- Visual extremamente coeso, tátil e suave.
- Sensação de "equipamento físico" moderno (como um painel de estúdio).

❌ **Contras:**
- Acessibilidade (contraste) pode ser um problema, pois os botões se misturam muito com o fundo.
- Pode parecer monótono se não houver um bom jogo de tipografia.

📊 **Esforço:** Médio

---

### Opção B: Neomorfismo Híbrido + Acentos Neon (Recomendado)
A base da aplicação (cards, sidebar, fundo) utiliza o Neomorfismo clássico escuro (ex: cinza chumbo `#1e1e24`), mas os elementos interativos primários (como o botão "Nova Tarefa" e checkboxes marcados) recebem cores sólidas e um brilho leve (Glow) usando as cores de sotaque (Roxo/Azul).

✅ **Prós:**
- Resolve os problemas de contraste e acessibilidade da Opção A.
- Direciona a atenção do usuário perfeitamente para as ações principais.
- Visual futurista e muito premium.

❌ **Contras:**
- Requer uma calibração cuidadosa no CSS para que as sombras do Neomorfismo não briguem com o "Glow" do neon.

📊 **Esforço:** Médio/Alto

---

### Opção C: Neomorfismo Côncavo/Invertido ("Sunk-in")
Em vez dos cartões saltarem para fora (extrudados), a interface foca em elementos "afundados" na tela usando *inner-shadows*, dando uma sensação de baixo-relevo ou painel gravado a laser.

✅ **Prós:**
- Visual único, agressivo e diferente da maioria dos apps de mercado.
- Excelente para separar o layout principal dos painéis de tarefas.

❌ **Contras:**
- Espaço útil parece menor; pode gerar uma sensação "claustrofóbica" no design.

📊 **Esforço:** Alto

---

## 💡 Recomendação

**Opção B (Neomorfismo Híbrido + Acentos Neon)** porque mantém a essência moderna do Neomorfismo, mas garante que o app continue prático para o uso diário, guiando os olhos do usuário com cores de contraste.

---

## 🛑 Portão Socrático (Perguntas Críticas)

### [P0] **Tonalidade do Fundo (Background)**
**Question:** O Neomorfismo escuro exige uma cor de base específica que não pode ser `#000000`. Você prefere um tom de Cinza-Chumbo (Neutro), Azul-Marinho Profundo (Frio) ou um Roxo-Escuro Acinzentado?
**Why This Matters:**
- Dita a geração de TODAS as sombras do CSS.
- Muda o sentimento do app (profissional vs criativo).

### [P1] **Acentos de Cor (CTAs)**
**Question:** Para os botões primários e ícones, qual cor de sotaque devemos usar no "Glow" para contrastar com o fundo escuro? (Ex: Ciano Neon, Laranja Vibrante, Violeta, Verde Esmeralda?)
**Why This Matters:**
- Define a hierarquia visual primária e a acessibilidade.

### [P2] **Formas e Bordas (Border-Radius)**
**Question:** O Neomorfismo funciona melhor com bordas bem arredondadas (como "bolhas", ex: `24px`) ou você prefere algo mais quadrado e "brutalista" (ex: `8px`)?
**Why This Matters:**
- Determina se o aplicativo vai parecer mais amigável/macio ou mais sério/técnico.
