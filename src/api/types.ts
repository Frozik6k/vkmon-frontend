export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  id: string;
}

export type VkAccountStatus = 'ACTIVE' | 'ERROR' | 'DISABLED';

export interface VkAccount {
  id: number;
  token: string;
  alias: string;
  username: string;
  avatar: string;
  status: VkAccountStatus;
  lastSyncAt?: string;
  groupsCount: number;
}

export type AgeLimits = 'NONE' | 'SIXTEEN' | 'EIGHTEEN';

export enum Deactivated {
  deleted = 'deleted',
  banned = 'banned',
  active = 'active',
}

export interface VkGroup {
  vkGroupId: number;
  name: string;
  avatar: string;
  ageLimits: AgeLimits;
  isEnabled: boolean;
  isUse: boolean;
  deactivated: Deactivated;
  lastPostAt?: string;
  fixedPost?: number;
}

export interface ScheduleDto {
  cronExpression?: string;
  intervalHours?: number;
  intervalDays?: number;
  daysOfWeek?: number;
  timeOfDay?: 'MORNING' | 'AFTERNOON' | 'EVENING';
  timezone?: string;
}

export interface AutoPostRequest {
  schedule: ScheduleDto;
  groupId?: number;
  profileId?: number;
  isEnabled: boolean;
}

export interface AiGenerateRequest {
  prompt: string;
  promptImage?: string;
  maxLength: number;
  tone?: string;
  language?: string;
  includeHashtags: boolean;
}

export interface AiPostDto {
  post: string;
  imageUrl?: string;
}

export interface LogItem {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  createdAt: string;
  source?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export type StorageType = 'IMAGES' | 'VIDEOS';

export type StorageNodeType = 'FILE' | 'FOLDER';

export interface StorageNodeDto {
  type: StorageNodeType;
  path: string;
  name?: string;
  itemsCount?: number;
  size?: number;
  contentType?: string;
  lastModified?: string;
}

export interface ListNodesResponse {
  nodes: StorageNodeDto[];
  continuationToken?: string;
}

export interface CreateFolderRequest {
  path: string;
}

export interface CreateFolderResponse {
  path: string;
}

export interface UploadFolderMetaRequest {
  basePath: string;
}

export interface UploadResultDto {
  nodes?: StorageNodeDto[];
}