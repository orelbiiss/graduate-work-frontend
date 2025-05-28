import { apiRequest } from './base';


// API-клиент (или модуль API-запросов) для административной панели
// Модуль, содержащий функции для отправки запросов к административным эндпоинтам backend-сервера (admin API)
// Каждая функция внутри — это обёртка над определённым HTTP-запросом к серверу.

export const adminApi = {
    // Получение количества активных заказов (NEW, ASSEMBLING, ON_THE_WAY)
    getActiveOrdersCount: () =>
    apiRequest('/admin/orders/active-count/', 'GET'),

    // Получение статистики по количеству заказов в каждом статусе
    getOrdersCountByStatus: () =>
    apiRequest('/admin/orders/status-counts/', 'GET'),

    // Получение всех заказов
    getAllOrders: ({ page, limit, status }) => {
    const params = new URLSearchParams({
        page,
        limit,
        status
    }).toString();

    return apiRequest(`/admin/orders/?${params}`, 'GET');
    },

    // Обновление статуса заказа
    updateOrderStatus: (orderId, status) =>
    apiRequest(`/admin/orders/${orderId}`, 'PATCH', { status }),

    // Метод получения содержимого заказа (API-обёртка над эндпоинтом GET /:orderId/items)
    getOrderItems: (orderId) =>
        apiRequest(`/orders/${orderId}/items`, 'GET'),
};
