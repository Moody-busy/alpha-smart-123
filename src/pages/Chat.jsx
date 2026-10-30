import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useUserBadges } from '@/hooks/useUserBadges';
import ModerationNotice from '@/components/ModerationNotice';
import { cn } from '@/lib/utils';

export default function Chat() {
  const { user } = useAuth();
  const { badges } = useUserBadges(user?.id);
  const hasPioneer = badges.some((b) => b.badge_name === 'Alpha Video Pioneer');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);
  const listRef = useRef(null);
  const typingTimer = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Message.filter({}, { sort: 'created_date', limit: 100 });
      setMessages(res.items ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.type === 'create') {
        setMessages((prev) => [...prev, event.data]);
      }
    });
    return unsub;
  }, [load]);

  // auto-scroll to bottom
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleTyping = (val) => {
    setText(val);
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 1200);
  };

  const send = async (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      const check = await base44.functions.invoke('moderateMessage', { text: value });
      if (check.data?.allowed === false) {
        setNotice({ reason: check.data.reason, coaching: check.data.coaching });
        setText('');
        setTyping(false);
        return;
      }
      await base44.entities.Message.create({
        text: value,
        user_name: user?.full_name ?? 'Anonymous',
        user_role: user?.role === 'admin' ? 'Teacher' : 'Student',
        has_pioneer_badge: hasPioneer,
      });
      setText('');
      setTyping(false);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-5 md:px-10 py-8 max-w-5xl mx-auto h-[calc(100vh-3.5rem)] md:h-screen flex flex-col">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">Community</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold flex items-center gap-3">
          Global Chat
          <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground px-2.5 py-1 rounded-full bg-secondary border border-border/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </h2>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto rounded-2xl bg-card border border-border/40 p-4 md:p-6 space-y-4 scroll-smooth"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl gold-glow flex items-center justify-center bg-secondary mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">Be the first to say hello to the community.</p>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} mine={m.created_by_id === user?.id} />)
        )}
      </div>

      {/* typing indicator */}
      <div className="h-6 px-2 flex items-center">
        {typing && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  style={{ animation: `typing-dot 1.2s infinite ${i * 0.15}s` }}
                />
              ))}
            </span>
            typing...
          </div>
        )}
      </div>

      <form onSubmit={send} className="flex gap-3 pb-4">
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Share something with the community..."
          className="flex-1 px-5 py-3.5 rounded-xl bg-card border border-border/60 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:gold-glow transition-all"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:gold-glow transition-all disabled:opacity-40 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

      <ModerationNotice notice={notice} onClose={() => setNotice(null)} />
    </div>
  );
}

function ChatMessage({ message, mine }) {
  return (
    <div className={cn('flex gap-3 msg-in', mine && 'flex-row-reverse')}>
      <div className="w-8 h-8 rounded-full border border-primary/40 bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
        {message.user_name?.[0]?.toUpperCase() ?? 'U'}
      </div>
      <div className={cn('max-w-[75%]', mine && 'text-right')}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{message.user_name}</span>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide border',
              message.user_role === 'Teacher'
                ? 'border-primary/50 text-primary bg-primary/10'
                : 'border-border/50 text-muted-foreground bg-secondary'
            )}
          >
            {message.user_role}
          </span>
          {message.has_pioneer_badge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-primary/60 bg-primary/15 text-primary badge-glow">
              <Award className="w-3 h-3" />
              Pioneer
            </span>
          )}
        </div>
        <div
          className={cn(
            'inline-block px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            mine ? 'bg-primary/15 border border-primary/30 rounded-tr-sm' : 'bg-secondary border border-border/40 rounded-tl-sm'
          )}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}