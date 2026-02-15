import { Prompt } from '../types';
import { escapeHtml, cn } from '../utils/format';
import { Heart, Copy, Trash2 } from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  canDelete: boolean;
  onDelete: () => void;
  onImageClick: () => void;
}

export function PromptCard({ prompt, canDelete, onDelete, onImageClick }: PromptCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEmojiForModel = (model: string) => {
    const emojiMap: Record<string, string> = {
      'z-image': '🌟',
      'flux': '✨',
      'nano banana': '🍌',
      '豆包': '🤖',
    };
    return emojiMap[model] || '🎨';
  };

  const getEmojiForCategory = (category: string) => {
    const emojiMap: Record<string, string> = {
      '风景': '🏞️',
      '人物': '👤',
      '艺术': '🎨',
      '科幻': '🚀',
      '动漫': '🎌',
      '其他': '✨',
    };
    return emojiMap[category] || '💫';
  };

  return (
    <div className="anime-card bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-accent-pink/20 p-5 shadow-anime relative overflow-hidden group hover:border-accent-pink/40 hover:shadow-anime-lg transition-all duration-300">
      {/* Decorative elements */}
      <div className="absolute top-2 right-2 text-2xl opacity-20 group-hover:opacity-30 transition-opacity">
        💖
      </div>
      <div className="absolute bottom-2 left-2 text-lg opacity-10">
        ✿
      </div>

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2 relative z-10">
        <h3 className="flex-1 text-lg font-bold text-gray-800 leading-tight">
          {escapeHtml(prompt.title)}
        </h3>
        {canDelete && (
          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent-rose/30 transition-all hover:border-accent-rose hover:bg-accent-rose/10 hover:scale-110 hover:rotate-6"
            title="删除"
          >
            <Trash2 size={14} className="text-accent-rose" />
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1.5 relative z-10">
        <span className="rounded-full bg-gradient-to-r from-accent-pink/20 to-accent-purple/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-pink border border-accent-pink/30 flex items-center gap-1">
          <span>{getEmojiForModel(prompt.model)}</span>
          {escapeHtml(prompt.model)}
        </span>
        <span className="rounded-full bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-purple border border-accent-purple/30 flex items-center gap-1">
          <span>{getEmojiForCategory(prompt.category)}</span>
          {escapeHtml(prompt.category)}
        </span>
        {(prompt.tags || []).slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gradient-to-r from-accent-blue/20 to-accent-cyan/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-blue border border-accent-blue/30"
          >
            {escapeHtml(tag)}
          </span>
        ))}
      </div>

      {/* Image */}
      {prompt.imageUrl && (
        <div
          className="mb-3 aspect-video overflow-hidden rounded-2xl border-2 border-accent-pink/20 cursor-pointer relative group/img"
          onClick={onImageClick}
        >
          <img
            src={prompt.imageUrl}
            alt={escapeHtml(prompt.title)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-center pb-3">
            <span className="text-white text-sm font-semibold">🔍 查看大图</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mb-3 rounded-2xl border-2 border-accent-pink/10 bg-gradient-to-br from-white/60 to-accent-pink/5 p-3 relative overflow-hidden">
        <pre
          className={cn(
            'whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed',
            !isExpanded && 'max-h-24 overflow-hidden'
          )}
        >
          {escapeHtml(prompt.prompt)}
        </pre>
        {prompt.prompt.length > 150 && !isExpanded && (
          <div className="flex justify-center pb-1">
            <button
              onClick={() => setIsExpanded(true)}
              className="rounded-full border-2 border-accent-pink/30 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-pink transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:scale-105"
            >
              展开全部 ✨
            </button>
          </div>
        )}
        {isExpanded && (
          <div className="flex justify-center pb-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="rounded-full border-2 border-accent-pink/30 px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-pink transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:scale-105"
            >
              收起 ↑
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-accent-pink/20 pt-3 text-xs text-gray-500 relative z-10">
        <span className="flex items-center gap-1">
          <span>📅</span>
          {new Date(prompt.createdAt).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 font-bold uppercase tracking-wider transition-all hover:scale-105',
            copied
              ? 'bg-accent-teal text-white border-accent-teal'
              : 'border-accent-pink/30 text-accent-pink hover:bg-gradient-to-r hover:from-accent-pink hover:to-accent-purple hover:text-white hover:border-transparent'
          )}
        >
          {copied ? (
            <>
              <span>✓</span>
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
