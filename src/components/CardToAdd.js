import { Link, useLocation  } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import React, { useState, useContext } from 'react';
import { useProductCard } from '../contexts/ProductCardContext';

function CardToAdd({ item }) {
  
    const { addToCart } = useContext(CartContext);
    const { formatProductData } = useProductCard();
    const [applyHoverEffect, setApplyHoverEffect] = useState(false);
    const [currentVolume, setCurrentVolume] = useState(0);
    const location = useLocation();
    
     // Определяем, находимся ли мы на странице напитков
     const isDrinksPage = location.pathname === '/account';
    
    const formattedItem = formatProductData(item);
    const defaultVolume = formattedItem.volumes?.[0] || 0;
    const { price, discountedPrice, volumePriceId } = formattedItem.getPrice(defaultVolume);
    
    const handleVolumeClick = (volume) => {
        setCurrentVolume(volume);
    }

    const handleAddToCart = () => {
        const volumeToAdd = currentVolume ?? defaultVolume;
      if (volumePriceId) {
          addToCart(formattedItem, volumeToAdd);
      }
      console.log(volumeToAdd)
    }

    return(
        <div className='card'>
          <div className={`main-block-wrapper ${isDrinksPage ? 'mini' : ''}`}>
            <div className='main__block'
                onMouseEnter={() => setApplyHoverEffect(true)}
                onMouseLeave={() => setApplyHoverEffect(false)}>
                <img src="img/Star.svg" alt="" />
                <div className='picture'>
                    <img
                        className="main__block__product__img"
                        src={formattedItem.imgSrc}
                        alt={formattedItem.name}
                    />
                </div>
                <p className="product__volume">
                    {currentVolume === 0 ? (formattedItem.volumes[0] ? formattedItem.volumes[0] / 1000 : 0) : currentVolume / 1000} л
                </p>
                <div className='icon__add'>
                    <img 
                        className={`icon ${isDrinksPage ? 'mini' : ''}`}
                        src='/img/add__to__basket.svg' 
                        onClick={handleAddToCart} 
                        alt="Добавить в корзину"
                    />
                </div>
                <Link to={`/product/${item.id}`} className="link__cover"></Link>
            </div>
            </div>
            <div className="volume__section">
                {formattedItem.volumes.map((volume, index) => (
                    <p 
                        key={index} 
                        className={`volume
                        ${volume === currentVolume ? '' : 'active'}
                        ${isDrinksPage ? 'mini' : ''}
                        ${formattedItem.volumes.length === 1 ? 'single-volume' : ''}
                        `} 
                        onClick={() => handleVolumeClick(volume)}
                    >
                        {volume} мл
                    </p>
                ))}
            </div>
            
            <Link 
                to="/productPage" 
                className={`${applyHoverEffect ? 'position__name__hover' : 'position__name'} ${isDrinksPage ? 'mini' : ''}`}
                onMouseEnter={() => setApplyHoverEffect(true)}
                onMouseLeave={() => setApplyHoverEffect(false)}
            >
                {formattedItem.name.substring(0, 1).toUpperCase() + formattedItem.name.substring(1, formattedItem.name.length).toLowerCase()}
            </Link>
            <div className='price__block'>
                {formattedItem.sale ? <p className={`discounted__price ${isDrinksPage ? 'mini' : ''}`}>{discountedPrice} ₽</p> : ''}
                <p className={`${formattedItem.sale ? 'outdated__price' : 'product__price'} ${isDrinksPage ? 'mini' : ''}`}>{price} ₽</p>
            </div>
        </div>
    );
}

export default CardToAdd;