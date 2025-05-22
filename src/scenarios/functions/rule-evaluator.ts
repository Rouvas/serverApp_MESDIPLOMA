import { SymptomInstanceDto } from '../../dialog/dto/symptom-instance.dto';

/**
 * Безопасно вычисляет логическое выражение, заменяя симптомы на true/false.
 */
export function evaluateScenarioRule(
  rule: string,
  instances: SymptomInstanceDto[],
): boolean {
  const facts = new Set(instances.filter((i) => i.presence).map((i) => i.key));

  let expr = rule;

  try {
    expr = expr.replace(/∧/g, '&&').replace(/∨/g, '||').replace(/¬/g, '!');
    const tokens = Array.from(new Set(expr.match(/[А-Яа-яёЁ_ ]+/g)));

    for (const token of tokens.sort((a, b) => b.length - a.length)) {
      const symptom = token.trim();
      if (!symptom) continue;

      const escaped = symptom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![\\w\\d])${escaped}(?![\\w\\d])`, 'g');
      const value = facts.has(symptom) ? 'true' : 'false';

      expr = expr.replace(regex, value);
    }

    return Function(`"use strict"; return (${expr})`)();
  } catch (err) {
    console.error(
      'Ошибка при evaluateScenarioRule:',
      err.message,
      '\\nВыражение:',
      expr,
    );
    return false;
  }
}
