import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { containsProfanity } from '../../shared/profanity.ts';

const FALLBACK_COACHING =
  'Your message was removed because it contained rude or offensive language. Alpha Smart is a learning space — please keep it respectful. While you are here, try one small study goal for the next 20 minutes; that is how progress is built.';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const text = typeof body.text === 'string' ? body.text.slice(0, 2000).trim() : '';
    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    if (!containsProfanity(text)) {
      return Response.json({ allowed: true });
    }

    let coaching = FALLBACK_COACHING;
    try {
      const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt:
          `You are the Alpha Smart guardian, a warm but firm mentor inside an online school for students and teachers.\n` +
          `A member just tried to post this message in the community chat and it was blocked for offensive language. Do not repeat or quote the offensive words.\n` +
          `Message (may be in English or Arabic): "${text.slice(0, 300)}"\n\n` +
          `Write a short reply to the member, maximum 3 sentences, in the SAME language as their message.\n` +
          `1) Tell them the message was removed and that swearing is not allowed here.\n` +
          `2) Ask them to stop using that language, and say a warning has been added to their account.\n` +
          `3) End with one encouraging, practical study tip.\n` +
          `Speak directly to them as "you". No emojis, no lecture, no repeating the bad words.`
      });
      const cleaned = String(reply ?? '').trim();
      if (cleaned) coaching = cleaned;
    } catch {
      coaching = FALLBACK_COACHING;
    }

    await base44.asServiceRole.entities.Warning.create({
      user_id: user.id,
      user_name: user.full_name || user.email || 'Member',
      user_email: user.email || '',
      reason: 'Inappropriate language in Global Chat (auto-detected by AI moderation)',
      issued_by_name: 'Alpha AI Guardian',
      acknowledged: false
    });

    return Response.json({
      allowed: false,
      reason: 'Your message was removed because it contains inappropriate language.',
      coaching,
      warningIssued: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}