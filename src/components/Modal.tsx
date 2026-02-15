import { ReactNode } from 'react';
import { cn } from '../utils/format';
import { X, Sparkles } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="anime-card w-full max-w-2xl mx-4 rounded-[2rem] border-2 border-accent-pink/30 bg-white/90 backdrop-blur-xl shadow-anime-xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-2xl opacity-10">
          💖
        </div>

        <div className="flex items-center justify-between border-b-2 border-accent-pink/20 bg-gradient-to-r from-accent-pink/10 via-accent-purple/10 to-accent-blue/10 px-8 py-6 rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent-pink" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-pink via-accent-purple to-accent-blue bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent-pink/30 transition-all hover:border-accent-pink hover:bg-accent-pink/10 hover:text-accent-pink hover:rotate-90 hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-8 py-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t-2 border-accent-pink/20 bg-gradient-to-r from-accent-pink/10 via-accent-purple/10 to-accent-blue/10 px-8 py-5 rounded-b-[2rem]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
