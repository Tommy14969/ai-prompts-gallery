import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prompt, AppConfig, AuthUser } from '../types';
import { STORAGE_KEYS } from '../lib/constants';
import { GitHubAPI } from '../lib/github';

interface AppStore {
  // Config
  config: AppConfig;
  setConfig: (config: AppConfig) => void;

  // Auth
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (token: string) => Promise<boolean>;
  logout: () => void;

  // Prompts
  prompts: Prompt[];
  setPrompts: (prompts: Prompt[]) => void;
  loadPrompts: () => Promise<void>;
  createPrompt: (prompt: Omit<Prompt, 'id' | 'number' | 'createdAt' | 'author'>, image?: File) => Promise<void>;
  deletePrompt: (issueNumber: number) => Promise<void>;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Config
      config: {
        username: '',
        repo: 'ai-prompts-gallery',
      },
      setConfig: (config) => set({ config }),

      // Auth
      user: null,
      setUser: (user) => set({ user }),
      login: async (token: string) => {
        const { config } = get();
        const api = new GitHubAPI(config, token);

        try {
          const userInfo = await api.getUserInfo();
          if (!userInfo) {
            return false;
          }

          const isCollaborator = await api.verifyUserCollaborator(userInfo.login);
          if (!isCollaborator) {
            throw new Error('不是仓库协作者');
          }

          set({ user: { login: userInfo.login, token } });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      logout: () => set({ user: null }),

      // Prompts
      prompts: [],
      setPrompts: (prompts) => set({ prompts }),
      loadPrompts: async () => {
        const { config, user } = get();
        const api = new GitHubAPI(config, user?.token);

        set({ isLoading: true });

        try {
          const prompts = await api.loadPrompts();
          set({ prompts, isConnected: true });
        } catch (error) {
          console.error('Load prompts error:', error);
          set({ isConnected: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      createPrompt: async (prompt, image) => {
        const { config, user } = get();
        if (!user) {
          throw new Error('请先登录');
        }

        const api = new GitHubAPI(config, user.token);
        let imageUrl = prompt.imageUrl || '';

        if (image) {
          imageUrl = await api.uploadImage(image);
        }

        await api.createPrompt({ ...prompt, imageUrl });
        await get().loadPrompts();
      },
      deletePrompt: async (issueNumber) => {
        const { config, user } = get();
        if (!user) {
          throw new Error('请先登录');
        }

        const api = new GitHubAPI(config, user.token);
        await api.closeIssue(issueNumber);
        await get().loadPrompts();
      },

      // UI State
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      isConnected: false,
      setIsConnected: (isConnected) => set({ isConnected }),
    }),
    {
      name: STORAGE_KEYS.CONFIG,
      partialize: (state) => ({
        config: state.config,
        user: state.user,
      }),
    }
  )
);
