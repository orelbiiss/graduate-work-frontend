// src/contexts/ApiContext.js
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { api } from '../api';

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const [cache, setCache] = useState({});

  /**
   * Кэширующий запрос
   * @param {string} endpoint - URL endpoint
   * @param {string} method - HTTP метод
   * @param {object} data - Тело запроса
   * @param {object} options - Дополнительные опции
   * @param {boolean} options.force - Игнорировать кэш
   * @param {number} options.ttl - Время жизни кэша в ms
   * @returns {Promise} Результат запроса
   */
  const cachedRequest = useCallback(async (
    endpoint,
    method = 'GET',
    data = null,
    { force = false, ttl = 300000 } = {} // 5 минут по умолчанию
  ) => {
    const cacheKey = `${method}:${endpoint}:${JSON.stringify(data)}`;
    
    // Проверяем кэш для GET-запросов
    if (method === 'GET' && cache[cacheKey] && !force) {
      const { timestamp, data } = cache[cacheKey];
      
      // Проверяем срок годности кэша
      if (Date.now() - timestamp < ttl) {
        return data;
      }
    }

    // Выполняем реальный запрос
    const result = await api.request(endpoint, method, data);

    // Кэшируем только GET-запросы
    if (method === 'GET') {
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          timestamp: Date.now(),
          data: result
        }
      }));
    }

    return result;
  }, [cache]);

  /**
   * Очистка кэша
   * @param {string} key - Ключ для очистки (по частичному совпадению)
   */
  const clearCache = useCallback((key) => {
    setCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(cacheKey => {
        if (cacheKey.includes(key)) {
          delete newCache[cacheKey];
        }
      });
      return newCache;
    });
  }, []);

  // Собираем API с кэшированием
  const enhancedApi = useMemo(() => ({
    ...api,
    request: cachedRequest,
    clearCache,
    getCache: () => cache // Для отладки
  }), [cachedRequest, clearCache, cache]);

  return (
    <ApiContext.Provider value={enhancedApi}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}