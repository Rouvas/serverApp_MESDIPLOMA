export interface SymptomPattern {
  key: string;
  patterns: RegExp[];
  negations: RegExp[]; // шаблоны для «не X» → presence=false
}

export const SYMPTOM_PATTERNS: SymptomPattern[] = [
  {
    key: 'лихорадка',
    patterns: [/\b(лихорадк[аи]|жар|температур[аи])\b/i],
    negations: [/\bбез\s+лихорадк[аи]\b/i, /\bне\s+лихорад[аи]\b/i],
  },
  {
    key: 'кашель',
    patterns: [/\b(кашель|кашляю|кашляешь|кашляет)\b/i],
    negations: [/\bбез\s+кашля\b/i, /\bне\s+кашля(ю|ешь|ет)\b/i],
  },
  {
    key: 'мышечная_боль',
    patterns: [/\b(мышечн[а-я]* бол[ьи])\b/i],
    negations: [/\bбез\s+мышечных болей\b/i],
  },
  {
    key: 'боль_в_горле',
    patterns: [/\b(боль в горле|горло болит|комок в горле)\b/gi],
    negations: [/\bбез\s+боли в горле\b/gi, /\bне\s+бол(ит|ят)\s+горло\b/gi],
  },
  {
    key: 'усталость',
    patterns: [/\b(усталость|устал[аи]|слабость)\b/gi],
    negations: [/\bне\s+устал[аи]\b/gi],
  },
  {
    key: 'головная_боль',
    patterns: [/\b(головная боль|болит голова)\b/gi],
    negations: [/\bбез\s+головной боли\b/gi],
  },
  {
    key: 'озноб',
    patterns: [/\bозноб\b/gi],
    negations: [/\bбез\s+озноба\b/gi, /\bне\s+озноблю\b/gi],
  },
  {
    key: 'потливость',
    patterns: [/\b(потливость|поте(ть|ю))\b/gi],
    negations: [/\bне\s+поте(ю|шь)\b/gi],
  },
  {
    key: 'насморк',
    patterns: [/\b(насморк|сопли)\b/gi],
    negations: [/\bбез\s+насморка\b/gi],
  },
  {
    key: 'чихание',
    patterns: [/\b(чихание|чихаю|чихает)\b/gi],
    negations: [/\bбез\s+чихания\b/gi],
  },
  {
    key: 'зуд_в_глазах',
    patterns: [/\b(зуд в глазах|чешутся глаза)\b/gi],
    negations: [/\bбез\s+зуда в глазах\b/gi],
  },
  {
    key: 'зуд_в_носу',
    patterns: [/\b(зуд в носу|чешется нос)\b/gi],
    negations: [/\bбез\s+зуда в носу\b/gi],
  },
  {
    key: 'слезотечение',
    patterns: [/\b(слезотечение|слезятся глаза)\b/gi],
    negations: [/\bбез\s+слезотечения\b/gi],
  },
  {
    key: 'потеря_вкуса',
    patterns: [/\b(потеря вкуса|не чувствую вкуса)\b/gi],
    negations: [/\bбез\s+потери вкуса\b/gi],
  },
  {
    key: 'потеря_запаха',
    patterns: [/\b(потеря запаха|не чувствую запах)\b/gi],
    negations: [/\bбез\s+потери запаха\b/gi],
  },
  {
    key: 'одышка',
    patterns: [/\b(одышка|затруднённое дыхание)\b/gi],
    negations: [/\bбез\s+одышки\b/gi],
  },
  {
    key: 'боль_в_груди',
    patterns: [/\b(боль в груди|грудь болит)\b/gi],
    negations: [/\bбез\s+боли в груди\b/gi],
  },
  {
    key: 'слабость',
    patterns: [/\bслабость\b/gi],
    negations: [/\bбез\s+слабости\b/gi],
  },
  {
    key: 'отделяемая_мокрота',
    patterns: [/\b(мокрота|отделяемая мокрота)\b/gi],
    negations: [/\bбез\s+мокроты\b/gi],
  },
  {
    key: 'свистящее_дыхание',
    patterns: [/\b(свистящее дыхание|свист при дыхании)\b/gi],
    negations: [/\bбез\s+свиста\b/gi],
  },
  {
    key: 'утомляемость',
    patterns: [/\bутомляемость\b/gi],
    negations: [/\bбез\s+утомляемости\b/gi],
  },
  {
    key: 'сыпь',
    patterns: [/\bсыпь\b/gi],
    negations: [/\bбез\s+сыпи\b/gi],
  },
  {
    key: 'конъюнктивит',
    patterns: [/\b(конъюнктивит|покрасн(ение|евшие) глаза)\b/gi],
    negations: [/\bбез\s+конъюнктивита\b/gi],
  },
  {
    key: 'светобоязнь',
    patterns: [/\bсветобоязнь\b/gi],
    negations: [/\bбез\s+светобоязни\b/gi],
  },
  {
    key: 'общая_слабость',
    patterns: [/\b(общая слабость|слабость)\b/gi],
    negations: [/\bбез\s+слабости\b/gi],
  },
  {
    key: 'увеличенные_лимфоузлы',
    patterns: [/\b(увеличенные лимфоузлы|лимфоузлы увеличены)\b/gi],
    negations: [/\bбез\s+увеличения лимфоузлов\b/gi],
  },
  {
    key: 'отсутствие_аппетита',
    patterns: [/\b(отсутствие аппетита|не хочу есть)\b/gi],
    negations: [/\bс аппетитом\b/gi],
  },
  {
    key: 'боль_в_ухе',
    patterns: [/\b(боль в ухе|ухо болит)\b/gi],
    negations: [/\bбез\s+боли в ухе\b/gi],
  },
  {
    key: 'понижение_слуха',
    patterns: [/\b(понижение слуха|плохо слышу)\b/gi],
    negations: [/\bбез\s+проблем со слухом\b/gi],
  },
  {
    key: 'заложенность_уха',
    patterns: [/\b(заложенность уха|ухо заложено)\b/gi],
    negations: [/\bбез\s+заложенности уха\b/gi],
  },
  {
    key: 'раздражительность',
    patterns: [/\bраздражительн[а-я]*\b/gi],
    negations: [/\bбез\s+раздражительности\b/gi],
  },
  {
    key: 'заложенность_носа',
    patterns: [/\b(заложенность носа|нос заложен)\b/gi],
    negations: [/\bбез\s+заложенности носа\b/gi],
  },
  {
    key: 'боль_в_лице',
    patterns: [/\b(боль в лице|лицо болит)\b/gi],
    negations: [/\bбез\s+боли в лице\b/gi],
  },
  {
    key: 'снижение_обоняния',
    patterns: [/\b(снижение обоняния|не чувствую запахи)\b/gi],
    negations: [/\bбез\s+проблем с обонянием\b/gi],
  },
  {
    key: 'тошнота',
    patterns: [/\bтошнота\b/gi],
    negations: [/\bбез\s+тошноты\b/gi],
  },
  {
    key: 'рвота',
    patterns: [/\bрвота\b/gi],
    negations: [/\bбез\s+рвоты\b/gi],
  },
  {
    key: 'диарея',
    patterns: [/\bдиарея\b/gi],
    negations: [/\bбез\s+диареи\b/gi],
  },
  {
    key: 'урчание',
    patterns: [/\bурчание\b/gi],
    negations: [/\bбез\s+урчания\b/gi],
  },
  {
    key: 'боль_в_животе',
    patterns: [/\b(боль в животе|живот болит)\b/gi],
    negations: [/\bбез\s+боли в животе\b/gi],
  },
];
