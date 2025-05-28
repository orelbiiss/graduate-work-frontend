import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext.js';
import { useUser } from '../contexts/UserContext.js';
import { useMediaQuery } from 'usehooks-ts';
import ProductSwiper from './ProductSwiper.js';
import { useNavigate } from 'react-router-dom'; 
import AuthPanels from './AuthPanels';
import CheckOut from '../layouts/CheckOut.js';

// компонент для отображения пустой корзины
function EmptyCart({ onClose }) {
    return (
        <>
        <div className='left__margin'>
            <div className='main'>
                <div className='text__block'>  
                <p className='text__block__title'>в корзине</p>
                <p className='text__block__title'>ничего нет...</p>  
                <p className='text__description'>Загляните в наш <Link to="/catalog" className='accent__text'>каталог товаров</Link></p>
                </div>
            </div>
            <ProductSwiper/>
            <div className='main'>
            <Link to="/catalog" className='btn-filled-sidebar' onClick={onClose}>Перейти к поиску напитков</Link>
            </div>
        </div>
        </>
    );
}

// компонент для отображения содержимого корзины
function ShoppingCart({ setUseRegistrationPanel, useRegistrationPanel, loginRegisterChoice, 
                        setLoginRegisterChoice, setShowEmailPasswordResetPanel,
                        setVerificationToken, setShowVerificationPanel, orders}) 
    {
    const { cart, clearCart } = useContext(CartContext);
    const [panelOpen, setPanelOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useUser(); 
    if (user?.role === 'admin') return null;

    let totalSubtotal = cart.cart_subtotal;
    let totalDiscount = cart.cart_discount;
    let total = cart.cart_total;

    // Создаем карточки товаров для корзины
    const cartCardsJsx = cart.items.map((item) => (
        <ShoppingCartCard 
        item={item}
        key={`${item?.id}-${item?.drink_volume_price_id}`}
        panelOpen={panelOpen}
        setPanelOpen={setPanelOpen}
        />
    ));


    // Функция для обработки нажатия "Оформить заказ"
    const handleCheckout = () => {
        if (cart.items.length === 0) {
        setPanelOpen(true);
        } else {
        if (user) {
            navigate('/checkout');
            return <CheckOut orders={orders}/>
        } else {
            setUseRegistrationPanel(true);
        }
        }
    };

    return (
        <>
        {useRegistrationPanel ? (
            <AuthPanels.RegisterUser 
            loginRegisterChoice={loginRegisterChoice}
            setLoginRegisterChoice={setLoginRegisterChoice}
            onPasswordResetClick={() => setShowEmailPasswordResetPanel(true)}
            onVerificationStart={(token) => {
                setVerificationToken(token);
                setShowVerificationPanel(true);
            }}
        />
        ) : (
            <>
            <div className='left__margin'>
                <div className='main'>
                <div className='status__block'>
                    <p className='basket__text'>
                    корзина <span>/ {cart.cart_quantity} шт.</span>
                    </p>
                    {cart.cart_quantity > 0 && (
                    <button 
                        className="btn__delete__each active"
                        onClick={clearCart}
                    >
                        очистить корзину
                    </button>
                    )}
                </div>
                
                <div className='product__cards__block'>
                    {cart.items.length > 0 ? cartCardsJsx : <p>Корзина пуста</p>}
                </div>
                
                {cart.items.length > 0 && (
                    <>
                    <input
                        type="text"
                        id="promo__code__fiekd"
                        className="promo__code"
                        placeholder="ВВЕДИТЕ ПРОМОКОД"
                    />
                    
                    <div className='cost__info'>
                        <p className='title__cost__info'>сумма заказа</p>
                        <div className='product__price__cart__wrapper'>
                        <p className='product__price__cart'>стоимость продуктов</p>
                        <img src='../img/line__dotted.svg' className='decorative__block' alt=""/>
                        <span>{totalSubtotal} ₽</span>
                        </div>
                        
                        {totalDiscount > 0 && (
                        <div className='total__sale__wrapper'>
                            <p className='total__sale'>скидка</p>
                            <img src='../img/accent__line__dotted.svg' className='accent__decorative__block' alt=""/>
                            <span>-{totalDiscount} ₽</span>
                        </div>
                        )}
                        
                        <div className='total__price__wrapper'>
                        <p className='total__price'>итого</p>
                        <span>{total} ₽</span>
                        </div>
                        
                        <button 
                        className='btn-filled-sidebar' 
                        onClick={handleCheckout}
                        >
                        Оформить заказ
                        </button>
                    </div>
                    </>
                )}
                </div>
                <ProductSwiper/>
            </div>
            
            {panelOpen && cart.items.length > 0 && (
                <div>
                <div 
                    className='product__quantity__management-930px' 
                    onClick={() => setPanelOpen(false)}
                ></div>
                <div className='button__container'>
                    <div className='top__block'>
                    <p>изменить количество</p>
                    {cart.items.map((item) => (
                        <ProductQuantityManagement item={item} key={item.id}/>
                    ))}
                    </div>
                    <div className='delete' onClick={clearCart}>
                    удалить
                    </div>
                </div>
                </div>
            )}
            </>
        )}
        </>
    );
}

// Обновленный компонент ShoppingCartCard
function ShoppingCartCard({ item, setPanelOpen, panelOpen }) {
    const isSmallScreen = useMediaQuery('(max-width: 930px)');
    const [showProductQuantity, setShowProductQuantity] = useState(false);

    return (
        <div 
        className='cart-item'
        onMouseEnter={() => setShowProductQuantity(true)}
        onMouseLeave={() => setShowProductQuantity(false)}
        >
        <picture className='cart-item__img-wrapper'>
            <img
            className="main__block__product__img"
            src={item.img_src}
            alt={item.name}
            />
        </picture>
        
        <div className='cart-item__content-description'>
            <div>
            <p className='item__ingredients'>{item.ingredients}</p>
            <p className='item__name'>{item.name}</p>
            </div>
            <p className='item__volume'>{item.volume} мл</p>
        </div>
        
        <div className='price__selected__product'>
            <div className='block__product__quantity__management'>
            {isSmallScreen ? (
                <img 
                src='/img/more__vertical.svg' 
                alt="Меню"
                onClick={() => setPanelOpen(!panelOpen)}
                />
            ) : showProductQuantity ? (
                <ProductQuantityManagement item={item}/>
            ) : null}
            </div>
            
            {item.sale > 0 ? (
            <div className='price-selected-discounted'>
                <p className='item-discount'>скидка {item.item_discount} ₽</p>
                <div className='price-wrapper'>
                <p className='item-subtotal'>{item.item_subtotal} ₽</p>
                <p className='item-total'>{item.item_total} ₽</p>
                </div>
            </div>
            ) : (
            <p className='price-selected'>{item.item_total} ₽</p>
            )}
        </div>
        </div>
    );
}

// Обновленный компонент ProductQuantityManagement
function ProductQuantityManagement({ item }){
    const { addToCart, removeOneItem, removeFromCart} = useContext(CartContext);
    const isSmallScreen = useMediaQuery('(max-width: 930px)');

    const handleAddItem = () => {
        // Подготавливаем данные в формате, который ожидает addToCart в CartContext
        const itemToAdd = {
        volumes: [item.volume], // Массив объемов
        volumePrices: [{       // Массив цен для объемов
            id: item.drink_volume_price_id,
            volume: item.volume,
        }],
        // Копируем остальные свойства item
        ...item
        };
        
        addToCart(itemToAdd, item.volume);
    };

    return (
        <>
        <div className='main__buttons'>
            {item.quantity > 1 ? (
            <img className="btn-remove__active" src='/img/remove__active.svg' alt="Уменьшить количество"
                onClick={() => removeOneItem(item)}
            />
            ) : (
            <img className="btn-remove__not__active" src='/img/remove__not__active.svg' alt="Уменьшить количество"/>
            )}
            
            <p>{item.quantity}</p>
            
            <img className="btn-add__item" src='/img/add__ring.svg' alt="Увеличить количество"
            onClick={() => handleAddItem()}
            />
        </div>
        
        {!isSmallScreen && (
            <img src='/img/close__square__light.svg' alt="Удалить"
            onClick={() => removeFromCart(item.id, item.drink_volume_price_id)}
            />
        )}
        </>
    );
}

// Объект для экспорта всех компонентов корзины
const CartPanels = {
    EmptyCart,
    ShoppingCart,
    ShoppingCartCard,
    ProductQuantityManagement
  };
  
export default CartPanels;