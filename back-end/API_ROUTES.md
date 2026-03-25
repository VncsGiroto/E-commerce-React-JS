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
- **Autenticação**: ✅ Requerida (CheckAdminToken)
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

**Base URL**: `/produto/`

### 1. Listar Todos os Produtos
```
GET /produto/
```
- **Descrição**: Retorna uma lista de todos os produtos cadastrados
- **Autenticação**: ❌ Não requerida
- **Status de Sucesso**: 200 OK

### 2. Listar Produtos por Categoria
```
GET /produto/:categoria
```
- **Descrição**: Retorna produtos de uma categoria específica
- **Autenticação**: ❌ Não requerida
- **Parâmetros**:
  - `categoria` (string): Nome da categoria desejada
- **Status de Sucesso**: 200 OK
- **Exemplo**: `GET /produto/eletrônicos`

### 3. Criar Novo Produto
```
POST /produto/criar
```
- **Descrição**: Cria um novo produto no catálogo
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Middlewares**: ProdutoCreateValidate, base64ToImageMiddleware
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
PUT /produto/update
```
- **Descrição**: Atualiza os dados de um produto existente
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Middlewares**: ProdutoUpdateValidate, base64ToImageMiddleware (condicional - apenas se houver imagem)
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
DELETE /produto/delete/:id
```
- **Descrição**: Remove um produto do catálogo
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Parâmetros**:
  - `id` (string): ID do produto a deletar
- **Status de Sucesso**: 200 OK
- **Erro**: 401 Unauthorized, 404 Not Found
- **Exemplo**: `DELETE /produto/delete/507f1f77bcf86cd799439011`

---

## � Rotas de Carrinho

**Base URL**: `/cart/`

### 1. Criar Novo Carrinho
```
POST /cart/criar
```
- **Descrição**: Cria um novo carrinho com múltiplos itens. O front-end envia apenas IDs e quantidades; o back-end busca os preços atuais do banco de dados (Fonte da Verdade) e calcula o total.
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Middlewares**: CartValidate
- **Body Esperado**:
```json
{
  "items": [
    {
      "produtoId": "string (ObjectId)",
      "quantidade": "number"
    },
    {
      "produtoId": "string (ObjectId)",
      "quantidade": "number"
    }
  ]
}
```
- **Resposta de Sucesso** (201 Created):
```json
{
  "message": "Carrinho criado com sucesso",
  "cartId": "string",
  "items": [
    {
      "produtoId": "string",
      "nome": "string",
      "preco": "number",
      "quantidade": "number",
      "subtotal": "number"
    }
  ],
  "valorTotal": "number",
  "quantidadeItens": "number"
}
```
- **Erro**: 404 Not Found (se algum produto não existir), 400 Bad Request (dados inválidos)

### 2. Obter Carrinho de um Usuário
```
GET /cart/:userId
```
- **Descrição**: Obtém o carrinho de um usuário específico
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Parâmetros**:
  - `userId` (string): ID do usuário
- **Status de Sucesso**: 200 OK
- **Resposta**:
```json
{
  "message": "Carrinho obtido com sucesso",
  "cartId": "string",
  "userId": "string",
  "items": [
    {
      "produtoId": "string",
      "nome": "string",
      "preco": "number",
      "quantidade": "number",
      "subtotal": "number"
    }
  ],
  "valorTotal": "number",
  "quantidadeItens": "number"
}
```
- **Erro**: 404 Not Found (carrinho não encontrado)

### 3. Atualizar Carrinho (Recalcular com Preços Atuais)
```
PUT /cart/atualizar/:cartId
```
- **Descrição**: Atualiza o carrinho e recalcula todos os preços com base nos dados atuais do banco. Implementa o princípio "cliente propõe, servidor dita o preço".
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Parâmetros**:
  - `cartId` (string): ID do carrinho
- **Body Esperado**:
```json
{
  "items": [
    {
      "produto_id": "string (ObjectId)",
      "quantidade": "number"
    }
  ]
}
```
- **Resposta de Sucesso** (200 OK): Mesmo formato da criação
- **Erro**: 404 Not Found, 400 Bad Request

### 4. Remover Item do Carrinho
```
DELETE /cart/:cartId/item/:itemId
```
- **Descrição**: Remove um item específico do carrinho e recalcula o total
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Parâmetros**:
  - `cartId` (string): ID do carrinho
  - `itemId` (string): ID do produto a remover
- **Resposta de Sucesso** (200 OK):
```json
{
  "message": "Item removido com sucesso",
  "removedItem": {
    "produtoId": "string",
    "nome": "string",
    "preco": "number",
    "quantidade": "number",
    "subtotal": "number"
  },
  "items": [],
  "valorTotal": "number",
  "quantidadeItens": "number"
}
```
- **Erro**: 404 Not Found

### 5. Recalcular Carrinho (Atualizar Preços)
```
POST /cart/recalcular/:cartId
```
- **Descrição**: Recalcula o carrinho com os preços atuais do banco de dados. Útil quando há mudanças de preço já após o carrinho ter sido criado. Retorna relatório detalhado de mudanças de preço.
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Parâmetros**:
  - `cartId` (string): ID do carrinho
- **Resposta de Sucesso** (200 OK):
```json
{
  "message": "Carrinho recalculado com sucesso",
  "cartId": "string",
  "items": [],
  "valorTotal": "number",
  "quantidadeItens": "number",
  "mudancasDePreco": [
    {
      "nome": "string",
      "precoAnterior": "number",
      "precoAtual": "number",
      "diferenca": "number"
    }
  ],
  "houveMudancas": "boolean"
}
```
- **Erro**: 404 Not Found

### 6. Deletar Carrinho Completamente
```
DELETE /cart/:cartId
```
- **Descrição**: Remove um carrinho completamente do sistema
- **Autenticação**: ✅ Requerida (CheckUserToken)
- **Parâmetros**:
  - `cartId` (string): ID do carrinho
- **Resposta de Sucesso** (200 OK):
```json
{
  "message": "Carrinho removido com sucesso",
  "cartId": "string"
}
```
- **Erro**: 404 Not Found

### 7. Listar Todos os Carrinhos
```
GET /cart/
```
- **Descrição**: Retorna uma lista de todos os carrinhos (apenas admin). Útil para auditoria e análise de vendas.
- **Autenticação**: ✅ Requerida (CheckAdminToken)
- **Resposta de Sucesso** (200 OK):
```json
{
  "message": "Carrinhos obtidos com sucesso",
  "total": "number",
  "carrinhos": []
}
```
- **Erro**: 401 Unauthorized (não é admin)

---

## �🔐 Rotas de Administrador

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

#### ProdutoCreateValidate
- Valida os dados de entrada para criação de produtos
- Verifica preços, nomes e campos obrigatórios

#### ProdutoUpdateValidate
- Valida os dados de entrada para atualização de produtos
- Verifica preços, nomes e campos obrigatórios

#### CartValidate
- Valida os dados de entrada para operações de carrinho
- Verifica produto_id e quantidade

#### base64ToImageMiddleware
- Converte imagens em base64 para arquivos salvos no servidor
- Armazena imagens em `/static/images/`
- Middleware condicional: apenas processa se houver imagem no body

---

## 📊 Resumo de Endpoints

| Método | Rota | Autenticação | Descrição |
|--------|------|---------------|-----------|
| GET | `/user/` | ❌ | Listar usuários |
| POST | `/user/create` | ❌ | Registrar usuário |
| POST | `/user/login` | ❌ | Login usuário |
| GET | `/user/me` | ✅ User | Dados do usuário |
| GET | `/user/logout` | ✅ User | Logout usuário |
| GET | `/produto/` | ❌ | Listar produtos |
| GET | `/produto/:categoria` | ❌ | Produtos por categoria |
| POST | `/produto/criar` | ✅ Admin | Criar produto |
| PUT | `/produto/update` | ✅ Admin | Atualizar produto |
| DELETE | `/produto/delete/:id` | ✅ Admin | Deletar produto |
| POST | `/cart/criar` | ✅ User | Criar carrinho com múltiplos itens |
| GET | `/cart/:userId` | ✅ User | Obter carrinho do usuário |
| PUT | `/cart/atualizar/:cartId` | ✅ User | Atualizar carrinho com novos preços |
| DELETE | `/cart/:cartId/item/:itemId` | ✅ User | Remover item do carrinho |
| POST | `/cart/recalcular/:cartId` | ✅ User | Recalcular com preços atuais |
| DELETE | `/cart/:cartId` | ✅ User | Deletar carrinho |
| GET | `/cart/` | ✅ Admin | Listar todos os carrinhos |
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
curl -X GET http://localhost:4000/produto/
```

### Listar Produtos por Categoria
```bash
curl -X GET http://localhost:4000/produto/eletrônicos
```

### Criar Novo Produto (Admin)
```bash
curl -X POST http://localhost:4000/produto/criar \
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

### Criar Item no Carrinho (Usuário)
```bash
curl -X POST http://localhost:4000/cart/criar \
  -H "Content-Type: application/json" \
  -H "Cookie: token=seu_token_usuario_aqui" \
  -d '{
    "items": [
      {
        "produto_id": "507f1f77bcf86cd799439011",
        "quantidade": 2
      },
      {
        "produto_id": "507f1f77bcf86cd799439012",
        "quantidade": 1
      }
    ]
  }'
```

### Obter Carrinho do Usuário
```bash
curl -X GET http://localhost:4000/cart/seu_user_id \
  -H "Cookie: token=seu_token_usuario_aqui"
```

### Atualizar Carrinho (Recalcular Preços)
```bash
curl -X PUT http://localhost:4000/cart/atualizar/seu_cart_id \
  -H "Content-Type: application/json" \
  -H "Cookie: token=seu_token_usuario_aqui" \
  -d '{
    "items": [
      {
        "produto_id": "507f1f77bcf86cd799439011",
        "quantidade": 3
      }
    ]
  }'
```

### Remover Item do Carrinho
```bash
curl -X DELETE http://localhost:4000/cart/seu_cart_id/item/507f1f77bcf86cd799439011 \
  -H "Cookie: token=seu_token_usuario_aqui"
```

### Recalcular Carrinho com Preços Atuais
```bash
curl -X POST http://localhost:4000/cart/recalcular/seu_cart_id \
  -H "Cookie: token=seu_token_usuario_aqui"
```

### Deletar Carrinho Completamente
```bash
curl -X DELETE http://localhost:4000/cart/seu_cart_id \
  -H "Cookie: token=seu_token_usuario_aqui"
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

## 🎯 Princípios de Implementação do Sistema de Carrinho

### 1. O Princípio da "Burrice" do Front-end
O front-end é tratado como um terminal de exibição, **não** como uma calculadora:

- **O que o front-end envia**: Apenas IDs de produtos e quantidades
- **O que o front-end **NUNCA** envia**: Preços unitários, descontos calculados, valores totais
- **Comportamento**: Se o front-end enviar um campo `total` ou `preco`, o back-end simplesmente ignora

### 2. A "Fonte da Verdade" no Back-end
Assim que o Node.js recebe os IDs, a primeira instrução interna é uma **consulta ao banco de dados**:

- **Sincronismo de Dados**: O sistema busca o preço que está gravado no banco de dados no exato milissegundo da requisição
- **Evita Cache Obsoleto**: Impossibilita que um usuário compre um produto por um preço antigo que ficou cacheado no navegador após uma alteração administrativa
- **Integridade**: Não há desincronização entre o que o front-end mostra e o que é realmente cobrado

### 3. O Fluxo de Cálculo e Resposta
Em vez de apenas confirmar "OK", o back-end **reconstrói o carrinho com dados atualizados** e devolve um objeto estruturado:

**Algoritmo**:
1. **Iteração**: Para cada ID recebido, buscar o documento completo do produto
2. **Validação**: Verificar se TODOS os produtos existem (se algum não existir, retornar erro imediatamente)
3. **Cálculo Unitário**: Multiplicar o preço do banco × quantidade enviada
4. **Acumulação**: Somar todos os subtotais em uma variável global de Total
5. **Resposta Detalhada**: Devolver nome, preço unitário, quantidade e subtotal de cada item

### 4. Verificações de Integridade
Duas camadas de validação garantem segurança e confiabilidade:

- **Validação de Existência**: Se um dos IDs não existir no banco, a operação é interrompida com erro 404
- **Validação de Quantidade**: Quantidade deve ser ≥ 1, caso contrário retorna erro 400

### Resumo da Regra de Ouro
**"O cliente propõe o que quer comprar (ID + Quantidade), mas é o servidor quem dita quanto custa e se a venda é possível."**

---

## ⚠️ Códigos de Erro Comuns
---

## 📋 Observações de Implementação

- O middleware de imagem para produtos é **condicional** na rota de atualização: apenas processa se houver uma imagem no body da requisição
- Todos os tokens são enviados/recebidos via cookies (recomenda-se HttpOnly)
- As imagens de produtos são convertidas de base64 e salvas em `/static/images/`
- O CORS está configurado para aceitar requisições apenas de `http://localhost:5173`
- Middlewares de validação garantem que dados sensíveis e estruturas são válidas antes do processamento
- Tokens de autenticação devem ser armazenados de forma segura no cliente


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
