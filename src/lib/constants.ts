import { AIModel } from '../types';

export const AI_MODELS: AIModel[] = ['z-image', 'flux', 'nano banana', '豆包'];

export const DEFAULT_CATEGORIES = [
  '风景',
  '人物',
  '艺术',
  '科幻',
  '动漫',
  '其他',
];

export const STORAGE_KEYS = {
  CONFIG: 'aiPromptsGallery_config',
  AUTH: 'aiPromptsGallery_auth',
} as const;

export const GITHUB_API_BASE = 'https://api.github.com';
