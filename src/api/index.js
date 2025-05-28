import { apiRequest } from './base';
import { authApi } from './auth';
import { adminApi } from './admin';
import { addressApi } from './address';
import { cartApi } from './cart';
import { passwordApi } from './password';
import { catalogApi } from './catalog';
import { orderApi } from './order';
import * as userApi from './user';

// Собираем все методы в один объект
export const api = {
    auth: authApi,
    userApi,
    adminApi,
    addressApi,
    cartApi,
    passwordApi,
    catalogApi,
    orderApi,

  // Базовый метод для кастомных запросов
  request: apiRequest
};