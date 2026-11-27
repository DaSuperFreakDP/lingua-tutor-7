import type { Pronoun, TenseId, Verb } from './italian-data';

interface EnglishVerb {
  base: string;
  third: string; // he / she form
  past: string; // simple past ("were" forms of "be" are handled separately)
  participle: string;
  stative?: boolean; // no "-ing" form in the imperfetto ("I was knowing")
  ing?: string;
}

// Keyed by verb id. If you add a verb to VERBS, add it here too.
const ENGLISH_VERBS: Record<string, EnglishVerb> = {
  essere: { base: 'be', third: 'is', past: 'was', participle: 'been', stative: true },
  avere: { base: 'have', third: 'has', past: 'had', participle: 'had', stative: true },
  andare: { base: 'go', third: 'goes', past: 'went', participle: 'gone', ing: 'going' },
  fare: { base: 'do', third: 'does', past: 'did', participle: 'done', ing: 'doing' },
  bere: { base: 'drink', third: 'drinks', past: 'drank', participle: 'drunk', ing: 'drinking' },
  dare: { base: 'give', third: 'gives', past: 'gave', participle: 'given', ing: 'giving' },
  dire: { base: 'say', third: 'says', past: 'said', participle: 'said', ing: 'saying' },
  stare: { base: 'stay', third: 'stays', past: 'stayed', participle: 'stayed', ing: 'staying' },
  uscire: { base: 'go out', third: 'goes out', past: 'went out', participle: 'gone out', ing: 'going out' },
  venire: { base: 'come', third: 'comes', past: 'came', participle: 'come', ing: 'coming' },
  dovere: { base: 'have to', third: 'has to', past: 'had to', participle: 'had to', stative: true },
  potere: { base: 'be able to', third: 'is able to', past: 'was able to', participle: 'been able to', stative: true },
  volere: { base: 'want', third: 'wants', past: 'wanted', participle: 'wanted', stative: true },
  sapere: { base: 'know', third: 'knows', past: 'knew', participle: 'known', stative: true },
  parlare: { base: 'speak', third: 'speaks', past: 'spoke', participle: 'spoken', ing: 'speaking' },
  mangiare: { base: 'eat', third: 'eats', past: 'ate', participle: 'eaten', ing: 'eating' },
  prendere: { base: 'take', third: 'takes', past: 'took', participle: 'taken', ing: 'taking' },
  leggere: { base: 'read', third: 'reads', past: 'read', participle: 'read', ing: 'reading' },
  scrivere: { base: 'write', third: 'writes', past: 'wrote', participle: 'written', ing: 'writing' },
  vedere: { base: 'see', third: 'sees', past: 'saw', participle: 'seen', ing: 'seeing' },
  dormire: { base: 'sleep', third: 'sleeps', past: 'slept', participle: 'slept', ing: 'sleeping' },
  sentire: { base: 'hear', third: 'hears', past: 'heard', participle: 'heard', stative: true },
  capire: { base: 'understand', third: 'understands', past: 'understood', participle: 'understood', stative: true },
  cercare: { base: 'look for', third: 'looks for', past: 'looked for', participle: 'looked for', ing: 'looking for' },
  trovare: { base: 'find', third: 'finds', past: 'found', participle: 'found', ing: 'finding' },
  mettere: { base: 'put', third: 'puts', past: 'put', participle: 'put', ing: 'putting' },
  arrivare: { base: 'arrive', third: 'arrives', past: 'arrived', participle: 'arrived', ing: 'arriving' },
};

const ENGLISH_PRONOUNS: Record<Pronoun, string> = {
  io: 'I',
  tu: 'you',
  lui: 'he',
  lei: 'she',
  noi: 'we',
  voi: 'you all',
  loro: 'they',
};

/**
 * English translation of one conjugated form, e.g. (bere, presente, loro) -> "they drink".
 */
export function translateConjugation(verb: Verb, tense: TenseId, pronoun: Pronoun): string {
  const english = ENGLISH_VERBS[verb.id];
  // Fallback for a verb that has no entry above: show who + the dictionary meaning.
  if (!english) return `${ENGLISH_PRONOUNS[pronoun]}: ${verb.english}`;

  const subject = ENGLISH_PRONOUNS[pronoun];
  const isThird = pronoun === 'lui' || pronoun === 'lei';
  const isBe = english.base === 'be';
  const isAble = verb.id === 'potere';

  const beNow = pronoun === 'io' ? 'am' : isThird ? 'is' : 'are';
  const beThen = pronoun === 'io' || isThird ? 'was' : 'were';

  const present = isBe ? beNow : isAble ? `${beNow} able to` : isThird ? english.third : english.base;
  const past = isBe ? beThen : isAble ? `${beThen} able to` : english.past;

  switch (tense) {
    case 'presente':
      if (isAble) return `${subject} can`;
      return `${subject} ${present}`;

    case 'passato_prossimo':
      return `${subject} ${past} / ${isThird ? 'has' : 'have'} ${english.participle}`;

    case 'imperfetto':
      if (english.stative || !english.ing) return `${subject} ${past} / used to ${english.base}`;
      return `${subject} ${beThen} ${english.ing} / used to ${english.base}`;

    case 'futuro_semplice':
      return `${subject} will ${english.base}`;

    case 'condizionale_presente':
      if (isAble) return `${subject} could / would be able to`;
      if (verb.id === 'dovere') return `${subject} should / would have to`;
      return `${subject} would ${english.base}`;

    case 'congiuntivo_presente':
      return `that ${subject} ${present}`;

    case 'imperativo':
      // In the imperative, the lui/lei form is also the polite "Lei" command.
      if (pronoun === 'tu') return `${english.base}! (to one person)`;
      if (pronoun === 'noi') return `let's ${english.base}!`;
      if (pronoun === 'voi') return `${english.base}! (to a group)`;
      if (isThird) return `${english.base}! (formal) / let ${pronoun === 'lei' ? 'her' : 'him'} ${english.base}`;
      if (pronoun === 'loro') return `let them ${english.base}`;
      return `${english.base}!`;

    default:
      return `${subject} ${english.base}`;
  }
}

/** Upper-cases the first letter for display: "bevono" -> "Bevono". */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
