import React, { useEffect, useState } from 'react';
import '../css/PreLoader.css';

function PreLoader({ loadData }) {
  const [showPreLoader, setShowPreLoader] = useState(true); // Показываем прелоадер, пока загружаются данные
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const loadDataFromServer = async () => {
      try {
        // Создаем экземпляр AbortController для возможности отмены запроса
        const controller = new AbortController();
        
        // Запускаем параллельно:
        const loadingPromise = loadData({ signal: controller.signal });

        // Имитируем процесс прогресса
        let currentPercent = 0;
        const interval = setInterval(() => {
          if (currentPercent < 90) {
            currentPercent += 1;
            setPercent(currentPercent);
          }
        }, 30); // Плавно увеличиваем прогресс

        // Ожидаем завершения загрузки
        await loadingPromise;

        // Завершаем прогресс и показываем успешную загрузку
        setPercent(100);
        setShowPreLoader(false); // Прелоадер скрывается после загрузки
        clearInterval(interval);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setPercent(100);
        setShowPreLoader(false); // Прелоадер скрывается, даже если произошла ошибка
      }
    };

    loadDataFromServer();
  }, [loadData]);

  const generateBlubbAndSparkle = () => {
    return (
      <>
        {[...Array(8)].map((_, i) => (
          <div className={`blubb-${i+1}`} key={`blubb-${i+1}`}></div>
        ))}
        {[...Array(10)].map((_, i) => (
          <div className={`sparkle-${i+1}`} key={`sparkle-${i+1}`}></div>
        ))}
      </>
    );
  };

  return (
    <div className={showPreLoader ? 'loading__win' : 'loading__complete'}>
      <div className="center">
        <p className="percent">{percent}%</p>
        <div className="ball"></div>
        {generateBlubbAndSparkle()}
      </div>
      <div className="logo">
        <img src="img/logo.svg" alt="Logo" />
      </div>
    </div>
  );
}

export default PreLoader;
