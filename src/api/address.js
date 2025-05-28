import { apiRequest } from './base';

export const addressApi = {
  // Получение всех адресов текущего пользователя
  getUserAddresses: () =>
    apiRequest('/addresses/', 'GET'),

  // Получение конкретного адреса по ID
  getAddress: (addressId) =>
    apiRequest(`/addresses/${addressId}`, 'GET'),

  // Создание нового адреса
  createAddress: (addressData) =>
    apiRequest('/addresses/', 'POST', addressData),

  // Обновление адреса по ID
  updateAddress: (addressId, addressData) =>
    apiRequest(`/addresses/${addressId}`, 'PATCH', addressData),

  // Удаление адреса по ID
  deleteAddress: (addressId) =>
    apiRequest(`/addresses/${addressId}`, 'DELETE'),

  // Добавление нового адреса магазина
  createStoreAddress: (addressData) =>
    apiRequest('/store-addresses/', 'POST', addressData),

  // Получение всех адресов магазинов
  getAllStoreAddresses: () =>
    apiRequest('/store-addresses/', 'GET'),

  // Получение адреса магазина по ID
  getStoreAddress: (addressId) =>
    apiRequest(`/store-addresses/${addressId}`, 'GET'),

  // Обновление существующего адреса магазина
  updateStoreAddress: (addressId, addressData) =>
    apiRequest(`/store-addresses/${addressId}`, 'PATCH', addressData),

  // Удаление адреса магазина
  deleteStoreAddress: (addressId) =>
    apiRequest(`/store-addresses/${addressId}`, 'DELETE'),
};
