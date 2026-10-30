import { Trash2, Lightbulb, BookOpen } from 'lucide-react';

export default function PlanCard({ plan, onDelete }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border border-primary/50 text-primary bg-primary/10 mb-2">
            {plan.account_type} plan
          </span>
          <h3 className="font-display text-lg leading-tight">{plan.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{plan.summary}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(plan.id)}
            aria-label="Delete plan"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {(plan.milestones ?? []).map((m) => (
          <div key={m.week} className="rounded-xl bg-secondary/40 border border-border/40 p-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Week {m.week}</span>
              <span className="text-sm font-medium">{m.focus}</span>
            </div>
            <ul className="mt-2 space-y-1.5">
              {(m.tasks ?? []).map((task, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {(plan.resources ?? []).length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Resources
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.resources.map((r, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-secondary border border-border/40">{r}</span>
            ))}
          </div>
        </div>
      )}

      {plan.tip && (
        <p className="mt-4 flex gap-2 text-sm text-primary/90">
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
          {plan.tip}
        </p>
      )}
    </div>
  );
}