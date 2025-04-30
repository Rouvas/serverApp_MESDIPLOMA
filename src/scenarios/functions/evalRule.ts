/**
 * Безопасно вычисляет логическое выражение, заменяя симптомы на true/false.
 */
export function evalRule(rule: string, facts: Set<string>): boolean {
  let expr = rule;

  try {
    // Заменяем логические операторы
    expr = expr.replace(/∧/g, '&&').replace(/∨/g, '||').replace(/¬/g, '!');

    // Находим все уникальные симптомы (включая фразы с пробелами)
    const tokens = Array.from(new Set(expr.match(/[А-Яа-яёЁ_ ]+/g)));

    for (const token of tokens.sort((a, b) => b.length - a.length)) {
      const symptom = token.trim();
      if (!symptom) continue;

      // экранируем спецсимволы
      const escaped = symptom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![\\w\\d])${escaped}(?![\\w\\d])`, 'g');
      const value = facts.has(symptom) ? 'true' : 'false';

      expr = expr.replace(regex, value);
    }

    // выполняем выражение безопасно
    return Function(`\"use strict\"; return (${expr})`)();
  } catch (err) {
    console.error('Ошибка при evalRule:', err.message, '\\nвыражение:', expr);
    return false;
  }
}
