import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import moment from 'moment';

export default function WarningNotice() {
  const { user } = useAuth();
  const [warnings, setWarnings] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    base44.entities.Warning
      .filter({ user_id: user.id, acknowledged: false }, { sort: '-created_date' })
      .then((page) => {
        if (active) setWarnings(page.items ?? []);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const acknowledge = async () => {
    setBusy(true);
    try {
      await Promise.all(
        warnings.map((warning) =>
          base44.entities.Warning.update(warning.id, {
            acknowledged: true,
            acknowledged_date: new Date().toISOString(),
          })
        )
      );
      setWarnings([]);
    } finally {
      setBusy(false);
    }
  };

  if (!warnings.length) return null;

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-lg bg-card border-destructive/40">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <DialogTitle className="font-display text-xl">
            Platform rule warning
          </DialogTitle>
          <DialogDescription>
            A moderator flagged your account. Please read this and acknowledge it to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {warnings.map((warning) => (
            <div
              key={warning.id}
              className="rounded-xl border border-border/60 bg-secondary/60 px-4 py-3"
            >
              <p className="text-sm leading-relaxed break-words">{warning.reason}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {warning.issued_by_name ? `From ${warning.issued_by_name}` : 'From the Alpha Smart team'}
                {warning.created_date
                  ? ` · ${moment(warning.created_date).format('DD MMM YYYY')}`
                  : ''}
              </p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <button
            onClick={acknowledge}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            I understand
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}