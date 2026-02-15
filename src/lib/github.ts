import { GitHubIssue, GitHubFileResponse, Prompt, AppConfig } from '../types';
import { GITHUB_API_BASE } from './constants';

export class GitHubAPI {
  private config: AppConfig;
  private token?: string;

  constructor(config: AppConfig, token?: string) {
    this.config = config;
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  async verifyRepository(): Promise<boolean> {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${this.config.username}/${this.config.repo}`,
        { headers: this.getHeaders() }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async verifyUserCollaborator(username: string): Promise<boolean> {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${this.config.username}/${this.config.repo}/collaborators/${username}`,
        { headers: this.getHeaders() }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getUserInfo(): Promise<{ login: string } | null> {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      const response = await fetch(`${GITHUB_API_BASE}/user`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      return await response.json();
    } catch {
      return null;
    }
  }

  async loadPrompts(): Promise<Prompt[]> {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${this.config.username}/${this.config.repo}/issues?labels=prompt&state=open&per_page=100`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error('Failed to load issues');
      }

      const issues: GitHubIssue[] = await response.json();
      return issues
        .map((issue) => this.parseIssue(issue))
        .filter((p): p is Prompt => p !== null);
    } catch (error) {
      console.error('Load error:', error);
      throw error;
    }
  }

  private parseIssue(issue: GitHubIssue): Prompt | null {
    try {
      const body = issue.body || '';
      const metadata: Record<string, string> = {};

      // Parse YAML frontmatter
      const yamlMatch = body.match(/^---\n([\s\S]*?)\n---/);
      if (yamlMatch) {
        const yaml = yamlMatch[1];
        yaml.split('\n').forEach((line) => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            metadata[match[1]] = match[2].trim();
          }
        });
      }

      // Extract prompt content
      const promptMatch = body.match(/##\s*完整提示词\s*\n([\s\S]*?)(?=##|$)/);
      const content = promptMatch ? promptMatch[1].trim() : '';

      // Extract tags
      const tags = metadata.tags
        ? metadata.tags.split(',').map((t) => t.trim())
        : [];

      return {
        id: issue.id.toString(),
        number: issue.number,
        title: issue.title.replace(/^🖼️\s*/, '').split('|')[0].trim(),
        model: (metadata.model || 'z-image') as Prompt['model'],
        category: metadata.category || '其他',
        prompt: content,
        imageUrl: metadata.image_url || '',
        tags,
        createdAt: metadata.created_at || issue.created_at,
        author: metadata.author || this.config.username,
      };
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }

  async createPrompt(prompt: Omit<Prompt, 'id' | 'number' | 'createdAt' | 'author'>): Promise<void> {
    if (!this.token) {
      throw new Error('No token provided');
    }

    const labels = ['prompt', `model:${prompt.model}`, `category:${prompt.category}`];

    const body = `---
model: ${prompt.model}
category: ${prompt.category}
image_url: ${prompt.imageUrl || ''}
tags: ${(prompt.tags || []).join(',')}
created_at: ${new Date().toISOString().split('T')[0]}
author: ${this.config.username}
---

## 完整提示词

\`\`\`
${prompt.prompt}
\`\`\`
`;

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${this.config.username}/${this.config.repo}/issues`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          title: `🖼️ ${prompt.title} | ${prompt.model}`,
          body: body,
          labels: labels,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  }

  async uploadImage(file: File): Promise<string> {
    if (!this.token) {
      throw new Error('No token provided');
    }

    const filename = `${Date.now()}_${file.name}`;
    const path = `assets/images/${filename}`;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(',')[1];
          const response = await fetch(
            `${GITHUB_API_BASE}/repos/${this.config.username}/${this.config.repo}/contents/${path}`,
            {
              method: 'PUT',
              headers: this.getHeaders(),
              body: JSON.stringify({
                message: `Upload image ${filename}`,
                content: base64,
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const result: GitHubFileResponse = await response.json();
          resolve(result.content.download_url);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async closeIssue(issueNumber: number): Promise<void> {
    if (!this.token) {
      throw new Error('No token provided');
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${this.config.username}/${this.config.repo}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          state: 'closed',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to close issue');
    }
  }
}
