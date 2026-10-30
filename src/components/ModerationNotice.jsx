import { ShieldAlert, X } from 'lucide-react';

export default function ModerationNotice({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-destructive/40 p-6 msg-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-destructive" />
        </div>

        <h3 className="font-display text-lg mt-4">Message removed</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {notice.reason || 'Your message was removed because it contained inappropriate language.'}
        </p>

        <div className="mt-4 rounded-xl bg-secondary/60 border border-border/50 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 mb-2">Alpha Guardian</p>
          <p className="text-sm leading-relaxed">{notice.coaching}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all"
        >
          I understand
        </button>
      </div>
    </div>
  );
}