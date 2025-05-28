import Header from "../components/Header";
import '../css/ProductPage.css'
import SidePanel from '../components/SideBar'
import ProductSwiper from '../components/ProductSwiper.js'
import { useState, useContext, useEffect } from "react";
import { CartContext } from '../contexts/CartContext.js';
import { useProductCard } from "../contexts/ProductCardContext.js";
import { catalogApi } from "../api/catalog.js";
import { useParams } from "react-router-dom";

function ProductPage(){
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchProduct = async () => {
          try {
            const data = await catalogApi.getDrink(id);
            setProduct(data);
            console.log(data)
          } catch (err) {
            setError(err.message);
          }
        };
        
        fetchProduct();
    }, [id]);

    return(
        <>
            <Header/>
            <MainBlock product = {product}/>
            <SidePanel />
        </>
    )
}

function MainBlock({ product }){

    const { addToCart, cart } = useContext(CartContext);
    const { formatProductData } = useProductCard();
    const [currentVolume, setCurrentVolume] = useState(null);
    const formattedItem = formatProductData(product);
    const { price, discountedPrice, volumePriceId } = formattedItem.getPrice(currentVolume);
    
    
    // Автоматически выбираем минимальный объем при первой загрузке
    useEffect(() => {
        if (formattedItem.volumes.length > 0 && currentVolume === null) {
                setCurrentVolume(formattedItem.volumes[0]);
            }
        }, [formattedItem, currentVolume]);

    // выбор объема товара
    const handleVolumeClick = (volume) => {
        setCurrentVolume(volume);
    }

    const handleAddToCart = () => {
      if (volumePriceId) {
          addToCart(formattedItem, currentVolume);
      }
    }

    const isInCart = cart.items.some(cartItem => 
        cartItem.id === formattedItem?.id && 
        cartItem.volume === currentVolume
    );

    return(
        <>
            <div className="container">
                <div className="product__image__section">
                    <div className="product__image__wrapper">
                    <img src={formattedItem?.imgSrc} alt={formattedItem?.name}/>
                    </div>
                </div>
                <div className="product__info__section">
                    <div className="product__details">
                        <div>
                            <p className="info__section__title">{formattedItem?.name}</p>
                            <p className="ingredients">Состав: {formattedItem?.ingredients}</p>
                            <div className="line__volume">
                                {formattedItem?.volumes.map((volume, i) => {
                                    return (
                                        <div className={'volumes' + (volume !== currentVolume ? ' active' : '')}  key={i} onClick={() => handleVolumeClick(volume)}>
                                            <img src="/img/bottle__svg.svg" alt="f"></img>
                                            <p className="volumes_p">{ volume } мл</p>
                                        </div>
                                )})}
                            </div>
                        </div>
                        <p className="product__description">{formattedItem?.productDescription}</p>
                        <div className="price__star__rating__container">
                            <div className="price">
                                <img src="/img/wallet.svg" alt="f"></img>
                                <p>
                                    {discountedPrice < price ? (
                                        <>
                                            <span className="new-price">{discountedPrice} ₽</span>
                                            <span className="item-subtotal">{price} ₽</span>
                                        </>
                                    ) : (
                                        <span className="old-price">{price} ₽</span>
                                    )}
                                </p>
                            </div>
                            <div className="star__rating">
                                <p className="rating__value">{currentVolume ? (currentVolume / 1000) : (formattedItem.volumes?.[0] / 1000 || 0)} л</p>
                            </div>
                        </div>
                        <button className="btn__cart__add"  onClick={handleAddToCart} >
                            {isInCart ? "Добавить еще" : "Добавить в корзину"}
                        </button>
                    </div>
                    <ProductSwiper/>
                </div> 
            </div>
        </>
    )
}


export default ProductPage;