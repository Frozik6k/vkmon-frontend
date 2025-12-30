import axios, { AxiosHeaders } from 'axios';
import {
  AiGenerateRequest,
  AiPostDto,
  AutoPostRequest,
  LoginRequest,
  RegisterRequest,
  VkAccount,
  VkGroup,
} from './types';
import { mockAccounts, mockAiPost, mockGroups, mockLogs } from './mockData';

const defaultHeaders = new AxiosHeaders();
const apiToken = import.meta.env.VITE_API_TOKEN;

if (apiToken) {
  defaultHeaders.set('Authorization', `Bearer ${apiToken}`);
}

const AUTH_STORAGE_KEY = 'vkmon-auth';

type AuthCredentials = {
  username: string;
  password: string;
};

const setAuthCredentials = (credentials: AuthCredentials) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(credentials));
};

const getAuthCredentials = (): AuthCredentials | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as AuthCredentials;
    if (parsed?.username && parsed?.password) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to read stored credentials', error);
  }
  return null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const requestUrl = typeof config.url === 'string' ? config.url : '';
  if (requestUrl === '/login' || requestUrl === '/register') {
    return config;
  }
  const credentials = getAuthCredentials();
  if (credentials) {
    const token = btoa(`${credentials.username}:${credentials.password}`);
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    } else if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }
    config.headers.set('Authorization', `Basic ${token}`);
  }
  return config;
});

export const authApi = {
  login: async (payload: LoginRequest) => {
    await api.post('/login', payload);
    setAuthCredentials(payload);
    return { ok: true };
  },
  register: async (payload: RegisterRequest) => {
    await api.post('/register', payload);
    return { ok: true };
  },
};

export const accountsApi = {
  async list(): Promise<VkAccount[]> {
    try {
      const { data } = await api.get<VkAccount[]>('/vk-accounts');
      return data;
    } catch (error) {
      console.warn('Falling back to mock accounts', error);
      return mockAccounts;
    }
  },
  async create(payload: Pick<VkAccount, 'alias' | 'token'>): Promise<VkAccount> {
    try {
      const { data } = await api.post<VkAccount>('/vk-accounts', payload);
      return data;
    } catch (error) {
      console.warn('Mock account creation', error);
      return {
        id: Date.now(),
        username: 'vk.com/new-account',
        avatar: 'https://placehold.co/100x100',
        status: 'ACTIVE',
        lastSyncAt: new Date().toISOString(),
        groupsCount: 0,
        ...payload,
      };
    }
  },
  async groups(accountId: number): Promise<VkGroup[]> {
    try {
      const { data } = await api.get<VkGroup[]>(`/vk-accounts/${accountId}/groups`);
      return data;
    } catch (error) {
      console.warn('Using mock VK groups', error);
      return mockGroups;
    }
  },
};

export const autopostApi = {
  async update(payload: AutoPostRequest) {
    await api.post('/autopost', payload);
    return payload;
  },
};

export const aiApi = {
  async generate(payload: AiGenerateRequest): Promise<AiPostDto> {
    try {
      const { data } = await api.post<AiPostDto>('/ai/post', payload);
      return data;
    } catch (error) {
      console.warn('AI generation mocked', error);
      return mockAiPost;
    }
  },
};

export const logsApi = {
  async list() {
    try {
      const { data } = await api.get('/logs');
      return data;
    } catch (error) {
      console.warn('Mock log records', error);
      return mockLogs;
    }
  },
};
