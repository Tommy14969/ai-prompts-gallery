export interface Prompt {
  id: string;
  number: number;
  title: string;
  model: AIModel;
  category: string;
  prompt: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  author: string;
}

export type AIModel = 'z-image' | 'flux' | 'nano banana' | '豆包';

export interface AppConfig {
  username: string;
  repo: string;
}

export interface AuthUser {
  login: string;
  token: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  created_at: string;
  user: {
    login: string;
  };
  labels: Array<{
    name: string;
  }>;
}

export interface GitHubFileResponse {
  content: {
    download_url: string;
  };
}
