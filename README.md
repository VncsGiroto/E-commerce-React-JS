# E-commerce-React-JS

Uma aplicação e-commerce moderna construída com **React**, **Express**, e **MongoDB**. Sistema completo com autenticação JWT, gestão de produtos, carrinho de compras e painel administrativo (em progresso).

## 📋 Descrição do Projeto

Este projeto é um estudo aprofundado em desenvolvimento full-stack, implementando:

- **Frontend**: Interface responsiva com React e Vite
- **Backend**: API RESTful com Express.js
- **Database**: MongoDB para persistência de dados
- **Autenticação**: JWT para usuários e administradores
- **Middleware**: Validação, autenticação e conversão de imagens

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca de UI
- **Vite** - Bundler/Build tool
- **Styled Components** - CSS-in-JS
- **React Router** - Navegação
- **Axios** - Requisições HTTP

### Backend
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação segura
- **Multer** - Upload de arquivos
- **Bcryptjs** - Hash de senhas

---

## 📂 Estrutura do Projeto

```
E-commerce-React-JS/
├── back-end/
│   ├── api/
│   ├── controllers/
│   │   ├── adminRouterController.js      # Lógica de admin
│   │   ├── produtosRouterController.js   # Lógica de produtos
│   │   └── userRouterController.js       # Lógica de usuários
│   ├── middlewares/
│   │   ├── base64ToImageMiddleware.js    # Conversão de imagem
│   │   ├── checkTokens.js                # Validação JWT
│   │   └── validateMiddleware.js         # Validação de dados
│   ├── models/
│   │   ├── Admin.js                      # Modelo de admin
│   │   ├── Produto.js                    # Modelo de produto
│   │   └── User.js                       # Modelo de usuário
│   ├── routes/
│   │   ├── adminRouter.js                # Rotas de admin
│   │   ├── produtosRouter.js             # Rotas de produtos
│   │   └── userRouter.js                 # Rotas de usuários
│   ├── db/
│   │   └── connection.js                 # Conexão MongoDB
│   ├── app.js                            # Setup da aplicação
│   └── package.json
│
└── front-end/
    ├── src/
    │   ├── components/
    │   │   ├── AdmDashbord.jsx            # Painel administrativo
    │   │   ├── AdmLogin.jsx               # Login de admin
    │   │   ├── Items.jsx                  # Display de produtos
    │   │   └── Navbar.jsx                 # Barra de navegação
    │   ├── functions/
    │   │   ├── Api.js                     # Configuração Axios
    │   │   ├── admin/
    │   │   │   ├── CheckAdminToken.js     # Verifica token admin
    │   │   │   ├── GetAdminToken.js       # Obtém token admin
    │   │   │   └── LogoutAdmin.js         # Logout de admin
    │   │   ├── produtos/
    │   │   │   ├── AddItem.js             # Adiciona produto
    │   │   │   ├── DeleteItems.js         # Deleta produto
    │   │   │   ├── GetItems.js            # Lista produtos
    │   │   │   ├── GetItemsBy.js          # Busca produtos
    │   │   │   └── UpdateItem.js          # Atualiza produto
    │   │   └── user/
    │   │       ├── CheckUserToken.js      # Verifica token user
    │   │       ├── GetUserToken.js        # Obtém token user
    │   │       ├── LogoutUser.js          # Logout de user
    │   │       └── RegisterUser.js        # Registro de usuário
    │   ├── hooks/
    │   │   ├── ProtectedRoute.jsx         # Rota protegida
    │   │   └── useAdminAuth.js            # Hook autenticação admin
    │   ├── pages/
    │   │   ├── AdminDashbord.jsx          # Página admin
    │   │   ├── AdminLogin.jsx             # Página login admin
    │   │   └── Inicio.jsx                 # Página inicial
    │   ├── routes/
    │   │   ├── AdminRoutes.jsx            # Rotas admin
    │   │   ├── ClientRoutes.jsx           # Rotas cliente
    │   │   └── PageRoutes.jsx             # Rotas página
    │   ├── main.jsx
    │   └── assets/
    ├── vite.config.js
    ├── package.json
    └── eslint.config.js
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- **Node.js** (v14+)
- **npm** ou **yarn**
- **MongoDB** (local ou Atlas)

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/E-commerce-React-JS.git
cd E-commerce-React-JS
```

### 2️⃣ Configurar Backend

```bash
cd back-end
npm install
```

Criar arquivo `.env` na raiz do `back-end/`:

```env
# MongoDB
MONGODB_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/ecommerce

# JWT Secrets
JWT_ADMIN_SECRET=sua_chave_secreta_admin_super_segura
JWT_USER_SECRET=sua_chave_secreta_user_super_segura

# Porta
PORT=5000
```

### 3️⃣ Configurar Frontend

```bash
cd ../front-end
npm install
```

Criar arquivo `.env` na raiz do `front-end/`:

```env
VITE_API_URL=http://localhost:5000
```

### 4️⃣ Iniciar o Projeto

**Terminal 1 - Backend:**
```bash
cd back-end
npm start
```

**Terminal 2 - Frontend:**
```bash
cd front-end
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

---

## 📡 Funcionalidades Principais

### 🛡️ Autenticação
- **Login de Administrador** - Acesso ao painel de controle
- **Registro de Usuário** - Criação de conta de cliente
- **JWT Authentication** - Segurança via tokens
- **Token Validation** - Verificação de autenticidade

### 📦 Gerenciamento de Produtos
- **Criar Produto** - Adicionar novo produto com imagem
- **Ler Produtos** - Listar todos os produtos
- **Atualizar Produto** - Editar informações do produto
- **Deletar Produto** - Remover produto do catálogo
- **Buscar Produto** - Filtrar por categoria ou nome

### 🏪 Painel Administrativo
- **Dashboard** - Visão geral de produtos
- **CRUD Completo** - Gerenciar produtos facilmente
- **Upload de Imagem** - Converter e salvar imagens em base64
- **Notificações** - Feedback visual de operações

### 🛒 Interface de Cliente (em desenvolvimento)
- **Listagem de Produtos** - Ver todos os produtos disponíveis
- **Carrinho de Compras** - Adicionar/remover produtos
- **Perfil de Usuário** - Gerenciar dados pessoais

---

## 🔌 Rotas da API

### Autenticação
```
POST   /api/admin/login        - Login de admin
POST   /api/admin/logout       - Logout de admin
POST   /api/user/register      - Registrar usuário
POST   /api/user/login         - Login de usuário
POST   /api/user/logout        - Logout de usuário
```

### Produtos
```
GET    /api/produtos           - Listar todos os produtos
GET    /api/produtos/:id       - Obter produto por ID
POST   /api/produtos           - Criar novo produto (admin)
PUT    /api/produtos/:id       - Atualizar produto (admin)
DELETE /api/produtos/:id       - Deletar produto (admin)
GET    /api/produtos/search    - Buscar produtos
```

---

## 🎯 Funções Principais do Backend

### Controllers

#### `adminRouterController.js`
- `loginAdmin()` - Autentica administrador com JWT
- `logoutAdmin()` - Encerra sessão de admin
- `validateAdminToken()` - Valida token JWT do admin

#### `produtosRouterController.js`
- `getProdutos()` - Retorna lista de todos os produtos
- `getProdutoById()` - Busca produto específico por ID
- `createProduto()` - Cria novo produto (validado)
- `updateProduto()` - Atualiza dados do produto
- `deleteProduto()` - Remove produto do banco

#### `userRouterController.js`
- `registerUser()` - Registra novo usuário com hash de senha
- `loginUser()` - Autentica usuário e retorna JWT
- `logoutUser()` - Destrói sessão de usuário
- `getUserProfile()` - Retorna dados do usuário autenticado

### Middlewares

#### `checkTokens.js`
- `verifyAdminToken()` - Valida token de admin
- `verifyUserToken()` - Valida token de usuário
- `extractTokenFromHeader()` - Extrai token do header

#### `validateMiddleware.js`
- `validateProdutoData()` - Valida dados do produto
- `validateUserData()` - Valida dados de usuário
- `validateAdminData()` - Valida dados de admin

#### `base64ToImageMiddleware.js`
- `convertBase64ToImage()` - Converte base64 para arquivo de imagem

---

## 🎯 Funções Principais do Frontend

### Functions

#### `admin/`
- `GetAdminToken.js` - Realiza login e armazena token
- `CheckAdminToken.js` - Verifica se admin está autenticado
- `LogoutAdmin.js` - Remove token e faz logout

#### `produtos/`
- `GetItems.js` - Busca todos os produtos da API
- `AddItem.js` - Envia novo produto ao servidor
- `UpdateItem.js` - Atualiza produto existente
- `DeleteItems.js` - Deleta produto do servidor
- `GetItemsBy.js` - Busca produtos com filtros

#### `user/`
- `RegisterUser.js` - Registra novo usuário
- `GetUserToken.js` - Faz login e armazena token
- `CheckUserToken.js` - Verifica autenticação do usuário
- `LogoutUser.js` - Remove token de usuário

### Components

#### `AdmDashbord.jsx`
- **Features:**
  - Preview de imagem antes de enviar
  - CRUD de produtos com notificações
  - Fetch automático após operações
  - Sidebar fixa para navegação
  - Toast notifications (sucesso/erro)

#### `AdmLogin.jsx`
- Formulário de login seguro
- Autenticação com JWT
- Redirecionamento automático

#### `Navbar.jsx`
- Navegação principal
- Links de produtos e categor

ias
- Menu de usuário

#### `Items.jsx`
- Exibição em grid de produtos
- Detalhes do produto
- Botões de carrinho

### Hooks

#### `useAdminAuth.js`
- Hook customizado para autenticação de admin
- Automatiza verificação e redirecionamento

#### `ProtectedRoute.jsx`
- Componente para rotas protegidas
- Redireciona não autenticados

---

## 🔒 Segurança

- ✅ Senhas com hash (bcryptjs)
- ✅ JWT com secrets seguros
- ✅ Validação de entrada de dados
- ✅ CORS configurado
- ✅ Rotas protegidas por autenticação

---

## 🚦 Status do Projeto

- ✅ Backend CRUD completo
- ✅ Autenticação JWT (Admin e User)
- ✅ Painel administrativo funcional
- ✅ Upload e exibição de imagens
- ✅ Sistema de notificações
- 🔄 Frontend cliente em desenvolvimento
- 🔄 Carrinho de compras
- 🔄 Sistema de pedidos

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ por [Seu Nome]**

