import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    highlights: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
    member_notes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          name: { type: 'string' },
          note: { type: 'string' }
        },
        required: ['user_id', 'name', 'note']
      }
    }
  },
  required: ['summary', 'highlights', 'concerns', 'member_notes']
};

const asArray = (result) => (Array.isArray(result) ? result : result?.items ?? []);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const [users, videos, attempts, warnings] = await Promise.all([
      base44.asServiceRole.entities.User.list().then(asArray),
      base44.asServiceRole.entities.Video.list({ limit: 500 }).then(asArray),
      base44.asServiceRole.entities.QuizAttempt.list({ limit: 500 }).then(asArray),
      base44.asServiceRole.entities.Warning.list({ limit: 300 }).then(asArray)
    ]);

    const members = users.map((member) => {
      const lessons = videos.filter((v) => v.created_by_id === member.id).length;
      const own = attempts.filter((a) => a.student_id === member.id);
      const percent = own.length ? Math.round(own.reduce((sum, a) => sum + (a.percent || 0), 0) / own.length) : null;
      const points = own.reduce((sum, a) => sum + (a.points_earned || 0), 0);
      return {
        user_id: member.id,
        name: member.full_name || member.email || 'Member',
        account_type: member.role === 'admin' ? 'Admin' : member.account_type || 'Not set',
        lessons,
        quizzes: own.length,
        avg_percent: percent,
        points,
        warnings: warnings.filter((w) => w.user_id === member.id).length
      };
    });

    const active = members.filter((m) => m.lessons + m.quizzes + m.warnings > 0);
    const input = (active.length ? active : members).slice(0, 30);

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `You are the AI progress analyst for Alpha Smart, an online school with students and teachers.\n` +
        `Below is anonymised-to-you activity data per member: lessons uploaded, quizzes taken, average quiz score (%), points earned, warnings received.\n` +
        `Data: ${JSON.stringify(input)}\n\n` +
        `Write an honest, practical progress report for the owner:\n` +
        `- "summary": 2-3 sentences on how the community is progressing overall.\n` +
        `- "highlights": 2-3 short bullet strings naming members doing well and why.\n` +
        `- "concerns": 2-3 short bullet strings about members who are inactive, scoring low, or collecting warnings, with a suggested action for each.\n` +
        `- "member_notes": one short note (max 20 words) per member listed in the data, using their exact user_id and name.\n` +
        `Be specific with numbers, never invent data that is not in the list, write in English.`,
      response_json_schema: SCHEMA
    });

    const data = analysis || {};
    return Response.json({
      members,
      analysis: {
        summary: String(data.summary || ''),
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        concerns: Array.isArray(data.concerns) ? data.concerns : [],
        member_notes: Array.isArray(data.member_notes) ? data.member_notes : []
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}