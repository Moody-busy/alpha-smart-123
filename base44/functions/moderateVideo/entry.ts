import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SCHEMA = {
  type: 'object',
  properties: {
    is_educational: { type: 'boolean' },
    reason: { type: 'string' }
  },
  required: ['is_educational', 'reason']
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.slice(0, 200).trim() : '';
    const description = typeof body.description === 'string' ? body.description.slice(0, 1500).trim() : '';
    const category = typeof body.category === 'string' ? body.category.slice(0, 80).trim() : '';
    if (!title) return Response.json({ error: 'title is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `You are the content gatekeeper for Alpha Smart, an educational hub where students and teachers publish video lessons.\n` +
        `Decide whether this upload is a genuine learning lesson.\n\n` +
        `ALLOW: academic subjects, tutorials, exam preparation, study techniques, language learning, coding, religious studies, art or music technique, teacher explanations, school projects explained.\n` +
        `BLOCK: entertainment, gaming clips, vlogs, memes, pranks, music videos, adverts or promotion, personal recordings, sports highlights, anything whose purpose is not teaching someone something.\n\n` +
        `Title: ${title}\nCategory: ${category || 'not given'}\nDescription: ${description || 'not given'}\n\n` +
        `If the intent is mixed, allow only when teaching is clearly the main purpose.\n` +
        `Write "reason" as one friendly sentence, max 20 words, addressed to the uploader, explaining the decision.`,
      response_json_schema: SCHEMA
    });

    const data = result || {};
    const allowed = data.is_educational !== false;
    return Response.json({
      allowed,
      reason: String(data.reason || (allowed ? 'Approved as an educational lesson.' : 'This upload does not look like a learning lesson.')).slice(0, 300)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}