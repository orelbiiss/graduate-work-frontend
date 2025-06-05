import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CheckOut.css';
import Header from '../components/Header';
import AddressList from '../components/AddressList';
import { useAddress } from '../contexts/AddressContext';
import { useUser } from '../contexts/UserContext';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext.js';
import DeliveryCalculator from '../components/DeliveryCalculator.js';
import { orderApi } from '../api/order.js';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useToast } from '../components/ui/ToastProvider.js';
import { method } from 'lodash';

// Ключ для хранения данных о доставке в localStorage
const STORAGE_KEY = 'deliveryData';

function Checkout() {
  return (
    <>
      <Header />
      <CheckoutMain />
    </>
  );
}

function CheckoutMain() {

    const navigate = useNavigate()

    const { setShowAddressForm, setEditingAddressId, setAddressQuery: setQuery,
        setAddressFormData: setAddress, setRegionCity, userAddresses, formatFullAddress
    } = useAddress();

    const defaultAddress = userAddresses.find(addr => addr.is_default);
    const address = formatFullAddress(defaultAddress);

    const [activeSection, setActiveSection] = useState(null);
    const [orderInfo, setOrderInfo] = useState({
        method: 'courier', // 'courier' или 'pickup'
        city: '',
        region: '',
        address: address.checkoutFormat,
        date: 'сегодня',
        apiDate: new Date().toISOString().split('T')[0],
        time: '',
        comment: '',
        price: 230,
        priceText: '230 ₽',
        discount: 0,
        selectedSlot: null,
        slots: [],
        storeAddressId: '',
        openingHours: '',
        phone: '',
    });
    const [isAddressListVisible, setIsAddressListVisible] = useState(false);
    const addressListRef = useRef(null); 
    const { user } = useUser();
    const { cart, clearCart } = useContext(CartContext);
    const { showToast } = useToast();
    
    const openAddressPanel = () => {
        setQuery('');
        setAddress({
            full_address: '',
            street: '',
            house: '',
            apartment: '',
            entrance: '',
            floor: '',
            intercom: '',
            is_default: false
        });
        setRegionCity({ region: '', city: '' });
        setShowAddressForm(true); 
        setEditingAddressId(false);
        setIsAddressListVisible(false);
    };

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    const toggleAddressList = () => {
        setIsAddressListVisible(!isAddressListVisible);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addressListRef.current && !addressListRef.current.contains(event.target)) {
                if (!event.target.classList.contains('edit-btn')) {
                    setIsAddressListVisible(false);
                }
            }
        };

        if (isAddressListVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddressListVisible]);

    // Обработчик изменения метода доставки
    const handleDeliveryMethodChange = (method) => {
        if (method === 'courier') {
            // При переключении на курьерскую доставку восстанавливаем дефолтный адрес
            setOrderInfo(prev => ({
                ...prev,
                method: 'courier',
                city: defaultAddress?.city || '',
                region: defaultAddress?.region || '',
                address: address.checkoutFormat || '',
                storeAddressId: defaultAddress?.id || '',
                openingHours: '',
                phone: ''
            }));
        } else {
            // При переключении на самовывоз сбрасываем данные адреса
            setOrderInfo(prev => ({
                ...prev,
                method: 'pickup',
                city: '',
                region: '',
                address: '',
                storeAddressId: '',
                openingHours: '',
                phone: '',
                price: 0
            }));
        }
    };

    // Сохранение данных в localStorage при изменении
    useEffect(() => {

        const dataToSave = {
            // Общие данные
            method: orderInfo.method,
            
            // Данные для курьерской доставки
            ...(orderInfo.method === 'courier' && {
              courierData: {
                method: orderInfo.method,
                deliveryAddress: orderInfo.address,
                deliveryTime: orderInfo.selectedSlot?.time_slot,
                deliveryDate: orderInfo.date,
                shippingPrice: orderInfo.price,
                shippingDiscount: orderInfo.discount
              }
            }),
            
            // Данные для самовывоза
            ...(orderInfo.method === 'pickup' && {
              pickupData: {
                storeAddressId: orderInfo.storeAddressId,
                storeAddress: orderInfo.address,
                openingHours: orderInfo.openingHours,
                phone: orderInfo.phone
              }
            })
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, [orderInfo]);

    // Генерация дат на неделю вперед
    const generateDates = useCallback(() => {
        const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
        const months = [
          'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
          'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            return {
                date: date.getDate(),
                day: days[date.getDay()],
                title: i === 0 ? 'сегодня' : i === 1 ? 'завтра' : `${date.getDate()} ${months[date.getMonth()]}`,
                fullDate: date,
                apiDate: date.toISOString().split('T')[0]
            };
        });
    }, []);

    // Загружаем слоты для сегодняшней даты при монтировании компонента
    useEffect(() => {
        const today = new Date();
        fetchDeliverySlots(today);
    }, []);

    // Функция для загрузки слотов доставки
    const fetchDeliverySlots = async (date) => {
        try {
            
            const response = await orderApi.getDeliverySlots(date);

            // Фильтруем только доступные слоты (где current_orders < max_orders)
            const availableSlots = response.filter(slot => 
                slot.status === 'available' || slot.status === 'limited'
            );

            // Сохраняем полученные слоты в состоянии
            setOrderInfo(prev => ({
                ...prev,
                slots: availableSlots || [],
                selectedSlot: availableSlots?.[0] || null,
                time: availableSlots?.[0]?.time_slot || ''
            }));
        } catch (err) {
            console.error('Error fetching delivery slots:', err);
        }
    };

    // Загружаем слоты при изменении выбранной даты
    useEffect(() => {
        if (orderInfo.date && orderInfo.method === 'courier') {
            // Преобразуем выбранную дату в объект Date для API
            let dateObj;
            if (orderInfo.date === 'сегодня') {
                dateObj = new Date();
            } else if (orderInfo.date === 'завтра') {
                dateObj = new Date();
                dateObj.setDate(dateObj.getDate() + 1);
            } else {
                // Для формата "19 мая" ищем соответствующую дату в сгенерированных датах
                const generatedDate = generateDates().find(d => d.title === orderInfo.date);
                dateObj = generatedDate ? generatedDate.fullDate : new Date();
            }
            
            fetchDeliverySlots(dateObj);
        }
    }, [orderInfo.date, orderInfo.method]);

    // Обработчик выбора даты
    const handleDateSelect = (day) => {
        setOrderInfo(prev => ({
            ...prev,
            time: '',
            date: day.title,
            apiDate: day.apiDate,
            selectedSlot: null
        }));
        fetchDeliverySlots(day.fullDate);
    };

    // Обработчик выбора временного слота
    const handleSlotSelect = (slot) => {
        setOrderInfo(prev => ({
            ...prev,
            selectedSlot: slot,
            time: slot.time_slot
        }));
    };

    // Обработчик выбора адреса
    const handleAddressSelect = (address) => {
        console.log(orderInfo.storeAddressId)
        setOrderInfo(prev => ({
            ...prev,
            storeAddressId: address.id,
            address: `${address.street}, ${address.house}`,
            openingHours: address.openingHours,
            phone: address.phone
        }));
    }

    const validateOrder = () => {
        if (cart.items.length === 0) {
            showToast('Ваша корзина пуста', 'error');
            return false;
        }

        if (orderInfo.method === 'courier') {
            if (!orderInfo.address) {
                showToast('Выберите адрес доставки', 'error');
                return false;
            }
            if (!orderInfo.selectedSlot) {
                showToast('Выберите время доставки', 'error');
                return false;
            }
        } else if (orderInfo.method === 'pickup') {
            if (!orderInfo.storeAddressId) {
                showToast('Выберите магазин для самовывоза', 'error');
                return false;
            }
        }

        return true;
    };

    const createOrder = async () => {

        if (!validateOrder()) return;

        try {
          const response = await orderApi.createOrder({
            deliveryType: orderInfo.method,
            deliveryDate: orderInfo.method === 'courier' ? orderInfo.apiDate : null,
            timeSlotId: orderInfo.method === 'courier' ? orderInfo.selectedSlot?.id : null,
            storeAddressId: orderInfo.method === 'pickup' ? orderInfo.storeAddressId : null,
            deliveryComment: orderInfo.comment,
            deliveryPrice: orderInfo.price
          });
      
          navigate(`/account`);
          localStorage.removeItem(STORAGE_KEY);
          clearCart();
          return response;
        } catch (err) {
          console.error('Order creation error:', err);
          throw err;
        } 
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createOrder();
    };

    return (
        <div className="checkout-container">
            <DeliveryCalculator 
                userAddress={defaultAddress ? defaultAddress.full_address : ''}
                cartTotal={cart.cart_total}
                onCalculated={(result) => {
                    setOrderInfo(prev => ({
                        ...prev,
                        price: result.price,
                        discount: result.discount,
                        priceText: result.text
                    }));
                }}
            />
            <form className="main-info" onSubmit={handleSubmit}>
                <div className="checkout-step-1" onClick={() => toggleSection(1)}>
                    <span>1 / 3</span>
                    <h2>адрес и способ доставки</h2>
                    {activeSection !== 1 && (
                        <div className="delivery-pre-show step-1">
                            <p className="delivery-method">
                                {orderInfo.method === 'courier' ? 'курьерская доставка' : 'самовывоз'}
                            </p>
                                {userAddresses.length !== 0 || orderInfo.method === 'pickup' ?
                                    <p className="delivery-address">
                                        {orderInfo.address}
                                    </p> : 'нет сохраненных адресов'
                                }
                                <div className="delivery-time-price">
                                    {orderInfo.method === 'courier' ? (
                                        userAddresses.length !== 0 ? (
                                        <>
                                            <p className="delivery-time">
                                            {orderInfo.date} / {orderInfo.selectedSlot?.time_slot || 'не выбрано'}
                                            </p>
                                            <p className="delivery-price">доставка {orderInfo.text}</p>
                                        </>
                                        ) : null
                                    ) : orderInfo.address === '' ? (
                                        'магазин не выбран'
                                    ) : (
                                        <>
                                        <div className="opening-hours">График работы:</div>
                                        <div className="opening-hours">{orderInfo.openingHours}</div>
                                        <div className="phone">{orderInfo.phone}</div>
                                        </>
                                    )}
                                </div>
                            <div className="product-thumbnails">
                                {cart.items.map((item, i) => (
                                    <div key={i} className="back-thumbnails">
                                        <img src={item.img_src} alt={item.name} />
                                    </div>
                                ))} 
                            </div>
                        </div>
                    )}
                </div>
                
                <div className={`checkout-content ${activeSection === 1 ? 'active' : ''}`}>

                    <div className="grid-row">
                        <div className="step-label">способ доставки</div>
                            <div className="step-value">
                                <label className="delivery-option">
                                    <input
                                    type="radio"
                                    name="delivery"
                                    checked={orderInfo.method === 'courier'}
                                    onChange={() => handleDeliveryMethodChange('courier')}
                                    />
                                    <span>курьер</span>
                                    <div className="option-details">
                                    <p>служба доставки</p>
                                    <p className="price">230 ₽</p>
                                    </div>
                                </label>
                                <label className="delivery-option">
                                    <input
                                    type="radio"
                                    name="delivery"
                                    checked={orderInfo.method === 'pickup'}
                                    onChange={() => handleDeliveryMethodChange('pickup')}
                                    />
                                    <span>самовывоз</span>
                                    <div className="option-details">
                                    <p>магазины, пвз</p>
                                    <p className="price">от 99 ₽</p>
                                    </div>
                                </label>
                        </div>
                    </div>
                    {orderInfo.method === 'pickup' && 
                        <div className="grid-row">
                            <div className="step-label">адреса магазинов</div>
                            <div className="step-value">
                                <AddressList 
                                    deliveryMethod="pickup"
                                    onSelectAddress={(address) => handleAddressSelect(address)}
                                />
                            </div>
                        </div>
                    }

                    {orderInfo.method === 'courier' && 
                    <>
                    <div className="grid-row">
                        <div className="step-label">адрес доставки</div>
                        <div className="step-value">
                            <p className='current-address'>{userAddresses.length === 0 ? 'нет сохраненных адресов' : orderInfo.address}</p>
                            { isAddressListVisible &&
                                <div 
                                    ref={addressListRef}
                                    className={`address-list-container ${isAddressListVisible ? 'visible' : ''}`}
                                >
                                    {isAddressListVisible && (
                                    <>
                                        <AddressList />
                                        <button 
                                            type="button" 
                                            onClick={openAddressPanel} 
                                            className="edit-btn"
                                        >
                                            добавить адрес
                                        </button>
                                    </>
                                    )}
                                </div>
                            }
                            <button  type="button" className="edit-btn" onClick={toggleAddressList}>
                                изменить
                            </button>
                        </div>
                    </div>

                    <div className="grid-row">
                        <div className="step-label">комментарий</div>
                        <div className="step-value">
                        <textarea
                            id='comment'
                            className='input__container'
                            placeholder="добавьте комментарий к заказу"
                            value={orderInfo.comment}
                            onChange={(e) => setOrderInfo({...orderInfo, comment: e.target.value})}
                        />
                        </div>
                    </div>  
    
                    <div className="grid-row">
                        <div className="step-label">дата и время доставки</div>
                        <div className="step-value">
                            <div className='data'>{orderInfo.date}</div>
                            <div className="product-thumbnails">
                                {cart.items.map((item, i) => (
                                    <div key={i} className="back-thumbnails">
                                        <img src={item.img_src} alt={item.name} />
                                    </div>
                                ))} 
                            </div>
                            <div className="date-selector">
                                {generateDates().map((day, index) => (
                                    <div 
                                        key={index}
                                        className={`date-option ${orderInfo.date === day.title ? 'selected' : ''}`}
                                        onClick={() => handleDateSelect(day)}
                                    >
                                        <span className="date-number">{day.date}</span>
                                        <span className="day-name">{day.day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="time-selector">
                                <Swiper
                                    slidesPerView="auto"
                                    spaceBetween={20}
                                >
                                    {orderInfo.slots.length > 0 ? (
                                    orderInfo.slots.map(slot => (
                                        <SwiperSlide key={slot.id} style={{ width: 'auto' }}>
                                            
                                        <div 
                                            className={`time-option ${orderInfo.selectedSlot?.id === slot.id ? 'selected' : ''}`}
                                            onClick={() => handleSlotSelect(slot)}
                                        >
                                            {slot.time_slot}
                                        </div>
                                        </SwiperSlide>
                                    ))
                                    ) : (
                                    <p>нет доступного времени доставки на выбранную дату</p>
                                    )}
                                </Swiper>
                            </div>
                            <div className="order-details-row">
                                <p className="order-detail-label">стоимость продуктов</p>
                                <img src='../img/line__dotted.svg' className='decorative__block' alt=""/>
                                <p className="order-detail-value">{cart.cart_total}₽</p>
                            </div>
                            <div className="order-details-row">
                                <p className="order-detail-label">доставка</p>
                                <img src='../img/line__dotted.svg' className='decorative__block' alt=""/>
                                <p className="order-detail-value">{userAddresses.length === 0 ? 'добавьте адрес доставки' : orderInfo.priceText}</p>
                            </div>
                        </div>
                    </div>
                    </>
                    }
                </div>

                <div className="checkout-step-2">
                    <span>2 / 3</span>
                    <h2>получатель</h2>
                    
                    <div className='delivery-pre-show step-2'>
                        <p>{`${user?.last_name} ${user?.first_name} ${user?.middle_name}`}</p>
                        <p>{`${user?.phone}`}</p>
                        <p>{`${user?.email}`}</p>
                    </div>
                </div>

                <div className="checkout-step-3" onClick={() => toggleSection(3)}>
                    <span>3 / 3</span>
                    <h2>способ оплаты</h2>
                
                    {activeSection !== 3 && (   
                        <div className="delivery-pre-show step-3">
                            <span>при получении (наличными или картой)</span>
                        </div>
                    )}
                </div>
                <div className={`checkout-content ${activeSection === 3 ? 'active' : ''}`}>
                    <div className="payment-options">
                        <label className="payment-option">
                        <input type="radio" name="payment" defaultChecked />
                        <span>При получении (наличными или картой)</span>
                        </label>
                    </div>
                </div>
    
                <button type='submit' 
                    className="btn-filled-sidebar" 
                >
                    Оформить заказ
                </button>
            </form>
                
            <div className="order-summary">
                <h3>Сумма заказа</h3>
                <div className="summary-details">
                    <div className="order-details-row">
                        <p className="order-detail-label">стоимость продуктов</p>
                        <img src='../img/line__dotted.svg' className='decorative__block' alt=""/>
                        <p className="order-detail-value">{cart.cart_subtotal}₽</p>
                    </div>
                    { orderInfo.price !== 0 && 
                        <div className="order-details-row">
                            <p className="order-detail-label">доставка</p>
                            <img src='../img/line__dotted.svg' className='decorative__block' alt=""/>
                            <p className="order-detail-value">{orderInfo.priceText}</p>
                        </div>
                    }
                    <div className="order-details-row">
                        {cart.cart_discount > 0 && (
                            <>
                            <p className='check-sale'>скидка</p>
                            <img src='../img/accent__line__dotted.svg' className='accent__decorative__block' alt=""/>
                            <p className='check-sale order-detail-value'>– {cart.cart_discount}₽</p>
                            </>
                        )}
                        </div>
                    </div>
                <div className="total">
                <strong>итого</strong>
                <strong>{cart.cart_total + orderInfo.price}₽</strong>
                </div>
                <button type='submit' 
                    className="btn-filled-sidebar" 
                >
                    Оформить заказ
                </button>
            </div>
        </div>
    );
}

export default Checkout;