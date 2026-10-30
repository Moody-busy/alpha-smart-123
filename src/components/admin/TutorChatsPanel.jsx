import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { MessagesSquare, Loader2, RefreshCw } from 'lucide-react';

export default function TutorChatsPanel() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.TutorChat.filter({}, { sort: '-created_date', limit: 100 });
      setChats(res.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const search = query.trim().toLowerCase();
  const visible = search
    ? chats.filter((c) =>
        [c.user_name, c.user_email, c.question, c.answer].some((v) => (v ?? '').toLowerCase().includes(search))
      )
    : chats;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl flex items-center gap-2">
            <MessagesSquare className="w-5 h-5 text-primary" /> Alpha Tutor Conversations
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Every question and answer from your members.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search member or question..."
            className="input-base w-56 text-sm"
          />
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 text-sm hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {loading && chats.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border/50 p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading conversations...
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">
          {chats.length === 0 ? 'No questions asked yet.' : 'No conversation matches that search.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((chat) => (
            <div key={chat.id} className="rounded-2xl bg-card border border-border/50 p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{chat.user_name ?? 'Member'}</span>
                {chat.user_email && <span className="truncate">· {chat.user_email}</span>}
                {chat.account_type && (
                  <span className="px-1.5 py-0.5 rounded border border-border/50 uppercase tracking-wide text-[10px]">
                    {chat.account_type}
                  </span>
                )}
                <span className="ml-auto">
                  {chat.created_date ? new Date(chat.created_date).toLocaleString() : ''}
                </span>
              </div>
              <p className="mt-3 text-sm">
                <span className="text-primary/80 text-[10px] uppercase tracking-[0.2em] block mb-1">Question</span>
                {chat.question}
              </p>
              <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                <span className="text-[10px] uppercase tracking-[0.2em] block mb-1">Alpha Tutor</span>
                {chat.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}