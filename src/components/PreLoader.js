
import React from 'react';
import { usePreLoader } from '../contexts/PreLoaderContext';
import '../css/PreLoader.css';

function PreLoader() {
  const { isLoading, percent } = usePreLoader();

  if (!isLoading) return null; // Если не идет загрузка, не показывать прелоудер

  return (
    <div className="loading__win">
      <div className="center">
        <p className="percent">{percent}%</p>
        <div className="ball"></div>
        {/* Генерация пузырьков и блеска */}
        {[...Array(8)].map((_, i) => <div className={`blubb-${i + 1}`} key={i}></div>)}
        {[...Array(10)].map((_, i) => <div className={`sparkle-${i + 1}`} key={i}></div>)}
      </div>
      <div className="logo">
        <img src="img/logo.svg" alt="Logo" />
      </div>
    </div>
  );
}

export default PreLoader;
