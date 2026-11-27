import type { TenseId } from './italian-data';

/*
 * Sentences for the sentence builder (English -> Italian).
 *
 * Each word in `it` is written as type:word
 *   n: noun   a: adjective   r: adverb   p: preposition   d: article
 *   v:verbId:person   (the conjugated form is looked up in VERBS)
 *
 * when      a time phrase that is accepted at the start OR the end
 * whenFirst show the time phrase at the start in the model answer
 * alt       other correct versions of `it` (without the `when` words)
 * lead      words that are already filled in, e.g. before the congiuntivo
 * named     the subject is a noun or name, so no subject pronoun is offered
 */
export interface SentenceExercise {
  en: string;
  tense: TenseId;
  it: string;
  when?: string;
  whenFirst?: boolean;
  alt?: string[];
  lead?: string;
  named?: boolean;
}

export const SENTENCES: SentenceExercise[] = [
  // ---------- Presente ----------
  { tense: 'presente', en: 'I drink a coffee every morning.', it: 'v:bere:io d:un n:caffè', when: 'a:ogni n:mattina' },
  { tense: 'presente', en: 'She speaks Italian very well.', it: 'v:parlare:lei n:italiano r:molto r:bene',
    alt: ['v:parlare:lei r:molto r:bene n:italiano', 'v:parlare:lei d:l\' n:italiano r:molto r:bene', 'v:parlare:lei r:molto r:bene d:l\' n:italiano'] },
  { tense: 'presente', en: 'We eat pizza at the restaurant.', it: 'v:mangiare:noi d:la n:pizza p:al n:ristorante',
    alt: ['v:mangiare:noi n:pizza p:al n:ristorante', 'v:mangiare:noi d:la n:pizza p:nel n:ristorante', 'v:mangiare:noi n:pizza p:nel n:ristorante'] },
  { tense: 'presente', en: 'They go to school every day.', it: 'v:andare:loro p:a n:scuola', when: 'a:ogni n:giorno' },
  { tense: 'presente', en: 'You are very kind.', it: 'v:essere:tu r:molto a:gentile' },
  { tense: 'presente', en: 'I have a small dog.', it: 'v:avere:io d:un a:piccolo n:cane', alt: ['v:avere:io d:un n:cane a:piccolo'] },
  { tense: 'presente', en: 'He reads the newspaper in the kitchen.', it: 'v:leggere:lui d:il n:giornale p:in n:cucina',
    alt: ['v:leggere:lui d:il n:giornale p:nella n:cucina'] },
  { tense: 'presente', en: 'You all see the sea from the window.', it: 'v:vedere:voi d:il n:mare p:dalla n:finestra' },
  { tense: 'presente', en: 'I am going out with my friends tonight.', it: 'v:uscire:io p:con d:i a:miei n:amici', when: 'r:stasera' },
  { tense: 'presente', en: 'She does not understand the question.', it: 'r:non v:capire:lei d:la n:domanda' },
  { tense: 'presente', en: 'We want a new house.', it: 'v:volere:noi d:una a:nuova n:casa', alt: ['v:volere:noi d:una n:casa a:nuova'] },
  { tense: 'presente', en: 'The cat sleeps on the bed.', it: 'd:il n:gatto v:dormire:lui p:sul n:letto', named: true },
  { tense: 'presente', en: 'I am looking for my keys.', it: 'v:cercare:io d:le a:mie n:chiavi' },
  { tense: 'presente', en: 'They come from Italy.', it: 'v:venire:loro p:dall\' n:Italia' },
  { tense: 'presente', en: 'You always write long letters.', it: 'v:scrivere:tu r:sempre n:lettere a:lunghe',
    alt: ['v:scrivere:tu r:sempre a:lunghe n:lettere'] },
  { tense: 'presente', en: 'I give the book to Marco.', it: 'v:dare:io d:il n:libro p:a n:Marco', alt: ['v:dare:io p:a n:Marco d:il n:libro'] },
  { tense: 'presente', en: 'He always tells the truth.', it: 'v:dire:lui r:sempre d:la n:verità' },
  { tense: 'presente', en: 'We are taking the train today.', it: 'v:prendere:noi d:il n:treno', when: 'r:oggi' },

  // ---------- Passato Prossimo ----------
  { tense: 'passato_prossimo', en: 'I told my mother the truth.', it: 'v:dire:io d:la n:verità p:a a:mia n:madre',
    alt: ['v:dire:io p:a a:mia n:madre d:la n:verità'] },
  { tense: 'passato_prossimo', en: 'She went to school yesterday.', it: 'v:andare:lei p:a n:scuola', when: 'r:ieri' },
  { tense: 'passato_prossimo', en: 'We ate a good pizza last night.', it: 'v:mangiare:noi d:una a:buona n:pizza', when: 'r:ieri n:sera' },
  { tense: 'passato_prossimo', en: 'They drank the red wine.', it: 'v:bere:loro d:il n:vino a:rosso' },
  { tense: 'passato_prossimo', en: 'You wrote a letter to your friend.', it: 'v:scrivere:tu d:una n:lettera p:al a:tuo n:amico',
    alt: ['v:scrivere:tu p:al a:tuo n:amico d:una n:lettera'] },
  { tense: 'passato_prossimo', en: 'He arrived late.', it: 'v:arrivare:lui r:tardi' },
  { tense: 'passato_prossimo', en: 'I saw a very interesting film.', it: 'v:vedere:io d:un n:film r:molto a:interessante' },
  { tense: 'passato_prossimo', en: 'You all went out with Maria.', it: 'v:uscire:voi p:con n:Maria' },
  { tense: 'passato_prossimo', en: 'I put the keys on the table.', it: 'v:mettere:io d:le n:chiavi p:sul n:tavolo' },
  { tense: 'passato_prossimo', en: 'She found her bag in the car.', it: 'v:trovare:lei d:la a:sua n:borsa p:in n:macchina',
    alt: ['v:trovare:lei d:la a:sua n:borsa p:nella n:macchina'] },
  { tense: 'passato_prossimo', en: 'We took the train to Rome.', it: 'v:prendere:noi d:il n:treno p:per n:Roma' },
  { tense: 'passato_prossimo', en: 'I slept very well.', it: 'v:dormire:io r:molto r:bene' },
  { tense: 'passato_prossimo', en: 'They came to my house this evening.', it: 'v:venire:loro p:a n:casa a:mia', when: 'r:stasera' },
  { tense: 'passato_prossimo', en: 'You read the new book.', it: 'v:leggere:tu d:il a:nuovo n:libro', alt: ['v:leggere:tu d:il n:libro a:nuovo'] },
  { tense: 'passato_prossimo', en: 'He gave his mother a flower.', it: 'v:dare:lui d:un n:fiore p:a a:sua n:madre',
    alt: ['v:dare:lui p:a a:sua n:madre d:un n:fiore'] },
  { tense: 'passato_prossimo', en: 'She was very happy yesterday.', it: 'v:essere:lei r:molto a:felice', when: 'r:ieri' },
  { tense: 'passato_prossimo', en: 'We looked for the dog in the park.', it: 'v:cercare:noi d:il n:cane p:nel n:parco', alt: ['v:cercare:noi d:il n:cane p:al n:parco'] },
  { tense: 'passato_prossimo', en: 'I did not understand the lesson.', it: 'r:non v:capire:io d:la n:lezione' },
  { tense: 'passato_prossimo', en: 'Marco did his homework.', it: 'n:Marco v:fare:lui d:i n:compiti', named: true,
    alt: ['n:Marco v:fare:lui d:i a:suoi n:compiti'] },
  { tense: 'passato_prossimo', en: 'They heard a strange noise.', it: 'v:sentire:loro d:uno a:strano n:rumore',
    alt: ['v:sentire:loro d:un n:rumore a:strano'] },
  { tense: 'passato_prossimo', en: 'I had a good day today.', it: 'v:avere:io d:una a:buona n:giornata', when: 'r:oggi' },

  // ---------- Imperfetto ----------
  { tense: 'imperfetto', en: 'I used to drink milk every day.', it: 'v:bere:io d:il n:latte', when: 'a:ogni n:giorno' },
  { tense: 'imperfetto', en: 'We used to go to the sea in the summer.', it: 'v:andare:noi p:al n:mare', when: 'p:in n:estate' },
  { tense: 'imperfetto', en: 'She was very tired.', it: 'v:essere:lei r:molto a:stanca' },
  { tense: 'imperfetto', en: 'They used to speak French at home.', it: 'v:parlare:loro n:francese p:a n:casa',
    alt: ['v:parlare:loro n:francese p:in n:casa', 'v:parlare:loro p:a n:casa n:francese', 'v:parlare:loro p:in n:casa n:francese'] },
  { tense: 'imperfetto', en: 'You used to read many books.', it: 'v:leggere:tu a:molti n:libri' },
  { tense: 'imperfetto', en: 'He was sleeping on the sofa.', it: 'v:dormire:lui p:sul n:divano' },
  { tense: 'imperfetto', en: 'I had a black dog.', it: 'v:avere:io d:un n:cane a:nero' },
  { tense: 'imperfetto', en: 'You all always used to arrive early.', it: 'v:arrivare:voi r:sempre r:presto' },
  { tense: 'imperfetto', en: 'We did not know the answer.', it: 'r:non v:sapere:noi d:la n:risposta' },
  { tense: 'imperfetto', en: 'I used to see my grandmother every week.', it: 'v:vedere:io a:mia n:nonna', when: 'a:ogni n:settimana' },

  // ---------- Futuro Semplice ----------
  { tense: 'futuro_semplice', en: 'Tomorrow I will go to the market.', it: 'v:andare:io p:al n:mercato', when: 'r:domani', whenFirst: true },
  { tense: 'futuro_semplice', en: 'We will eat at home tonight.', it: 'v:mangiare:noi p:a n:casa', when: 'r:stasera',
    alt: ['v:mangiare:noi p:in n:casa'] },
  { tense: 'futuro_semplice', en: 'She will arrive at the station tomorrow.', it: 'v:arrivare:lei p:alla n:stazione', when: 'r:domani',
    alt: ['v:arrivare:lei p:in n:stazione'] },
  { tense: 'futuro_semplice', en: 'They will take the bus.', it: 'v:prendere:loro d:l\' n:autobus' },
  { tense: 'futuro_semplice', en: 'You will see a very beautiful city.', it: 'v:vedere:tu d:una n:città r:molto a:bella' },
  { tense: 'futuro_semplice', en: 'I will write an email to my boss.', it: 'v:scrivere:io d:un\' n:email p:al a:mio n:capo',
    alt: ['v:scrivere:io p:al a:mio n:capo d:un\' n:email'] },
  { tense: 'futuro_semplice', en: 'He will be a good doctor.', it: 'v:essere:lui d:un a:bravo n:medico' },
  { tense: 'futuro_semplice', en: 'You all will come to my party.', it: 'v:venire:voi p:alla a:mia n:festa' },
  { tense: 'futuro_semplice', en: 'We will have a lot of time.', it: 'v:avere:noi a:molto n:tempo' },
  { tense: 'futuro_semplice', en: 'I will speak with the director tomorrow.', it: 'v:parlare:io p:con d:il n:direttore', when: 'r:domani' },

  // ---------- Condizionale ----------
  { tense: 'condizionale_presente', en: 'I would like a glass of water.', it: 'v:volere:io d:un n:bicchiere p:d\' n:acqua' },
  { tense: 'condizionale_presente', en: 'Would you eat this cake?', it: 'v:mangiare:tu a:questa n:torta' },
  { tense: 'condizionale_presente', en: 'She would go to Italy with her family.', it: 'v:andare:lei p:in n:Italia p:con d:la a:sua n:famiglia',
    alt: ['v:andare:lei p:con d:la a:sua n:famiglia p:in n:Italia'] },
  { tense: 'condizionale_presente', en: 'We would drink a glass of wine.', it: 'v:bere:noi d:un n:bicchiere p:di n:vino' },
  { tense: 'condizionale_presente', en: 'They would sleep all day.', it: 'v:dormire:loro a:tutto d:il n:giorno' },
  { tense: 'condizionale_presente', en: 'He would be very happy.', it: 'v:essere:lui r:molto a:felice' },
  { tense: 'condizionale_presente', en: 'You all would find a good restaurant here.', it: 'v:trovare:voi d:un a:buon n:ristorante r:qui',
    alt: ['r:qui v:trovare:voi d:un a:buon n:ristorante'] },
  { tense: 'condizionale_presente', en: 'Would you give this book to Luca?', it: 'v:dare:tu a:questo n:libro p:a n:Luca' },
  { tense: 'condizionale_presente', en: 'I would put the flowers on the table.', it: 'v:mettere:io d:i n:fiori p:sul n:tavolo' },
  { tense: 'condizionale_presente', en: 'We would take a taxi.', it: 'v:prendere:noi d:un n:taxi' },

  // ---------- Congiuntivo ----------
  { tense: 'congiuntivo_presente', en: 'I think that he is very intelligent.', lead: 'Penso che', it: 'v:essere:lui r:molto a:intelligente' },
  { tense: 'congiuntivo_presente', en: 'I believe that she has a new car.', lead: 'Credo che', it: 'v:avere:lei d:una a:nuova n:macchina',
    alt: ['v:avere:lei d:una n:macchina a:nuova'] },
  { tense: 'congiuntivo_presente', en: 'I hope that you are well.', lead: 'Spero che', it: 'v:stare:tu r:bene' },
  { tense: 'congiuntivo_presente', en: 'I want you all to come to the party.', lead: 'Voglio che', it: 'v:venire:voi p:alla n:festa' },
  { tense: 'congiuntivo_presente', en: 'I think that they speak English.', lead: 'Penso che', it: 'v:parlare:loro n:inglese',
    alt: ['v:parlare:loro d:l\' n:inglese'] },
  { tense: 'congiuntivo_presente', en: 'I am afraid that he does not understand the problem.', lead: 'Ho paura che', it: 'r:non v:capire:lui d:il n:problema' },
  { tense: 'congiuntivo_presente', en: 'I hope that we find a hotel.', lead: 'Spero che', it: 'v:trovare:noi d:un n:albergo' },
  { tense: 'congiuntivo_presente', en: 'It is important that you drink a lot of water.', lead: 'È importante che', it: 'v:bere:tu a:molta n:acqua' },
  { tense: 'congiuntivo_presente', en: 'I doubt that she knows the answer.', lead: 'Dubito che', it: 'v:sapere:lei d:la n:risposta' },
  { tense: 'congiuntivo_presente', en: 'It is possible that they will arrive late.', lead: 'È possibile che', it: 'v:arrivare:loro r:tardi' },

  // ---------- Imperativo ----------
  { tense: 'imperativo', en: 'Eat the apple! (to one friend)', it: 'v:mangiare:tu d:la n:mela' },
  { tense: 'imperativo', en: 'Let\'s go to the beach!', it: 'v:andare:noi p:in n:spiaggia', alt: ['v:andare:noi p:alla n:spiaggia'] },
  { tense: 'imperativo', en: 'Read the book carefully! (to a group)', it: 'v:leggere:voi d:il n:libro p:con n:attenzione',
    alt: ['v:leggere:voi p:con n:attenzione d:il n:libro'] },
  { tense: 'imperativo', en: 'Come here immediately! (to one friend)', it: 'v:venire:tu r:qui r:subito', alt: ['v:venire:tu r:subito r:qui'] },
  { tense: 'imperativo', en: 'Speak slowly! (to one friend)', it: 'v:parlare:tu r:lentamente' },
  { tense: 'imperativo', en: 'Let\'s take the train!', it: 'v:prendere:noi d:il n:treno' },
  { tense: 'imperativo', en: 'Write your name here! (to a group)', it: 'v:scrivere:voi d:il a:vostro n:nome r:qui',
    alt: ['v:scrivere:voi r:qui d:il a:vostro n:nome'] },
  { tense: 'imperativo', en: 'Drink your milk! (to one friend)', it: 'v:bere:tu d:il a:tuo n:latte' },
];
