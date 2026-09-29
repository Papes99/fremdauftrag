/**
 * Wortfilter und Regelprüfung.
 * Ohne KI wird eine unauffällige Aufgabe nicht freigegeben, sondern bleibt pending.
 * Nur „schwer“ wird später zum Strike. Zu teuer, Auto, Diät, Werbung: nur Ablehnung.
 */

export type Severity = 'schwer' | 'leicht';

export type ReasonKey =
  | 'short'
  | 'long'
  | 'danger'
  | 'illegal'
  | 'drugs'
  | 'alcohol'
  | 'smoke'
  | 'gambling'
  | 'sexual'
  | 'hate'
  | 'stalk'
  | 'touch'
  | 'diet'
  | 'exercise'
  | 'pii'
  | 'contact'
  | 'ads'
  | 'car'
  | 'money'
  | 'politics';

export type RuleHit = { ok: false; key: ReasonKey; schwere: Severity };
export type RuleResult = { ok: true } | RuleHit;

const HITS: { key: ReasonKey; schwere: Severity; pattern: RegExp }[] = [
  { key: 'danger', schwere: 'schwer', pattern: /\b(suizid|selbstmord|umbring\w*|ritz\w*|selbstverletz\w*|bahngleis\w*|messer|waffe|stromschlag|fallschirm|tauchen|klettern|klettere)\b|\b(vom|aufs|auf das|auf dem|auf einem) dach\b/ },
  { key: 'illegal', schwere: 'schwer', pattern: /\b(klauen|klau\w*|stehlen|stehl\w*|einbruch)\b/ },
  { key: 'drugs', schwere: 'schwer', pattern: /\b(drogen|kiff\w*|kokain|heroin|xtc|joint|dealer)\b/ },
  { key: 'alcohol', schwere: 'schwer', pattern: /\b(alkohol|bier|wein|schnaps|vodka|champagner|betrunken|betrink\w*|saufen|besoffen)\b/ },
  { key: 'smoke', schwere: 'schwer', pattern: /\b(zigarette|zigaretten|kippe|vape|shisha|rauchen|rauche|raucht)\b/ },
  { key: 'gambling', schwere: 'schwer', pattern: /\b(casino|lotto|gluecksspiel|poker|wette|wetten)\b/ },
  { key: 'sexual', schwere: 'schwer', pattern: /\b(sex\w*|nackt\w*|porno\w*|busen|penis|vagina|flirt\w*|fick\w*|scheiss\w*)\b|bewerte\w*.{0,30}koerper/ },
  { key: 'hate', schwere: 'schwer', pattern: /\b(nazi|hurensohn|schlampe|schwuchtel|behindert\w*|hass|hasse|hassen|hasst|idiot\w*|arsch\w*)\b/ },
  { key: 'stalk', schwere: 'schwer', pattern: /heimlich\w*\s+\w*\s*(foto|film|fotograf\w*|filmen)|(\bfoto|\bfilm|\bfotograf\w*|\bfilmen).{0,24}heimlich|\b(verfolg\w*|stalke\w*|blossstell\w*)\b|\b(umkleide|dusche)\b/ },
  { key: 'touch', schwere: 'schwer', pattern: /\b(fass|anfassen|umarm\w*|kuss\w*|kuess\w*)\b.{0,40}\bfremd|\bfremd\w*.{0,40}\b(fass|anfassen|umarm\w*|kuss\w*|kuess\w*)\b/ },
  { key: 'politics', schwere: 'schwer', pattern: /\b(partei|wahlkampf|demonstration|demo)\b/ },
  { key: 'contact', schwere: 'schwer', pattern: /schreib mir|ruf mich|meld dich bei mir|triff mich|\bautor\b|meine nummer|folg mir|\b(instagram|tiktok|snapchat|whatsapp|telegram|facebook)\b/ },
  { key: 'pii', schwere: 'schwer', pattern: /\b(adresse|telefonnummer|handynummer|passwort|iban)\b|@[a-z0-9_]+|https?:\/\/|\bwww\.|\b[a-z0-9-]+\.(com|de|net|org|io)\b|\d{6,}/ },
  { key: 'diet', schwere: 'leicht', pattern: /\b(hungern|hungere|fasten|fastenzeit|diat|kalorien|abnehmen)\b|nichts essen|keine mahlzeit|nur wasser/ },
  { key: 'exercise', schwere: 'leicht', pattern: /\bmarathon\b|erschoepfung|bis du nicht mehr kannst|\b([5-9]\d|\d{3,})\s*(liegestuetz\w*|kniebeug\w*|situps|klimmzueg\w*)\b/ },
  { key: 'car', schwere: 'leicht', pattern: /\b(auto|pkw|fuehrerschein|autofahren)\b/ },
  { key: 'ads', schwere: 'leicht', pattern: /\b(rabatt\w*|gutschein\w*|werbung|werbe\w*|produkt)\b/ },
];

export function normalizeTask(text: string): string {
  return text
    .toLowerCase()
    .replaceAll('ß', 'ss')
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('€', ' euro ')
    .replace(/[^a-z0-9@./+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ruleCheck(text: string): RuleResult {
  const trimmed = text.trim();
  if (trimmed.length < 10) return { ok: false, key: 'short', schwere: 'leicht' };
  if (trimmed.length > 140) return { ok: false, key: 'long', schwere: 'leicht' };
  const norm = normalizeTask(trimmed);
  for (const hit of HITS) {
    if (hit.pattern.test(norm)) return { ok: false, key: hit.key, schwere: hit.schwere };
  }
  const money = norm.matchAll(/(\d+)\s*euro\b/g);
  for (const found of money) {
    if (Number(found[1]) > 3) return { ok: false, key: 'money', schwere: 'leicht' };
  }
  return { ok: true };
}

export type Release =
  | { status: 'rejected'; key: ReasonKey; schwere: Severity }
  | { status: 'pending' }
  | { status: 'approved' };

/** Fällt die KI aus, bleibt alles hängen, was der Wortfilter nicht schon ablehnt. */
export function releaseDecision(text: string, aiAvailable: boolean): Release {
  const rule = ruleCheck(text);
  if (!rule.ok) return { status: 'rejected', key: rule.key, schwere: rule.schwere };
  if (!aiAvailable) return { status: 'pending' };
  return { status: 'approved' };
}

export const MODEL_SYSTEM_PROMPT = `Du prüfst kurze Aufgaben, die ein anonymer Nutzer für einen fremden Erwachsenen schreibt. Die Aufgabe muss sicher, legal, freundlich, freiwillig, in unter 30 Minuten machbar und kostenlos oder sehr günstig sein. Sie darf niemanden bedrängen, keine persönlichen Daten enthalten, keinen Kontakt zum Autor herstellen und nichts mit Alkohol, Drogen, Sexualität, Gewalt, Hungern, Fasten, Diät, Kalorienzwang, extremem Training, Selbstgefährdung, Hass oder Werbung zu tun haben. Normales Essen und Trinken ist erlaubt.

Antworte ausschließlich als JSON:
{"ok": true} oder {"ok": false, "grund": "<kurzer freundlicher Grund auf Deutsch, max. 80 Zeichen>", "schwere": "schwer"} oder {"ok": false, "grund": "<Grund>", "schwere": "leicht"}
Nur Gefahr, Illegales, Sexualität, Hass, Bedrängen und Ähnliches ist "schwer". Zu teuer, Auto oder besondere Fähigkeiten ist "leicht".`;

export type ModelReply =
  | { status: 'approved' }
  | { status: 'rejected'; grund: string; schwere: Severity }
  | { status: 'pending' };

/** Kaputtes oder unvollständiges JSON gibt nichts frei. */
export function parseModelReply(raw: string): ModelReply {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return { status: 'pending' };
    const row = data as { ok?: unknown; grund?: unknown; schwere?: unknown };
    if (row.ok === true) return { status: 'approved' };
    if (row.ok !== false || typeof row.grund !== 'string') return { status: 'pending' };
    const grund = row.grund.trim().slice(0, 80);
    if (!grund) return { status: 'pending' };
    if (row.schwere !== 'schwer' && row.schwere !== 'leicht') return { status: 'pending' };
    return { status: 'rejected', grund, schwere: row.schwere };
  } catch {
    return { status: 'pending' };
  }
}
