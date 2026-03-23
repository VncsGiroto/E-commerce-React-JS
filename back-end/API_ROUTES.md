# 📚 Documentação de Rotas - API E-commerce

## 🌐 Configurações Gerais
- **URL Base**: `http://localhost:4000`
- **CORS Origin**: `http://localhost:5173`
- **Recursos Estáticos**: `/static` (imagens, etc.)

---

## 👤 Rotas de Usuário

**Base URL**: `/user/`

### 1. Listar Todos os Usuários
```
GET /user/
```
- **Descrição**: Retorna uma lista de todos os usuários cadastrados
- **Autenticação**: ❌ Não requerida
- **Status de Sucesso**: 200 OK

### 2. Criar Novo Usuário (Registro)
```
POST /user/create
```
- **Descrição**: Registra um novo usuário no sistema
- **Autenticação**: ❌ Não requerida
- **Middlewares**: UserValidate
- **Body Esperado**:
```json
{
  "nome": "string",
  "email": "string",
  "senha": "string"
}
```
- **Status de Sucesso**: 201 Created

### 3. Login de Usuário
```
POST /user/login
```
- **Descrição**: Autentica um usuário e retorna um token
- **Autenticação**: ❌ Não requerida
- **Body Esperado**:
```json
{
  "email": "string",
  "senha": "string"
}
```
- **Status de Sucesso**: 200 OK
- **Retorno**: Token de autenticação (cookie)

### 4. Obter Dados do Usuário Logado
```
GET /user/me
```
- **Descrição**: Retorna os dados do usuário autenticado
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Status de Sucesso**: 200 OK
- **Erro**: 401 Unauthorized (token inválido ou expirado)

### 5. Logout do Usuário
```
GET /user/logout
```
- **Descrição**: Faz logout do usuário e invalida o token
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Status de Sucesso**: 200 OK
- **Erro**: 401 Unauthorized

---

## 📦 Rotas de Produtos

**Base URL**: `/`

### 1. Listar Todos os Produtos
```
GET /
```
- **Descrição**: Retorna uma lista de todos os produtos cadastrados
- **Autenticação**: ❌ Não requerida
- **Status de Sucesso**: 200 OK

### 2. Listar Produtos por Categoria
```
GET /:categoria
```
- **Descrição**: Retorna produtos de uma categoria específica
- **Autenticação**: ❌ Não requerida
- **Parâmetros**:
  - `categoria` (string): Nome da categoria desejada
- **Status de Sucesso**: 200 OK
- **Exemplo**: `GET /eletrônicos`

### 3. Criar Novo Produto
```
POST /criar
```
- **Descrição**: Cria um novo produto no catálogo
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Middlewares**: ProdutoValidate, base64ToImageMiddleware
- **Body Esperado**:
```json
{
  "nome": "string",
  "descricao": "string",
  "categoria": "string",
  "preco": "number",
  "imagem": "string (base64 ou URL)"
}
```
- **Status de Sucesso**: 201 Created
- **Erro**: 401 Unauthorized (não é admin)

### 4. Atualizar Produto
```
PUT /update
```
- **Descrição**: Atualiza os dados de um produto existente
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Middlewares**: ProdutoValidate, base64ToImageMiddleware
- **Body Esperado**:
```json
{
  "id": "string",
  "nome": "string",
  "descricao": "string",
  "categoria": "string",
  "preco": "number",
  "imagem": "string (base64 ou URL)"
}
```
- **Status de Sucesso**: 200 OK
- **Erro**: 401 Unauthorized (não é admin)

### 5. Deletar Produto
```
DELETE /delete/:id
```
- **Descrição**: Remove um produto do catálogo
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Parâmetros**:
  - `id` (string): ID do produto a deletar
- **Status de Sucesso**: 200 OK
- **Erro**: 401 Unauthorized, 404 Not Found
- **Exemplo**: `DELETE /delete/507f1f77bcf86cd799439011`

---

## 🔐 Rotas de Administrador

**Base URL**: `/admin/`

### 1. Criar Novo Admin
```
POST /admin/criar
```
- **Descrição**: Cria uma nova conta de administrador
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Body Esperado**:
```json
{
  "email": "string",
  "senha": "string",
  "nome": "string"
}
```
- **Status de Sucesso**: 201 Created
- **Erro**: 401 Unauthorized (usuário não é admin)

### 2. Login Admin
```
POST /admin/login
```
- **Descrição**: Autentica um administrador no sistema
- **Autenticação**: ❌ Não requerida
- **Body Esperado**:
```json
{
  "email": "string",
  "senha": "string"
}
```
- **Status de Sucesso**: 200 OK
- **Retorno**: Token de autenticação (cookie)

### 3. Obter Dados do Admin Logado
```
GET /admin/getme
```
- **Descrição**: Retorna os dados do administrador autenticado
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Status de Sucesso**: 200 OK
- **Erro**: 401 Unauthorized (token inválido ou expirado)

### 4. Logout Admin
```
POST /admin/logout
```
- **Descrição**: Faz logout do administrador e invalida o token
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Status de Sucesso**: 200 OK
- **Erro**: 401 Unauthorized

---

## 🔑 Autenticação e Segurança

### Tipos de Autenticação

#### CheckAdminToken
- Valida se o usuário é um administrador autorizado
- Verifica o token nos cookies da requisição
- Retorna 401 Unauthorized se o token for inválido ou expirado

#### CheckUserToken
- Valida se o usuário é um usuário registrado autenticado
- Verifica o token nos cookies da requisição
- Retorna 401 Unauthorized se o token for inválido ou expirado

### Middlewares Especiais

#### UserValidate
- Valida os dados de entrada para operações de usuário
- Verifica emails, senhas e campos obrigatórios

#### ProdutoValidate
- Valida os dados de entrada para operações de produtos
- Verifica preços, nomes e campos obrigatórios

#### base64ToImageMiddleware
- Converte imagens em base64 para arquivos salvos no servidor
- Armazena imagens em `/static/images/`

---

## 📊 Resumo de Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|---------------|-----------|
| GET | `/user/` | ❌ | Listar usuários |
| POST | `/user/create` | ❌ | Registrar usuário |
| POST | `/user/login` | ❌ | Login usuário |
| GET | `/user/me` | ✅ User | Dados do usuário |
| GET | `/user/logout` | ✅ User | Logout usuário |
| GET | `/` | ❌ | Listar produtos |
| GET | `/:categoria` | ❌ | Produtos por categoria |
| POST | `/criar` | ✅ Admin | Criar produto |
| PUT | `/update` | ✅ Admin | Atualizar produto |
| DELETE | `/delete/:id` | ✅ Admin | Deletar produto |
| POST | `/admin/criar` | ✅ Admin | Criar admin |
| POST | `/admin/login` | ❌ | Login admin |
| GET | `/admin/getme` | ✅ Admin | Dados do admin |
| POST | `/admin/logout` | ✅ Admin | Logout admin |

---

## 🚀 Exemplos de Uso

### Registrar um Novo Usuário
```bash
curl -X POST http://localhost:4000/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### Login de Usuário
```bash
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

### Obter Dados do Usuário Logado
```bash
curl -X GET http://localhost:4000/user/me \
  -H "Cookie: token=seu_token_aqui"
```

### Listar Todos os Produtos
```bash
curl -X GET http://localhost:4000/
```

### Listar Produtos por Categoria
```bash
curl -X GET http://localhost:4000/eletrônicos
```

### Criar Novo Produto (Admin)
```bash
curl -X POST http://localhost:4000/criar \
  -H "Content-Type: application/json" \
  -H "Cookie: token=seu_token_admin_aqui" \
  -d '{
    "nome": "Notebook",
    "descricao": "Notebook de alta performance",
    "categoria": "eletrônicos",
    "preco": 3500.00,
    "imagem": "base64_string_aqui"
  }'
```

### Login Admin
```bash
curl -X POST http://localhost:4000/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "senha": "senhaadmin123"
  }'
```

---

## ⚠️ Códigos de Erro Comuns

| Código | Significado |
|--------|------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou expirado |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

---

## 📝 Notas Importantes

- Todos os tokens são enviados/recebidos via cookies (HttpOnly recomendado)
- As imagens de produtos são convertidas de base64 e salvas em `/static/images/`
- O CORS está configurado para aceitar requisições apenas de `http://localhost:5173`
- Todos os dados sensíveis devem ser validados antes de serem processados
- Tokens de autenticação devem ser armazenados de forma segura no cliente

---

**Última atualização**: Março 2026
