# Testes automatizados da API ServeRest

Este projeto verifica o fluxo de usuários da [API ServeRest](https://serverest.dev/), da criação à exclusão. Os testes usam [Mocha](https://mochajs.org/), Axios e dados aleatórios gerados pelo Faker. A mesma sequência também está disponível como uma collection do Postman.

## O que é testado

Em cada execução, os testes criam um usuário administrador com dados aleatórios, fazem login para obter um token JWT e então:

1. Conferem o cadastro do usuário.
2. Verificam que ele aparece na lista.
3. Consultam seus dados pelo ID.
4. Atualizam seus dados e confirmam as alterações.
5. Excluem o usuário.

Se a etapa de exclusão falhar, uma rotina de limpeza tenta remover o usuário criado. Cada execução realiza aproximadamente sete chamadas à API. Como o serviço limita as requisições, evite iniciar várias execuções ao mesmo tempo.

## Executar localmente

### Requisitos

- Node.js 20.19 ou superior.
- npm.

Instale as dependências e inicie os testes:

```bash
npm ci
npm test
```

Por padrão, os testes usam `https://serverest.dev`. Para apontar para outra instância, defina `BASE_URL` antes de executar:

**PowerShell**

```powershell
$env:BASE_URL = "https://serverest.dev"
npm test
```

**Bash**

```bash
BASE_URL=https://serverest.dev npm test
```

## Executar pelo GitHub Actions

O workflow [`API tests`](.github/workflows/api-tests.yml) instala as dependências com `npm ci` e executa `npm test` em Node.js 20.19. Ele é iniciado automaticamente:

- Quando há um **push** para qualquer branch.
- Quando um **pull request** é aberto ou atualizado.
- Manualmente, pela aba **Actions** do repositório.

### Iniciar uma execução manual

1. Abra o repositório no GitHub e selecione a aba **Actions**.
2. Na lista à esquerda, escolha **API tests**.
3. Clique em **Run workflow**.
4. Selecione a branch que deseja testar e clique novamente em **Run workflow**.
5. Abra a execução recém-iniciada e selecione o job **Mocha tests** para acompanhar cada etapa e a saída do Mocha.

Quando os testes terminam, o job aparece como **verde** se passaram ou **vermelho** se alguma etapa falhou. O resumo da execução mostra quantos testes passaram, falharam ou foram ignorados, com a duração e o resultado de cada teste. Para consultar os detalhes, abra a etapa **Run API tests and generate JSON report** nos detalhes do job. Em **Artifacts**, baixe `mocha-test-report` para obter o relatório JSON completo; ele fica disponível por 14 dias.

Após corrigir um problema, envie novas alterações para iniciar outra execução; também é possível usar **Re-run jobs** na página da execução. O workflow limita as permissões a somente leitura do conteúdo do repositório, tem um tempo máximo de cinco minutos e evita executar duas cópias desse fluxo simultaneamente. As execuções usam o serviço público `serverest.dev`; não é necessário configurar secrets para rodar os testes.

## Depurar e consultar logs HTTP

Para ver o rastreamento completo do Mocha e os detalhes das requisições e respostas HTTP (método, URL, cabeçalhos e corpo), execute no PowerShell:

```powershell
$env:DEBUG_HTTP = "1"
npm run test:debug
Remove-Item Env:DEBUG_HTTP
```

No Bash:

```bash
DEBUG_HTTP=1 npm run test:debug
```

Senhas e tokens JWT são ocultados dos logs. Sem `DEBUG_HTTP=1`, o modo `test:debug` ainda mostra o rastreamento completo do Mocha se um teste falhar, mas não imprime os detalhes HTTP.

## Endpoints usados

O ServeRest publica os endpoints de usuários em português. Por isso, os testes usam `/usuarios` em vez de `/users`.

| Operação | Endpoint |
|---|---|
| Listar usuários | `GET /usuarios` |
| Criar usuário | `POST /usuarios` |
| Consultar usuário | `GET /usuarios/{id}` |
| Atualizar usuário | `PUT /usuarios/{id}` |
| Excluir usuário | `DELETE /usuarios/{id}` |
| Autenticar e obter o JWT | `POST /login` |

O cadastro e a atualização enviam `administrador` como string (`"true"`), conforme esperado pelo serviço. O token obtido no login é usado nas operações autenticadas.

## Usar a collection do Postman

Importe [`postman/ServeRest Users.postman_collection.json`](postman/ServeRest%20Users.postman_collection.json) no Postman e execute as requisições na ordem apresentada. A collection gera dados aleatórios e guarda o ID do usuário e o token JWT em variáveis para as etapas seguintes.
