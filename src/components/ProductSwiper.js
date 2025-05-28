import { Link } from 'react-router-dom';
import '../css/ProductSwiper.css';
import { useMediaQuery } from 'usehooks-ts';
import { CartContext } from '../contexts/CartContext';
import { useProductCard } from '../contexts/ProductCardContext';
import { catalogApi } from '../api/catalog';
import React, { useEffect, useContext, useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { FreeMode, Navigation } from 'swiper/modules';

function ProductSwiper(){
  
  const { formatProductData } = useProductCard();
  const { addToCart } = useContext(CartContext);
  const SmallScreen = useMediaQuery('(max-width: 930px)');
  const [randomProducts, setRandomProducts] = useState([]);
  const [error, setError] = useState(null);
  // Состояние для хранения информации о том, на какой элемент наведен курсор
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const isSmallScreen = useMediaQuery('(max-width: 480px)');
  const isMediumScreen = useMediaQuery('(min-width: 480px) and (max-width: 640px)');
  const isMediumLargeScreen = useMediaQuery('(min-width: 640px) and (max-width: 768px)');
  const isLargeMediumScreen = useMediaQuery('(min-width: 768px) and (max-width: 800px)');
  const isLargeScreen = useMediaQuery('(min-width: 800px) and (max-width: 931px)');
  const isExtraLargeScreen = useMediaQuery('(min-width: 930px) and (max-width: 1200px)');
  const isExtraExtraLargeScreen = useMediaQuery('(min-width: 1201px) and (max-width: 1650px)');

  const slidesPerView = useMemo(() => {
    if (isExtraExtraLargeScreen) return 2;
    if (isExtraLargeScreen) return 1.5;
    if (isLargeScreen) return 3;
    if (isLargeMediumScreen || isMediumLargeScreen) return 2;
    if (isMediumScreen) return 1.5;
    if (isSmallScreen) return 1;
    return 3;
  }, [
    isExtraExtraLargeScreen,
    isExtraLargeScreen,
    isLargeScreen,
    isLargeMediumScreen,
    isMediumLargeScreen,
    isMediumScreen,
    isSmallScreen
  ]);
  
  // Загрузка случайных напитков при монтировании
  useEffect(() => {
    const loadRandomDrinks = async () => {
      try {
        const data = await catalogApi.getRandomDrinksBySection(6);
        const sectionKey = Object.keys(data)[0];
        const drinks = data[sectionKey]?.drinks || [];
        setRandomProducts(drinks);;
      } catch (err) {
        setError(err.message);
      } 
    };
    loadRandomDrinks();
  }, []);
  
  const swiper = randomProducts.map((product, i) => {
    const formattedProduct = formatProductData(product);
    const priceInfo = formattedProduct.getPrice(formattedProduct.volumes[0]);
    return (
      <SwiperSlide 
        className="potential__choices" 
        key={product.id}
        onMouseEnter={() => setHoveredIndex(i)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <img 
          className='potential__choices__img'
          src={formattedProduct.imgSrc} 
          alt={formattedProduct.name}
        />
        <div className='potential__choices__info'>
          <div>
            <p className='potential__choices__info-name'>{formattedProduct.name}</p>
            <p className='potential__choices__info-volume'>{formattedProduct.volumes[0]} мл</p>
          </div>
          <p className='potential__choices__info-price'>
            {priceInfo.discountedPrice !== priceInfo.price ? (
              <>
                <span className="original-price">{priceInfo.price} ₽</span>
                <span className="discounted-price">{priceInfo.discountedPrice} ₽</span>
              </>
            ) : (
              `${priceInfo.price} ₽`
            )}
          </p>
          <Link to={`/product/${formattedProduct.id}`} className='switch__to__product'></Link>
          {SmallScreen ? (
            <img 
              src='/img/add__to__basket.svg' 
              className='add__to__basket' 
              alt="Добавить в корзину"
              onClick={() => addToCart(formattedProduct, formattedProduct.volumes[0])}
            />
          ) : (
            hoveredIndex === i && (
              <img 
                src='/img/add__to__basket.svg' 
                className='add__to__basket' 
                alt="Добавить в корзину"
                onClick={() => addToCart(formattedProduct, formattedProduct.volumes[0])}
              />
            )
          )}
        </div>
      </SwiperSlide>
    );
  });
    
  return (
    <div>
      <div className='product__swiper'>
        <p>вам может понравиться: </p>
        <Swiper
          slidesPerView={slidesPerView}
          spaceBetween={30}
          freeMode={true}
          navigation={true}
          modules={[FreeMode, Navigation]}
          className="swipe__potentials"
        >
          {swiper}
        </Swiper> 
      </div>
    </div>
  );
}

export default ProductSwiper;