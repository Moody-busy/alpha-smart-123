import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    milestones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          week: { type: 'integer' },
          focus: { type: 'string' },
          tasks: { type: 'array', items: { type: 'string' } }
        },
        required: ['week', 'focus', 'tasks']
      }
    },
    resources: { type: 'array', items: { type: 'string' } },
    tip: { type: 'string' }
  },
  required: ['title', 'summary', 'milestones', 'resources', 'tip']
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goal = typeof body.goal === 'string' ? body.goal.slice(0, 300).trim() : '';
    if (!goal) return Response.json({ error: 'goal is required' }, { status: 400 });

    const accountType = body.account_type === 'Teacher' ? 'Teacher' : 'Student';
    const level = typeof body.level === 'string' ? body.level.slice(0, 60).trim() : 'Beginner';
    const hours = Math.min(40, Math.max(1, Number(body.hours_per_week) || 5));
    const weeks = Math.min(12, Math.max(2, Number(body.weeks) || 4));

    const personRules =
      accountType === 'Teacher'
        ? `They are a TEACHER. Build a teaching plan: weekly learning objectives for their class, the lesson sections they will teach, one class activity per week, one formative check (quiz, exit ticket, group task) and what to review the following week. Write tasks as things the teacher will prepare or run in class.`
        : `They are a STUDENT. Build a personal study plan: weekly topics to study, active-recall and practice tasks, short review sessions, and how to test themselves at the end of each week. Write tasks as things the student will do, with realistic time blocks that fit their weekly hours.`;

    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `You are the curriculum planner of Alpha Smart, an online school.\n` +
        `Create a realistic ${weeks}-week study plan.\n\n` +
        `Goal: ${goal}\nCurrent level: ${level}\nAvailable time: ${hours} hours per week\n\n` +
        personRules + `\n\n` +
        `Rules:\n` +
        `- Exactly ${weeks} milestones, week numbers 1 to ${weeks}.\n` +
        `- 2 to 4 tasks per week, each starting with a verb and doable inside their weekly hours.\n` +
        `- "title": a short plan name (max 8 words). "summary": 2 sentences on what they will achieve.\n` +
        `- "resources": 3 to 5 concrete free learning resources or activity types (no invented URLs).\n` +
        `- "tip": one motivating sentence about consistency.\n` +
        `- Write everything in the same language as the goal text (English, Arabic, German or French).`,
      response_json_schema: SCHEMA
    });

    const data = plan || {};
    return Response.json({
      plan: {
        title: String(data.title || `${accountType} plan: ${goal}`).slice(0, 120),
        summary: String(data.summary || '').slice(0, 600),
        milestones: Array.isArray(data.milestones) ? data.milestones.slice(0, 12) : [],
        resources: Array.isArray(data.resources) ? data.resources.slice(0, 6) : [],
        tip: String(data.tip || '').slice(0, 300)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}