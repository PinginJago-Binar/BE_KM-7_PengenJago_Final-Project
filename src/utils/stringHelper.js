/**
 * Generate random lowercase letters, uppercase letters and numbers
 * @param {number} characterTotal - total character/digit
 * @returns 
 */
const generateRandomString = (characterTotal) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < characterTotal; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

const getFirstAndLastName = (fullName) => {
  const names = fullName.trim().split(' ');
  const firstName = names[0];
  const lastName = names.length > 1 ? names[names.length - 1] : names[0];

  return { firstName, lastName };
}

export {
  generateRandomString,
  getFirstAndLastName
}