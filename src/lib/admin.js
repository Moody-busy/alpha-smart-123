export const OWNER_EMAILS = ['moodytamer871@gmail.com', 'alphastudios39@gmail.com'];

export function isOwner(user) {
  return OWNER_EMAILS.includes((user?.email ?? '').toLowerCase());
}