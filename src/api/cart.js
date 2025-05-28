import { apiRequest } from './base';

export const cartApi = {
  // Добавление товара в корзину (создает новую позицию или увеличивает количество)
  addToCart: (itemData) =>
    apiRequest('/cart/items/', 'POST', itemData),

  // Получение текущей корзины пользователя
  getCart: () =>
    apiRequest('/cart/', 'GET'),

   // Уменьшение количества товара на 1 единицу
   decrementItem: (itemId) =>
    apiRequest(`/cart/items/${itemId}/decrement`, 'PUT'),

  // Полное удаление позиции из корзины (независимо от количества)
  removeCartItem: (itemId) =>
    apiRequest(`/cart/items/${itemId}`, 'DELETE'),

  // Полная очистка корзины
  clearCart: () =>
    apiRequest('/cart/', 'DELETE'),

};
