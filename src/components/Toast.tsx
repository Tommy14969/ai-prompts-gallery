import { useToast } from '../contexts/ToastContext';
import { cn } from '../utils/format';
import { CheckCircle, XCircle, Sparkles } from 'lucide-react';

export function Toast() {
  const { toast } = useToast();

  if (!toast) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slideIn">
      <div
        className={cn(
          'flex items-center gap-3 rounded-3xl border-2 px-6 py-4 shadow-anime-lg backdrop-blur-xl relative overflow-hidden',
          toast.type === 'success'
            ? 'border-accent-teal/30 bg-gradient-to-r from-accent-teal/20 to-accent-cyan/20 text-accent-teal'
            : 'border-accent-rose/30 bg-gradient-to-r from-accent-rose/20 to-accent-pink/20 text-accent-rose'
        )}
      >
        {/* Decorative sparkle */}
        <div className="absolute -right-2 -top-2 text-4xl opacity-20 animate-sparkle">
          ✨
        </div>

        {toast.type === 'success' ? (
          <CheckCircle className="w-6 h-6 flex-shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 flex-shrink-0" />
        )}

        <span className="font-semibold text-base">
          {toast.message}
        </span>

        {toast.type === 'success' && (
          <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
        )}
      </div>
    </div>
  );
}
