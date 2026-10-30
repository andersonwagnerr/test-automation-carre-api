import axios from 'axios';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'node:crypto';

const api = axios.create({
  baseURL: process.env.BASE_URL || 'https://serverest.dev',
  timeout: 10000,
});

function redactSensitiveData(value) {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        /password|authorization|token|secret/i.test(key)
          ? '[REDACTED]'
          : redactSensitiveData(entry),
      ]),
    );
  }

  return value;
}

function logHttpDetails(label, details) {
  if (process.env.DEBUG_HTTP !== '1') {
    return;
  }

  console.log(`\n[HTTP ${label}]\n${JSON.stringify(redactSensitiveData(details), null, 2)}`);
}

api.interceptors.request.use((config) => {
  logHttpDetails('REQUEST', {
    method: config.method?.toUpperCase(),
    url: new URL(config.url, config.baseURL).toString(),
    headers: config.headers,
    body: config.data,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    logHttpDetails('RESPONSE', {
      status: response.status,
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      headers: response.headers,
      body: response.data,
    });

    return response;
  },
  (error) => {
    if (error.response) {
      logHttpDetails('ERROR RESPONSE', {
        status: error.response.status,
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        headers: error.response.headers,
        body: error.response.data,
      });
    } else if (process.env.DEBUG_HTTP === '1') {
      console.error('[HTTP ERROR]', error.message);
    }

    return Promise.reject(error);
  },
);

describe('ServeRest - usuários', function () {
  this.timeout(30000);

  const user = {
    nome: faker.person.fullName(),
    email: `teste-${randomUUID()}@andersonwagner.com`,
    password: faker.internet.password({ length: 16 }),
    administrador: 'true',
  };
  let createdUserResponse;
  let userId;
  let authorization;
  let userDeleted = false;

  before(async function () {
    createdUserResponse = await api.post('/usuarios', user);
    userId = createdUserResponse.data._id;

    if (!userId) {
      throw new Error('A resposta da criação não contém o identificador do usuário.');
    }

    const loginResponse = await api.post('/login', {
      email: user.email,
      password: user.password,
    });
    authorization = loginResponse.data.authorization;

    if (!authorization) {
      throw new Error('A resposta do login não contém o token JWT.');
    }

    api.defaults.headers.common.Authorization = authorization;
  });

  after(async function () {
    if (userId && authorization && !userDeleted) {
      const cleanupResponse = await api.delete(`/usuarios/${userId}`);
      userDeleted = true;
      expect(cleanupResponse.status).to.equal(200);
    }
  });

  it('cria um usuário administrador', function () {
    expect(createdUserResponse.status).to.equal(201);
    expect(createdUserResponse.data.message).to.equal('Cadastro realizado com sucesso');
    expect(userId).to.be.a('string').and.not.empty;
  });

  it('lista os usuários', async function () {
    const response = await api.get('/usuarios');

    expect(response.status).to.equal(200);
    expect(response.data.usuarios).to.be.an('array');
    expect(response.data.usuarios.some(({ _id }) => _id === userId)).to.equal(true);
  });

  it('consulta um usuário pelo identificador', async function () {
    const response = await api.get(`/usuarios/${userId}`);

    expect(response.status).to.equal(200);
    expect(response.data).to.include({
      _id: userId,
      nome: user.nome,
      email: user.email,
      administrador: user.administrador,
    });
  });

  it('atualiza os dados do usuário', async function () {
    const updatedUser = {
      nome: faker.person.fullName(),
      email: `atualizado-${randomUUID()}@andersonwagner.com`,
      password: faker.internet.password({ length: 16 }),
      administrador: 'true',
    };
    const response = await api.put(`/usuarios/${userId}`, updatedUser);

    expect(response.status).to.equal(200);
    expect(response.data.message).to.equal('Registro alterado com sucesso');

    const updatedUserResponse = await api.get(`/usuarios/${userId}`);
    expect(updatedUserResponse.data).to.include({
      _id: userId,
      nome: updatedUser.nome,
      email: updatedUser.email,
      administrador: updatedUser.administrador,
    });
  });

  it('exclui o usuário', async function () {
    const response = await api.delete(`/usuarios/${userId}`);

    userDeleted = true;
    expect(response.status).to.equal(200);
    expect(response.data.message).to.equal('Registro excluído com sucesso');
  });
});
