import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Loader2, GraduationCap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';

const STUDENT_PROMPTS = ['Explain photosynthesis simply', 'Help me revise fractions', 'How do I remember the periodic table?'];
const TEACHER_PROMPTS = ['Ideas for a 45-minute lesson on fractions', 'How do I explain gravity to beginners?', 'Make a quick exit-ticket quiz'];

export default function Tutor() {
  const { user } = useAuth();
  const isTeacher = user?.account_type === 'Teacher';
  const prompts = isTeacher ? TEACHER_PROMPTS : STUDENT_PROMPTS;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = async (value) => {
    const content = (value ?? text).trim();
    if (!content || thinking) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setText('');
    setThinking(true);
    setError('');
    try {
      const res = await base44.functions.invoke('askTutor', {
        messages: next,
        account_type: isTeacher ? 'Teacher' : 'Student',
      });
      const reply = res.data?.reply;
      if (!reply) throw new Error('No reply');
      setMessages([...next, { role: 'assistant', content: reply }]);
      // Log the exchange so the admin board can review every member conversation
      base44.entities.TutorChat.create({
        user_id: user?.id,
        user_name: user?.full_name ?? 'Member',
        user_email: user?.email ?? '',
        account_type: isTeacher ? 'Teacher' : 'Student',
        question: content,
        answer: reply,
      }).catch(() => {});
    } catch {
      setError('Alpha Tutor could not answer just now. Please try again.');
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="px-5 md:px-10 py-8 max-w-4xl mx-auto h-[calc(100vh-3.5rem)] md:h-screen flex flex-col">
      <div className="mb-5">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> AI Tutor
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold">Alpha Tutor</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isTeacher
            ? 'Plan lessons, find better explanations and build class activities.'
            : 'Ask anything you are studying — get a clear explanation and a way to practise.'}
        </p>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto rounded-2xl bg-card border border-border/40 p-4 md:p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-14 h-14 rounded-2xl gold-glow flex items-center justify-center bg-secondary mb-4">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Start with a question, or pick one below.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="px-3.5 py-2 rounded-xl text-xs border border-border/60 bg-secondary/50 hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
              <div className="w-8 h-8 rounded-full border border-primary/40 bg-secondary flex items-center justify-center text-xs shrink-0">
                {m.role === 'user' ? user?.full_name?.[0]?.toUpperCase() ?? 'U' : <Sparkles className="w-4 h-4 text-primary" />}
              </div>
              <div
                className={cn(
                  'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-primary/15 border border-primary/30 rounded-tr-sm'
                    : 'bg-secondary border border-border/40 rounded-tl-sm'
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {thinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Alpha Tutor is thinking...
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive px-2 pt-2">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-3 pb-4 pt-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask Alpha Tutor anything about your studies..."
          className="flex-1 px-5 py-3.5 rounded-xl bg-card border border-border/60 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all"
        />
        <button
          type="submit"
          disabled={thinking || !text.trim()}
          className="px-5 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:gold-glow transition-all disabled:opacity-40 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}