import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

// Шифрование и сохранение
export const saveUserToLocalStorage = (user) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(user), SECRET_KEY).toString();
  localStorage.setItem('user', ciphertext);
};

// Расшифровка и получение
export const getUserFromLocalStorage = () => {
  const ciphertext = localStorage.getItem('user');
  if (!ciphertext) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Ошибка при расшифровке данных пользователя', error);
    return null;
  }
};

// Очистка
export const removeUserFromLocalStorage = () => {
  localStorage.removeItem('user');
};


// Шифрование и сохранение адреса
export const saveAddressToLocalStorage = (address) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(address), SECRET_KEY).toString();
  localStorage.setItem('address', ciphertext);
};

// Расшифровка и получение адреса
export const getAddressFromLocalStorage = () => {
  const ciphertext = localStorage.getItem('address');
  if (!ciphertext) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Ошибка при расшифровке адреса', error);
    return null;
  }
};

// Очистка адреса
export const removeAddressFromLocalStorage = () => {
  localStorage.removeItem('address');
};

