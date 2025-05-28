import React, { createContext, useState, useContext } from 'react';

const PreLoaderContext = createContext();

export const usePreLoader = () => useContext(PreLoaderContext);

export const PreLoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const totalSteps = 3; // Количество шагов, которые нужно загрузить
  const [intervalId, setIntervalId] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Флаг для проверки загрузки данных

  const startLoading = () => {
    if (isDataLoaded) return; // Если данные уже загружены, не начинаем повторно
    setIsLoading(true);
    setPercent(0); // Сброс процента
    setStepsCompleted(0); // Сброс шагов
  };

  const finishStep = () => {
    const newSteps = stepsCompleted + 1;
    setStepsCompleted(newSteps);
    setPercent(Math.floor((newSteps / totalSteps) * 100)); // Устанавливаем процент
    // Имитация задержки для постепенного набора процентов
    if (newSteps < totalSteps) {
      setIntervalId(setInterval(() => {
        setPercent(prev => Math.min(prev + 1, 100)); // Увеличиваем процент с задержкой
      }, 100)); // Увеличиваем прогресс каждую секунду
    }
  };

  const finishLoading = () => {
    clearInterval(intervalId); // Останавливаем интервал, когда загрузка завершена
    setPercent(100);
    setTimeout(() => {
      setIsLoading(false);
      setIsDataLoaded(true); // Отмечаем, что данные загружены
    }, 500); // Подождать перед скрытием прелоудера
  };

  return (
    <PreLoaderContext.Provider value={{ isLoading, percent, startLoading, finishStep, finishLoading, isDataLoaded }}>
      {children}
    </PreLoaderContext.Provider>
  );
};
