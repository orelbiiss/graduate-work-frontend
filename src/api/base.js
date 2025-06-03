const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000' 
  : 'https://graduate-work-backend.onrender.com';

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status; // Сохраняем HTTP-статус
    this.errors = errors; // Детали ошибок (например, проблемы валидации полей)
  }
}

/**
 * Универсальная функция для выполнения HTTP-запросов
 */
export async function apiRequest(endpoint, method = 'GET', data = null) {
  // Конфигурация запроса
  const config = {
    method, // HTTP-метод
    headers: {
      'Content-Type': 'application/json', // Отправляем данные в JSON
    },
    credentials: 'include', // Включаем передачу куков (для аутентификации)
  };

  // Если есть данные для отправки, добавляем их в тело запроса
  if (data) {
    config.body = JSON.stringify(data); // Сериализуем объект в JSON
  }

  // Выполняем запрос
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Обрабатываем ответ
  if (!response.ok) {
    // Пытаемся распарсить ошибку от сервера
    const errorData = await response.json().catch(() => ({}));
    
    // Создаем кастомную ошибку с деталями от сервера
    throw new ApiError(
      errorData.detail || 'Ошибка запроса', // Сообщение об ошибке
      response.status, // HTTP-статус
      errorData.errors // Детализированные ошибки (например, валидации)
    );
  }

  // Для ответов без тела (204 No Content) возвращаем null
  // В остальных случаях парсим JSON
  return response.status !== 204 ? response.json() : null;
}