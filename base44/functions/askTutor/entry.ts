import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const asArray = (result) => (Array.isArray(result) ? result : result?.items ?? []);

async function buildAdminContext(base44) {
  try {
    const [users, videos, attempts, warnings] = await Promise.all([
      base44.asServiceRole.entities.User.list().then(asArray),
      base44.asServiceRole.entities.Video.list({ limit: 300 }).then(asArray),
      base44.asServiceRole.entities.QuizAttempt.list({ limit: 300 }).then(asArray),
      base44.asServiceRole.entities.Warning.list({ limit: 200 }).then(asArray)
    ]);
    const members = users.slice(0, 25).map((u) => ({
      name: u.full_name || u.email,
      type: u.role === 'admin' ? 'Admin' : u.account_type || 'Not set',
      lessons: videos.filter((v) => v.created_by_id === u.id).length,
      quizzes: attempts.filter((a) => a.student_id === u.id).length,
      warnings: warnings.filter((w) => w.user_id === u.id).length
    }));
    return (
      `PLATFORM DATA (live, admin only): total members ${users.length}, lessons ${videos.length}, ` +
      `quiz attempts ${attempts.length}, warnings ${warnings.length}.\n` +
      `Member activity: ${JSON.stringify(members)}`
    );
  } catch {
    return 'PLATFORM DATA: unavailable right now.';
  }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const history = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const messages = history
      .filter((m) => m && typeof m.content === 'string' && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' ? 'Alpha Tutor' : 'Member',
        content: m.content.slice(0, 1500)
      }));
    if (!messages.length) return Response.json({ error: 'messages are required' }, { status: 400 });

    const accountType = body.account_type === 'Teacher' ? 'Teacher' : 'Student';
    const subject = typeof body.subject === 'string' ? body.subject.slice(0, 80).trim() : '';
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
    const adminContext = user.role === 'admin' ? await buildAdminContext(base44) : '';

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `You are Alpha Tutor, the assistant inside Alpha Smart, an online school.\n` +
        `You are talking to ${user.full_name || 'a member'}, who is a ${accountType}${subject ? ` working on ${subject}` : ''}.\n\n` +
        `How to answer:\n` +
        `- Be encouraging, clear and concrete. Explain step by step and use a small example.\n` +
        `- Keep answers under 180 words unless the member asks for a full explanation.\n` +
        `- Never do their graded work for them: teach the method, then invite them to try.\n` +
        `- You can also answer questions about the website itself: lessons live in the dashboard, quizzes in the quiz arena, points and badges on the leaderboard, plans under Study Plans, and admins manage everything from the admin board.\n` +
        `${accountType === 'Teacher' ? '- They are a teacher: offer lesson ideas, class activities, how to explain a concept to students, and assessment tips.\n' : '- They are a student: help them understand, revise and practise, and suggest a quick way to remember the idea.\n'}` +
        `- If they use rude language, calmly ask them to keep it respectful and move on with the lesson.\n` +
        `- Reply in the same language the member is writing in (English, Arabic, German or French).\n` +
        `- Plain text only, no markdown headings.\n\n` +
        (adminContext
          ? `You also have access to the admin board data below. Use it only to answer the owner's questions about members, lessons, quizzes and warnings. Never invent numbers.\n${adminContext}\n\n`
          : '') +
        `Conversation so far:\n${transcript}\n\n` +
        `Write only Alpha Tutor's next reply.`
    });

    return Response.json({ reply: String(reply ?? '').trim() || 'Let me try that again — what topic are you working on?' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}