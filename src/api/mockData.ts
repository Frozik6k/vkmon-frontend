import { AiPostDto, Deactivated, LogItem, SubscriptionPlan, VkAccount, VkGroup } from './types';

export const mockAccounts: VkAccount[] = [
  {
    id: 101,
    token: 'demo-token',
    alias: 'SMM-основной',
    username: 'vk.com/john.doe',
    avatar: 'https://i.pravatar.cc/100?img=12',
    status: 'ACTIVE',
    lastSyncAt: new Date().toISOString(),
    groupsCount: 4,
  },
  {
    id: 202,
    token: 'demo-token-2',
    alias: 'Тестовый аккаунт',
    username: 'vk.com/demo',
    avatar: 'https://i.pravatar.cc/100?img=32',
    status: 'ERROR',
    lastSyncAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    groupsCount: 2,
  },
];

export const mockGroups: VkGroup[] = [
  {
    vkGroupId: 1,
    name: 'VKmon — автопостинг',
    avatar: 'https://placehold.co/64x64',
    ageLimits: 'NONE',
    isEnabled: true,
	deactivated: Deactivated.active,
    lastPostAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    fixedPost: 1345,
  },
  {
    vkGroupId: 2,
    name: 'Маркетинг B2B',
    avatar: 'https://placehold.co/64x64',
    ageLimits: 'SIXTEEN',
    isEnabled: false,
	deactivated: Deactivated.banned,
    lastPostAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    fixedPost: 0,
  },
];

export const mockAvailableGroups: VkGroup[] = [
  ...mockGroups,
  {
    vkGroupId: 3,
    name: 'VKmon — Кейсы клиентов',
    avatar: 'https://placehold.co/64x64',
    ageLimits: 'NONE',
    isEnabled: true,
	deactivated: Deactivated.active,
    lastPostAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    fixedPost: 0,
  },
  {
    vkGroupId: 4,
    name: 'HR & команда VK',
    avatar: 'https://placehold.co/64x64',
    ageLimits: 'SIXTEEN',
    isEnabled: false,
	deactivated: Deactivated.deleted,
    lastPostAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    fixedPost: 112,
  },
  {
    vkGroupId: 5,
    name: 'Внутренние новости продукта',
    avatar: 'https://placehold.co/64x64',
    ageLimits: 'EIGHTEEN',
    isEnabled: true,
	deactivated: Deactivated.active,
    lastPostAt: undefined,
    fixedPost: 0,
  },
];

export const mockAiPost: AiPostDto = {
  post: 'Готовый черновик поста с хештегами #vkmon #smm #autopost',
  imageUrl: 'https://placehold.co/600x300',
};

export const mockLogs: LogItem[] = [
  {
    id: 'l-1',
    level: 'INFO',
    message: 'Синхронизация групп завершена успешно',
    createdAt: new Date().toISOString(),
    source: 'vk-groups',
  },
  {
    id: 'l-2',
    level: 'WARN',
    message: 'Токен для аккаунта 202 устарел',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    source: 'vk-accounts',
  },
  {
    id: 'l-3',
    level: 'ERROR',
    message: 'Не удалось опубликовать пост в группе 2',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    source: 'autopost',
  },
];

export const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Базовый',
    price: '590 ₽/мес',
    features: ['1 аккаунт VK', '2 автопостинга', 'Поддержка по почте'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '1290 ₽/мес',
    features: ['5 аккаунтов VK', 'Неограниченные автопосты', 'AI-генерация постов'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'По запросу',
    features: ['SLA', 'Командный доступ', 'Приоритетная поддержка'],
  },
];
