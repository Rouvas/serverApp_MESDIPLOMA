import { randomBytes } from 'crypto';

const passwordCharset =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!';
const passwordLength = 8;

export function passwordGenerator(): string {
  // Генерируем байты в соответствии с длиной пароля
  const randomData = randomBytes(passwordLength);
  let result = '';
  // Для каждого байта берем индекс по модулю длины набора символов
  for (let i = 0; i < passwordLength; i++) {
    const index = randomData[i] % passwordCharset.length;
    result += passwordCharset[index];
  }
  return result;
}
