import Header from '../components/Header';
import Footer from '../components/Footer';
import UpBtn from '../components/UpBtn';
import '../css/CatalogPage.css';
import '../css/CardToAdd.css';
import React, { useState, useEffect, useRef } from 'react';
import CardToAdd from '../components/CardToAdd';
import { useProductCard } from '../contexts/ProductCardContext';
import { catalogApi } from '../api/catalog';

function Catalog() {

  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [sectionDrinks, setSectionDrinks] = useState({});
  const [error, setError] = useState(null);
  const sectionRefs = useRef({}); // хранилище ссылок на DOM-элементы секций

  // Загрузка списка секций при монтировании
  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await catalogApi.getSections();
        setSections(response);
      } catch (err) {
        setError(err.message);
      } 
    };
    loadSections();
  }, []);


  // Загрузка напитков для секции при активации
  const toggleSection = async (sectionId) => {
    // Если секция уже активна - закрываем
    if (activeSection === sectionId) {
      setActiveSection(null);
      return;
    }

    // Устанавливаем новую активную секцию
    setActiveSection(sectionId);

    // Если напитки для этой секции еще не загружены
    if (!sectionDrinks[sectionId]) {
      try {
        const response = await catalogApi.getSectionById(sectionId);
        setSectionDrinks(prev => ({
          ...prev,
          [sectionId]: response.drinks
        }));
      } catch (err) {
        setError(err.message);
      }
      console.log(sectionDrinks)
    }
    
    // прокрутка к секции с задержкой для корректного отображения
    setTimeout(() => {
      if (sectionRefs.current[sectionId]) {

        // прокрутка к выбранной секции
        sectionRefs.current[sectionId].scrollIntoView({
          behavior: 'smooth', 
          block: 'start'   
        });
      }
    }, 100); 
  };


  // отображаем ошибку если она возникла
  if (error) {
    return <div className="error">Ошибка загрузки каталога: {error}</div>;
  }

  return (
    <>
      <Header />
      {/* Навигация по секциям */}
      <PageNav 
        sections={sections} 
        activeSection={activeSection} 
        onSectionClick={toggleSection} 
      />
      {/* Список товаров */}
      <ProductCatalog 
        sections={sections} 
        sectionDrinks={sectionDrinks}
        activeSection={activeSection} 
        sectionRefs={sectionRefs}
      />
      <Footer />
      <UpBtn />
    </>
  );
}

// компонент навигации по секциям
function PageNav({ sections, activeSection, onSectionClick }) {
  return (
    <section className="page__nav">
      <div className="page__nav__wrapper">

        {sections.map((section, index) => {
          // формирование имя класса из ID секции (удаляем префикс 'section-')
          const className = section.id.replace('section-', '');
          return (
            <NavBlock 
              name={section.title} 
              index={index}
              className={className} 
              id={section.id}
              imgSrc={section.img_src} 
              key={section.id}
              isActive={activeSection === section.id}
              onClick={() => onSectionClick(section.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

// компонент отдельной кнопки секции
function NavBlock({ name, className, imgSrc, isActive, onClick, index }) {
  
  const [animateOnHover, setAnimateOnHover] = useState(false);

  const circleColor = index % 2 === 0 ? 'blue-circle': 'pink-circle';
  
  
  return (
    <div className={`${className} ${circleColor} ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className='bottle'>
        <div className='section__link'>
          <img
            className={animateOnHover ? 'img__bottle__hover' : 'img__bottle'}
            onMouseEnter={() => setAnimateOnHover(true)}
            onMouseLeave={() => setAnimateOnHover(false)}
            src={imgSrc}
            alt={name}
          />
        </div>
      </div>
      <div className="section__name">
        <div 
          className={animateOnHover ? 'name__hover' : 'name'}
          onMouseEnter={() => setAnimateOnHover(true)}
          onMouseLeave={() => setAnimateOnHover(false)}
        >
          {name.toLowerCase()}
        </div>
      </div>
    </div>
  );
}

// компонент отображения каталога товаров
function ProductCatalog({ sections, activeSection, sectionRefs, sectionDrinks }) {
  return (
    <div className='catalog'>
      {sections.map((section) => (
        <Section 
          id={section.id} 
          title={section.title} 
          drinks={sectionDrinks[section.id] || []}  
          key={section.id}
          isActive={activeSection === section.id}
          // сохранение ссылки на DOM-элемент секции
          ref={(el) => (sectionRefs.current[section.id] = el)}
        />
      ))}
    </div>
  );
}

// компонент отдельной секции товаров
const Section = React.forwardRef(({ id, title, drinks, isActive }, ref) => {
  const { formatProductData } = useProductCard();
  // если секция не активна - не рендерим её
  if (!isActive) return null;

  // рендерим карточки товаров для текущей секции
  const cards = drinks.map((drink) => (
    <CardToAdd 
      item={formatProductData(drink)}
      key={drink.id}
    />
  ));

  return (
    // секция с товарами, ref используется для прокрутки
    <section id={id} ref={ref}>
      <div className="section__title">
        <p className="title">{title}</p>
      </div>
      <div className="product__cards">{cards}</div>
    </section>
  );
});

export default Catalog;