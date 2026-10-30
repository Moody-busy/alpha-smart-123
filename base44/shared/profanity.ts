// Language guard for Alpha Smart chat: detects English and Arabic profanity.
// Shared by backend functions — never import this from the frontend.

const EN_WORDS = [
  'fuck', 'fucks', 'fucked', 'fucking', 'fucker', 'motherfucker', 'shit', 'shitty',
  'bullshit', 'bitch', 'bitches', 'bastard', 'asshole', 'assholes', 'dick', 'dickhead',
  'cunt', 'slut', 'whore', 'piss', 'prick', 'wanker', 'twat', 'retard', 'retarded',
  'nigger', 'nigga', 'faggot', 'jackass', 'dumbass', 'screw you', 'go to hell',
  'idiot', 'stupid', 'moron', 'shut up', 'kill yourself'
];

const AR_WORDS = [
  'كلب', 'كلبه', 'حمار', 'حماره', 'غبي', 'غبيه', 'اغبياء', 'خرا', 'خراء', 'زباله',
  'حقير', 'حقيره', 'وسخ', 'وسخه', 'تافه', 'لعنه', 'يلعن', 'قحبه', 'شرموط', 'شرموطه',
  'عرص', 'خول', 'منيوك', 'نيكني', 'نيك', 'طيز', 'زب', 'كس', 'سكس', 'ابن الكلب',
  'يا حيوان', 'حيوان', 'متخلف', 'متخلفه', 'اقتل نفسك', 'تفو'
];

const LISTS = [EN_WORDS, AR_WORDS].map((list) => list.map((word) => normalize(word)));

function normalize(value: string): string {
  return String(value)
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[@]/g, 'a')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[$5]/g, 's')
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matches(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const arabic = /[\u0600-\u06FF]/.test(word);
  const body = arabic ? `(?:ال)?${escaped}[هي]?` : escaped;
  return new RegExp(`(^|[^\\p{L}])${body}(?=$|[^\\p{L}])`, 'u').test(text);
}

export function containsProfanity(value: string): boolean {
  const text = normalize(value);
  if (!text) return false;
  return LISTS.some((list) => list.some((word) => word && matches(text, word)));
}