import { VERBS, PRONOUNS, PRONOUN_KEYS, Pronoun, TenseId, Verb } from './italian-data';
import { SENTENCES, SentenceExercise } from './sentence-data';

export type WordCategory = 'verb' | 'noun' | 'adjective' | 'adverb' | 'preposition' | 'article' | 'pronoun';

export interface Word {
  text: string;
  category: WordCategory;
  verbId?: string;
  person?: Pronoun;
}

export const CATEGORY_ORDER: WordCategory[] = ['verb', 'noun', 'adjective', 'adverb', 'preposition', 'article', 'pronoun'];

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  verb: 'Verbs (tap to conjugate)',
  noun: 'Nouns',
  adjective: 'Adjectives',
  adverb: 'Adverbs',
  preposition: 'Prepositions',
  article: 'Articles',
  pronoun: 'Subject pronouns (optional)',
};

// How many choices each group shows (always at least 2 more than the sentence needs).
const MIN_CHOICES: Record<WordCategory, number> = {
  verb: 4, noun: 5, adjective: 4, adverb: 4, preposition: 4, article: 5, pronoun: 3,
};

const TAG_CATEGORIES: Record<string, WordCategory> = {
  n: 'noun', a: 'adjective', r: 'adverb', p: 'preposition', d: 'article',
};

export function getVerb(id: string): Verb {
  const verb = VERBS.find(v => v.id === id);
  if (!verb) throw new Error(`Unknown verb: ${id}`);
  return verb;
}

/**
 * The form of a verb for one person. With "essere" as auxiliary the participle
 * agrees with the subject: lui -> "è andato", lei -> "è andata".
 */
export function verbForm(verb: Verb, tense: TenseId, person: Pronoun): string {
  const form = verb.tenses[tense]?.[PRONOUN_KEYS[person]] ?? '-';
  if (person === 'lui') return form.replace(/o\/a$/, 'o');
  if (person === 'lei') return form.replace(/o\/a$/, 'a');
  return form;
}

/** The entries for the scrolling verb picker, in io -> loro order. */
export function verbOptions(verb: Verb, tense: TenseId): { person: Pronoun; form: string }[] {
  return PRONOUNS
    .map(person => ({ person, form: verbForm(verb, tense, person) }))
    .filter(option => option.form !== '-'); // e.g. there is no "io" imperative
}

export function parseWords(notation: string, tense: TenseId): Word[] {
  return notation.split(' ').map(chunk => {
    const [tag, value, person] = chunk.split(':');
    if (tag === 'v') {
      const p = person as Pronoun;
      return { text: verbForm(getVerb(value), tense, p), category: 'verb' as const, verbId: value, person: p };
    }
    return { text: value, category: TAG_CATEGORIES[tag] };
  });
}

/** Joins words with spaces, except after an elided article or preposition (l'acqua). */
export function joinWords(words: Word[]): string {
  return words.reduce((out, word, i) => {
    if (i === 0) return word.text;
    const previous = words[i - 1];
    const elided = (previous.category === 'article' || previous.category === 'preposition') && previous.text.endsWith("'");
    return out + (elided ? '' : ' ') + word.text;
  }, '');
}

function modelWords(exercise: SentenceExercise): Word[] {
  const core = parseWords(exercise.it, exercise.tense);
  const when = exercise.when ? parseWords(exercise.when, exercise.tense) : [];
  return exercise.whenFirst ? [...when, ...core] : [...core, ...when];
}

/** The full model answer, ready to show: "Bevo un caffè ogni mattina." */
export function modelSentence(exercise: SentenceExercise): string {
  const words = modelWords(exercise);
  // In the congiuntivo "tu" looks like io/lui, so the model answer spells it out.
  if (exercise.tense.startsWith('congiuntivo') && optionalPronoun(exercise) === 'tu') {
    words.splice(words.findIndex(w => w.category === 'verb'), 0, { text: 'tu', category: 'pronoun' });
  }
  const body = joinWords(words);
  const text = exercise.lead ? `${exercise.lead} ${body}` : body.charAt(0).toUpperCase() + body.slice(1);
  const last = exercise.en.replace(/\s*\([^)]*\)$/, '').slice(-1);
  return text + (last === '?' || last === '!' ? last : '.');
}

/** The subject pronoun that may optionally be included, if any. */
export function optionalPronoun(exercise: SentenceExercise): Pronoun | null {
  if (exercise.named || exercise.tense === 'imperativo') return null;
  return parseWords(exercise.it, exercise.tense).find(w => w.category === 'verb')?.person ?? null;
}

/** Every word order that counts as correct, as lower-case strings. */
export function acceptedAnswers(exercise: SentenceExercise): Set<string> {
  const when = exercise.when ? parseWords(exercise.when, exercise.tense) : [];
  const pronoun = optionalPronoun(exercise);
  const accepted = new Set<string>();
  const add = (words: Word[]) => accepted.add(joinWords(words).toLowerCase());

  for (const notation of [exercise.it, ...(exercise.alt ?? [])]) {
    const core = parseWords(notation, exercise.tense);
    const orders = when.length ? [[...core, ...when], [...when, ...core]] : [core];
    for (const order of orders) {
      add(order);
      if (!pronoun) continue;
      const subject: Word = { text: pronoun, category: 'pronoun' };
      // The pronoun may go first, or right before the verb (and before "non").
      let beforeVerb = order.findIndex(w => w.category === 'verb');
      if (order[beforeVerb - 1]?.text === 'non') beforeVerb -= 1;
      add([subject, ...order]);
      add([...order.slice(0, beforeVerb), subject, ...order.slice(beforeVerb)]);
    }
  }
  return accepted;
}

export function isCorrectSentence(exercise: SentenceExercise, words: Word[]): boolean {
  return acceptedAnswers(exercise).has(joinWords(words).toLowerCase());
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Every non-verb word used in any sentence; the wrong choices come from here.
const WORD_POOL: Record<string, Set<string>> = {};
for (const exercise of SENTENCES) {
  for (const word of modelWords(exercise)) {
    if (word.category === 'verb') continue;
    (WORD_POOL[word.category] ??= new Set()).add(word.text);
  }
}

export type WordBank = { category: WordCategory; words: Word[] }[];

/** The words to choose from: everything the sentence needs plus some wrong ones. */
export function buildWordBank(exercise: SentenceExercise): WordBank {
  const needed = modelWords(exercise);
  const pronoun = optionalPronoun(exercise);

  return CATEGORY_ORDER.map(category => {
    let required: string[];
    let pool: string[];
    if (category === 'verb') {
      required = needed.filter(w => w.category === 'verb').map(w => w.verbId!);
      pool = VERBS
        .filter(v => v.tenses[exercise.tense])
        // "can!" and "must!" are not really used as commands
        .filter(v => exercise.tense !== 'imperativo' || (v.id !== 'potere' && v.id !== 'dovere'))
        .map(v => v.id);
    } else if (category === 'pronoun') {
      if (!pronoun) return { category, words: [] };
      required = [pronoun];
      pool = [...PRONOUNS];
    } else {
      required = needed.filter(w => w.category === category).map(w => w.text);
      pool = Array.from(WORD_POOL[category] ?? []);
    }

    const unique = Array.from(new Set(required));
    const size = Math.max(MIN_CHOICES[category], unique.length + 2);
    const extras = shuffle(pool.filter(item => !unique.includes(item))).slice(0, size - unique.length);

    const words: Word[] = shuffle([...unique, ...extras]).map(item =>
      category === 'verb'
        ? { text: getVerb(item).infinitive, category, verbId: item }
        : { text: item, category },
    );
    return { category, words };
  }).filter(group => group.words.length > 0);
}
