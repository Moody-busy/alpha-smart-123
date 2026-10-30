import { useState } from 'react';
import { X, Plus, Trash2, Loader2, ListChecks } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { QUIZ_CATEGORIES } from '@/lib/quiz';

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correct: 0 });

const buildQuestion = (draft) => {
  const filled = draft.options
    .map((text, optionIndex) => ({ text: text.trim(), optionIndex }))
    .filter((option) => option.text);
  const correctIndex = filled.findIndex((option) => option.optionIndex === draft.correct);
  return {
    question: draft.question.trim(),
    options: filled.map((option) => option.text),
    correct_index: correctIndex === -1 ? 0 : correctIndex,
  };
};

export default function QuizBuilder({ open, onClose, onSaved }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(QUIZ_CATEGORIES[0]);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const updateQuestion = (index, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      )
    );
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const save = async (e) => {
    e.preventDefault();
    const built = questions
      .map(buildQuestion)
      .filter((q) => q.question && q.options.length >= 2);

    if (!title.trim()) {
      toast({ title: 'Give the quiz a title', variant: 'destructive' });
      return;
    }
    if (!built.length) {
      toast({ title: 'Add at least one question with two answers', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const created = await base44.entities.Quiz.create({
        title: title.trim(),
        description: description.trim(),
        category,
        teacher_name: user?.full_name ?? 'Teacher',
        questions: built,
      });
      toast({ title: 'Quiz published', description: `${built.length} questions are now live for students.` });
      setTitle('');
      setDescription('');
      setCategory(QUIZ_CATEGORIES[0]);
      setQuestions([emptyQuestion()]);
      onSaved?.(created);
    } catch (err) {
      toast({
        title: 'Could not save quiz',
        description: err?.message ?? 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-background/80 backdrop-blur-md">
      <form
        onSubmit={save}
        className="w-full max-w-2xl my-6 rounded-3xl bg-card border border-border/60 shadow-2xl"
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold">Create a quiz</h3>
            <p className="text-xs text-muted-foreground">Students earn points and badges for finishing it.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title (e.g. Algebra Basics Check)"
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-sm focus:outline-none focus:border-primary/60 transition-colors"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Short description for students (optional)"
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-sm resize-none focus:outline-none focus:border-primary/60 transition-colors"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base"
          >
            {QUIZ_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="rounded-2xl border border-border/50 bg-secondary/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Question {qIndex + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    disabled={questions.length === 1}
                    aria-label="Remove question"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  placeholder="What do you want to ask?"
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm mb-3 focus:outline-none focus:border-primary/60 transition-colors"
                />
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correct === oIndex}
                        onChange={() => updateQuestion(qIndex, { correct: oIndex })}
                        className="accent-primary"
                        aria-label={`Mark answer ${oIndex + 1} correct`}
                      />
                      <input
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Answer ${oIndex + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-card border border-border/60 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Select the circle next to the correct answer.
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add question
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish quiz
          </button>
        </div>
      </form>
    </div>
  );
}