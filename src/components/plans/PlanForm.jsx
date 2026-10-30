import { useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function PlanForm({ accountType, onGenerate, generating }) {
  const isTeacher = accountType === 'Teacher';
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [hours, setHours] = useState(5);
  const [weeks, setWeeks] = useState(4);

  const submit = (e) => {
    e.preventDefault();
    if (!goal.trim() || generating) return;
    onGenerate({ goal: goal.trim(), level, hours_per_week: Number(hours), weeks: Number(weeks) });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl bg-card border border-border/50 p-6 space-y-4">
      <div>
        <h3 className="font-display text-lg">{isTeacher ? 'Plan a teaching sequence' : 'Build a personal study plan'}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isTeacher
            ? 'Describe what your class must master — you get weekly objectives, activities and checks.'
            : 'Describe what you want to learn — you get a week-by-week plan you can follow.'}
        </p>
      </div>

      <label className="block">
        <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          {isTeacher ? 'What should your class learn?' : 'What do you want to learn?'}
        </span>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder={isTeacher ? 'e.g. Grade 9 students need to master linear equations in 4 weeks' : 'e.g. I want to prepare for my biology exam on cells'}
          className="input-base resize-none"
        />
      </label>

      <div className="grid sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-base">
            {LEVELS.map((l) => (
              <option key={l} value={l} className="bg-card text-foreground">{l}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            {isTeacher ? 'Hours / week' : 'Study hours / week'}
          </span>
          <input
            type="number"
            min={1}
            max={40}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="input-base"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Weeks</span>
          <input
            type="number"
            min={2}
            max={12}
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            className="input-base"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={generating || !goal.trim()}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        {generating ? 'Building your plan...' : 'Generate plan with AI'}
      </button>
    </form>
  );
}