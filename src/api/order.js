import { apiRequest } from './base';

export const orderApi = {

  // Создание заказа
  createOrder: ({ 
    deliveryType, 
    deliveryDate = null, 
    timeSlotId = null, 
    storeAddressId = null,
    deliveryComment = null,
    deliveryPrice = 0
  }) => {
    // Формируем тело запроса
    const body = {
      delivery_type: deliveryType,
      delivery_price: deliveryPrice,
      delivery_comment: deliveryComment
    };

    // Добавляем параметры в зависимости от типа доставки
    if (deliveryType === 'courier') {
      if (!timeSlotId || !deliveryDate) {
        throw new Error('Для курьерской доставки обязательны timeSlotId и deliveryDate');
      }
      body.delivery_date = deliveryDate;
      body.time_slot_id = timeSlotId;
    } else if (deliveryType === 'pickup') {
      if (!storeAddressId) {
        throw new Error('Для самовывоза обязателен storeAddressId');
      }
      body.store_address_id = storeAddressId;
      
      // Проверяем, что для самовывоза цена доставки 0
      if (deliveryPrice !== 0) {
        throw new Error('Цена доставки должна быть 0 для самовывоза');
      }
    }

    return apiRequest('/orders/', 'POST', body);
  },

  // Получение заказов пользователя с пагинацией и фильтрацией
  getMyOrders: ({ page, limit, status }) => {
    const params = new URLSearchParams({
      page,
      limit,
      status: status === 'все' ? '' : status
    }).toString();
    
    return apiRequest(`/orders/my?${params}`, 'GET');
  },

  // Удаление заказа
  deleteOrder: (orderId) =>
    apiRequest(`/orders/${orderId}`, 'DELETE'),

  // Получение списка товаров в заказе
  getOrderItems: (orderId) =>
    apiRequest(`/orders/${orderId}/items`, 'GET'),

  // Получение уникальных купленных товаров пользователя за все время
  getMyPurchasedItems: ({ page, limit }) => {
    const params = new URLSearchParams({
      page,
      limit
    }).toString();
    
    return apiRequest(`/orders/my/drinks?${params}`, 'GET');
  },

  // Получение слотов доставки на конкретную дату
  getDeliverySlots: (date) => {
    // Форматируем дату в формат YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    return apiRequest(`/delivery/slots/?delivery_date=${formattedDate}`, 'GET');
  }
};
