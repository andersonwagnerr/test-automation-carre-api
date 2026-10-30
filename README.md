# Testes de API - ServeRest

Testes automatizados de usuários usando Mocha, Axios e dados aleatórios do Faker, além de uma collection do Postman para executar o mesmo fluxo CRUD.

## Pré-requisitos

- Node.js 20.19 ou superior
- npm

## Executar os testes

```bash
npm install
npm test
```

O GitHub Actions executa `npm test` automaticamente em pushes, pull requests e também pode ser iniciado manualmente pela aba **Actions** do repositório. O workflow está em [`.github/workflows/api-tests.yml`](.github/workflows/api-tests.yml) e usa Node.js 20.19.

Por padrão, os testes usam `https://serverest.dev`. Para apontar para outra instância:

```powershell
$env:BASE_URL = "https://serverest.dev"
npm test
```

O fluxo cria um usuário administrador com dados aleatórios, autentica para obter o JWT, lista e consulta usuários, atualiza os dados e exclui o usuário ao final. Se a exclusão do teste falhar, um hook tenta remover o usuário criado durante a limpeza.

Cada execução consome aproximadamente sete requisições, abaixo do limite informado de 100 requisições por minuto. Evite execuções paralelas ou repetidas em sequência.

## Depuração e logs HTTP

Para executar os testes com rastreamento completo do Mocha e imprimir os detalhes das requisições e respostas HTTP (método, URL, cabeçalhos e corpo), use PowerShell:

```powershell
$env:DEBUG_HTTP = "1"
npm run test:debug
Remove-Item Env:DEBUG_HTTP
```

Os campos de senha, token e autorização são ocultados nos logs. Sem `DEBUG_HTTP=1`, o comando `npm run test:debug` ainda mostra o rastreamento completo de falhas do Mocha, mas não imprime os detalhes HTTP.

## Rotas utilizadas

O ServeRest publica os endpoints de usuários em português:

| Operação | Endpoint |
|---|---|
| Listar usuários | `GET /usuarios` |
| Criar usuário | `POST /usuarios` |
| Consultar usuário | `GET /usuarios/{id}` |
| Atualizar usuário | `PUT /usuarios/{id}` |
| Excluir usuário | `DELETE /usuarios/{id}` |
| Autenticar e obter JWT | `POST /login` |

As rotas `/users` indicadas inicialmente não são aceitas pelo site ServeRest. Os testes e a collection usam `/usuarios`, que corresponde aos endpoints reais da API. O corpo de criação e atualização envia `administrador` como string (`"true"`), conforme o formato esperado pelo serviço.

## Postman

Importe [`postman/ServeRest Users.postman_collection.json`](postman/ServeRest%20Users.postman_collection.json) no Postman e execute as requisições na ordem da collection. O fluxo gera dados aleatórios, guarda o ID e o token JWT em variáveis e usa o token nas requisições autenticadas.
