import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import PlanForm from '@/components/plans/PlanForm';
import PlanCard from '@/components/plans/PlanCard';
import { CalendarRange, Loader2 } from 'lucide-react';

export default function StudyPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const accountType = user?.account_type === 'Teacher' ? 'Teacher' : 'Student';

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.StudyPlan.filter({ user_id: user?.id }, { sort: '-created_date', limit: 20 });
      setPlans(res.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id, load]);

  const generate = async (values) => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateStudyPlan', { ...values, account_type: accountType });
      const plan = res.data?.plan;
      if (!plan) throw new Error('No plan returned');
      await base44.entities.StudyPlan.create({
        title: plan.title,
        summary: plan.summary,
        milestones: plan.milestones,
        resources: plan.resources,
        tip: plan.tip,
        goal: values.goal,
        level: values.level,
        hours_per_week: values.hours_per_week,
        account_type: accountType,
        user_id: user.id,
        user_name: user.full_name ?? 'Member',
      });
      toast({ title: 'Plan ready', description: 'Your AI plan is saved below.' });
      await load();
    } catch {
      toast({ title: 'Could not build the plan', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.StudyPlan.delete(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="px-5 md:px-10 py-8 max-w-4xl mx-auto">
      <div className="mb-7">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">
          <CalendarRange className="w-3.5 h-3.5" /> AI Planning
        </p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold">
          {accountType === 'Teacher' ? 'Teaching Plans' : 'Study Plans'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {accountType === 'Teacher'
            ? 'Weekly objectives, class activities and checks for what you teach.'
            : 'A week-by-week route through what you are learning.'}
        </p>
      </div>

      <PlanForm accountType={accountType} onGenerate={generate} generating={generating} />

      <div className="mt-8 space-y-4">
        <h3 className="font-display text-lg">Your saved plans</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading plans...
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No plans yet — describe a goal above and Alpha Smart will build one.
          </p>
        ) : (
          plans.map((plan) => <PlanCard key={plan.id} plan={plan} onDelete={remove} />)
        )}
      </div>
    </div>
  );
}