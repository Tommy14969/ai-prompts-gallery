import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Prompt } from './types';
import { AI_MODELS, DEFAULT_CATEGORIES } from './lib/constants';
import { GitHubAPI } from './lib/github';
import { Modal } from './components/Modal';
import { PromptCard } from './components/PromptCard';
import { Toast } from './components/Toast';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { cn } from './utils/format';
import { Settings, LogOut, Plus, Search, Github, Heart, Sparkles } from 'lucide-react';

function AppContent() {
  const {
    config,
    user,
    prompts,
    isLoading,
    isConnected,
    setConfig,
    setUser,
    login,
    logout,
    loadPrompts,
    createPrompt,
    deletePrompt,
  } = useStore();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Form state
  const [settingsForm, setSettingsForm] = useState({ username: config.username, repo: config.repo });
  const [loginToken, setLoginToken] = useState('');
  const [promptForm, setPromptForm] = useState({
    title: '',
    model: '',
    category: '',
    tags: '',
    content: '',
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Initialize
  useEffect(() => {
    if (config.username && config.repo) {
      loadPrompts().catch(() => {});
    }
  }, [config, loadPrompts]);

  // Filter prompts
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModel = !modelFilter || prompt.model === modelFilter;
    const matchesCategory = !categoryFilter || prompt.category === categoryFilter;

    return matchesSearch && matchesModel && matchesCategory;
  });

  const categories = [...new Set(prompts.map((p) => p.category))].sort();

  // Handlers
  const handleSaveSettings = async () => {
    if (!settingsForm.username || !settingsForm.repo) {
      showToast('请填写所有字段 ✿', 'error');
      return;
    }

    const api = new GitHubAPI(settingsForm);
    const isValid = await api.verifyRepository();

    if (!isValid) {
      showToast('仓库验证失败', 'error');
      return;
    }

    setConfig(settingsForm);
    setIsSettingsOpen(false);
    showToast('设置已保存 ✿');
    loadPrompts();
  };

  const handleLogin = async () => {
    try {
      const success = await login(loginToken);
      if (success) {
        setIsLoginOpen(false);
        setLoginToken('');
        showToast('登录成功！✿');
        loadPrompts();
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '登录失败', 'error');
    }
  };

  const handleSavePrompt = async () => {
    if (!user) {
      showToast('请先登录 ✿', 'error');
      return;
    }

    const { title, model, category, tags, content } = promptForm;

    if (!title || !model || !category || !content) {
      showToast('请填写所有必填字段', 'error');
      return;
    }

    try {
      await createPrompt(
        {
          title,
          model: model as Prompt['model'],
          category,
          prompt: content,
          imageUrl: '',
          tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        },
        selectedImageFile || undefined
      );

      setIsPromptOpen(false);
      resetPromptForm();
      showToast('提示词已创建 ✿');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '保存失败', 'error');
    }
  };

  const handleDeletePrompt = async (issueNumber: number) => {
    if (!confirm('确定要删除这个提示词吗？(╯︵╰)')) {
      return;
    }

    try {
      await deletePrompt(issueNumber);
      showToast('提示词已删除 ✿');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '删除失败', 'error');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPromptForm = () => {
    setPromptForm({ title: '', model: '', category: '', tags: '', content: '' });
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const openPromptModal = () => {
    resetPromptForm();
    setIsPromptOpen(true);
  };

  // Stats
  const stats = {
    total: prompts.length,
    models: AI_MODELS.length,
    categories: categories.length,
  };

  return (
    <div className="min-h-screen bg-anime-gradient relative overflow-hidden">
      {/* Floating particles */}
      <div className="floating-particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <Toast />

      {/* Header */}
      <header className="relative z-10 border-b border-anime-pink/20 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-extrabold flex items-center gap-3">
              <span className="animate-heart-beat inline-block">💖</span>
              <span className="bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue bg-clip-text text-transparent">
                AI
              </span>
              <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
                图片
              </span>
              <span className="bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue bg-clip-text text-transparent">
                提示词库
              </span>
              <Sparkles className="w-6 h-6 text-accent-purple animate-sparkle" />
            </h1>

            <div className="flex items-center gap-4">
              {/* Connection status */}
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold',
                  isConnected
                    ? 'bg-accent-teal/10 text-accent-teal border-2 border-accent-teal/30'
                    : 'bg-accent-rose/10 text-accent-rose border-2 border-accent-rose/30'
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={cn(
                      'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                      isConnected ? 'bg-accent-teal' : 'bg-accent-rose'
                    )}
                  />
                  <span
                    className={cn(
                      'relative inline-flex h-2 w-2 rounded-full',
                      isConnected ? 'bg-accent-teal' : 'bg-accent-rose'
                    )}
                  />
                </span>
                <span>{isConnected ? '已连接' : config.username ? '连接失败' : '未配置'}</span>
              </div>

              {/* User info */}
              {user && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-anime-pink/10 px-4 py-2 rounded-full border-2 border-accent-pink/30">
                    <span className="animate-float inline-block">🎀</span>
                    <span className="font-semibold">{user.login}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-full border-2 border-accent-pink/30 px-4 py-2 text-sm font-semibold transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:text-accent-pink hover:scale-105"
                  >
                    <LogOut size={16} />
                    退出
                  </button>
                  <button
                    onClick={openPromptModal}
                    className="anime-button flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-glow-pink hover:scale-105"
                  >
                    <Plus size={16} className="animate-bounce" />
                    新建提示词
                    <Heart size={14} className="animate-heart-beat" />
                  </button>
                </>
              )}

              {!user && (
                <>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 rounded-full border-2 border-accent-purple/30 px-4 py-2 text-sm font-semibold transition-all hover:border-accent-purple hover:bg-accent-purple/10 hover:scale-105"
                  >
                    <Settings size={16} />
                    设置
                  </button>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="flex items-center gap-2 rounded-full border-2 border-accent-pink/30 px-4 py-2 text-sm font-semibold transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:scale-105"
                  >
                    <Github size={16} />
                    管理员登录
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-8 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-6">
          {[
            { value: stats.total, label: '总提示词', emoji: '📝', color: 'from-accent-pink to-accent-purple' },
            { value: stats.models, label: 'AI模型', emoji: '🤖', color: 'from-accent-purple to-accent-blue' },
            { value: stats.categories, label: '分类数', emoji: '🎨', color: 'from-accent-blue to-accent-cyan' },
          ].map((stat, index) => (
            <div
              key={index}
              className="anime-card bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-accent-pink/20 p-6 shadow-anime relative overflow-hidden group hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute top-2 right-2 text-3xl opacity-20 group-hover:opacity-40 transition-opacity">
                {stat.emoji}
              </div>
              <div className="flex flex-col">
                <span className={cn('text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent', stat.color)}>
                  {stat.value}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-accent-purple" />
            <input
              type="text"
              placeholder="搜索提示词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="anime-card h-12 w-full rounded-full border-2 border-accent-pink/30 pl-12 pr-4 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">模型</span>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="anime-card h-12 min-w-[160px] rounded-full border-2 border-accent-purple/30 px-4 transition-all focus:border-accent-purple focus:outline-none focus:ring-4 focus:ring-accent-purple/10 bg-white/80 backdrop-blur-xl"
            >
              <option value="">全部</option>
              {AI_MODELS.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">分类</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="anime-card h-12 min-w-[160px] rounded-full border-2 border-accent-blue/30 px-4 transition-all focus:border-accent-blue focus:outline-none focus:ring-4 focus:ring-accent-blue/10 bg-white/80 backdrop-blur-xl"
            >
              <option value="">全部</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompts grid */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-accent-pink/20 border-t-accent-pink" />
            <p className="text-gray-500 font-semibold">加载中... ✿</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="py-16 text-center bg-white/40 backdrop-blur-xl rounded-3xl border-2 border-accent-pink/20">
            <div className="text-7xl mb-4 animate-float">
              {config.username && config.repo ? '📝' : '⚙️'}
            </div>
            <h3 className="mb-2 text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
              {config.username && config.repo ? '暂无提示词' : '欢迎使用AI图片提示词库'}
            </h3>
            <p className="text-gray-600">
              {config.username && config.repo
                ? user
                  ? '点击右上角"新建提示词"开始创建您的第一个提示词 ✿'
                  : '点击右上角"管理员登录"后即可上传内容'
                : '请先点击右上角"设置"按钮配置仓库信息'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPrompts.map((prompt, index) => (
              <div
                key={prompt.id}
                className="animate-cardFadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PromptCard
                  prompt={prompt}
                  canDelete={!!user}
                  onDelete={() => handleDeletePrompt(prompt.number)}
                  onImageClick={() => {
                    setSelectedImage(prompt.imageUrl || '');
                    setIsImageViewerOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="仓库设置"
        footer={
          <>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-full border-2 border-accent-pink/30 px-6 py-2.5 font-semibold transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:scale-105"
            >
              取消
            </button>
            <button
              onClick={handleSaveSettings}
              className="anime-button rounded-full bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-glow-pink hover:scale-105"
            >
              保存设置 ✿
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              GitHub 用户名
            </label>
            <input
              type="text"
              value={settingsForm.username}
              onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
              placeholder="仓库所有者用户名"
              className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              仓库名称
            </label>
            <input
              type="text"
              value={settingsForm.repo}
              onChange={(e) => setSettingsForm({ ...settingsForm, repo: e.target.value })}
              placeholder="例如: ai-prompts-gallery"
              className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
            />
          </div>

          <p className="text-sm text-gray-500 bg-accent-pink/5 p-4 rounded-2xl border border-accent-pink/20">
            💡 注意：这些设置用于指定要读取的仓库。上传权限需要通过管理员登录验证。
          </p>
        </div>
      </Modal>

      {/* Login Modal */}
      <Modal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        title="管理员登录"
        footer={
          <>
            <button
              onClick={() => setIsLoginOpen(false)}
              className="rounded-full border-2 border-accent-pink/30 px-6 py-2.5 font-semibold transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:scale-105"
            >
              取消
            </button>
            <button
              onClick={handleLogin}
              className="anime-button rounded-full bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-glow-pink hover:scale-105"
            >
              登录并验证权限 ✿
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={loginToken}
              onChange={(e) => setLoginToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
            />
            <p className="mt-2 text-sm text-gray-500 bg-accent-purple/5 p-4 rounded-2xl border border-accent-purple/20">
              🔐 需要 repo 权限。只有仓库所有者和协作者才能上传内容。
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-purple hover:underline font-semibold"
              >
                创建 Token →
              </a>
            </p>
          </div>
        </div>
      </Modal>

      {/* Prompt Modal */}
      <Modal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        title="新建提示词"
        footer={
          <>
            <button
              onClick={() => setIsPromptOpen(false)}
              className="rounded-full border-2 border-accent-pink/30 px-6 py-2.5 font-semibold transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:scale-105"
            >
              取消
            </button>
            <button
              onClick={handleSavePrompt}
              className="anime-button rounded-full bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-glow-pink hover:scale-105"
            >
              保存 ✿
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              标题
            </label>
            <input
              type="text"
              value={promptForm.title}
              onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
              placeholder="输入提示词标题"
              className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                AI模型
              </label>
              <select
                value={promptForm.model}
                onChange={(e) => setPromptForm({ ...promptForm, model: e.target.value })}
                className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
              >
                <option value="">选择模型</option>
                {AI_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                分类
              </label>
              <select
                value={promptForm.category}
                onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value })}
                className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
              >
                <option value="">选择分类</option>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              预览图（可选）
            </label>
            <div className="relative">
              <div
                className={cn(
                  'anime-card rounded-2xl border-2 border-dashed border-accent-pink/30 p-8 text-center transition-all cursor-pointer hover:border-accent-pink bg-white/80 backdrop-blur-xl',
                  imagePreview && 'border-solid p-0'
                )}
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="预览" className="max-h-[300px] w-full object-contain rounded-2xl" />
                ) : (
                  <div>
                    <div className="text-5xl mb-3 animate-float">🖼️</div>
                    <p className="text-sm text-gray-500">点击上传图片或拖拽图片到此处 ✿</p>
                  </div>
                )}
              </div>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              标签（逗号分隔）
            </label>
            <input
              type="text"
              value={promptForm.tags}
              onChange={(e) => setPromptForm({ ...promptForm, tags: e.target.value })}
              placeholder="例如: 赛博朋克,夜景,城市"
              className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              提示词内容
            </label>
            <textarea
              value={promptForm.content}
              onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
              placeholder="输入完整的AI图片生成提示词..."
              rows={6}
              className="anime-card w-full rounded-2xl border-2 border-accent-pink/30 px-4 py-3 font-mono transition-all focus:border-accent-pink focus:outline-none focus:ring-4 focus:ring-accent-pink/10 bg-white/80 backdrop-blur-xl"
            />
          </div>
        </div>
      </Modal>

      {/* Image Viewer Modal */}
      {isImageViewerOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsImageViewerOpen(false)}
        >
          <button
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-2xl transition-all hover:bg-accent-pink hover:text-white hover:rotate-90 hover:scale-110 shadow-lg"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="图片预览"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl shadow-2xl border-4 border-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
