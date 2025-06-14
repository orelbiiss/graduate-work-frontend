import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import '../css/OrderDetailsPage.css'; // Создадим новый CSS файл
import { Button } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useAddress } from '../contexts/AddressContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DeliveryDocument } from '../utils/CourierPDF';
import { useUser } from '../contexts/UserContext';

const OrderDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { formatFullAddress } = useAddress();
    const { order } = location.state || {};
    const { user } = useUser();

    if (!order) {
        return (
            <div className="order-details-container">
                <div className="order-not-found">
                    <h2>Заказ не найден</h2>
                    <Button type="primary" onClick={() => navigate(-1)}>
                        Вернуться назад
                    </Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    const getStatusInfo = (status) => {
        switch(status) {
            case 'processing': return { text: 'в сборке', className: 'status-building' };
            case 'delivering': return { text: 'в пути', className: 'status-shipping' };
            case 'completed': return { text: 'выполнен', className: 'status-completed' };
            case 'cancelled': return { text: 'отменен', className: 'status-cancelled' };
            default: return { text: 'новый', className: 'status-new' };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="order-details-container">
            <div className="order-header">
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    Назад
                </Button>
                
                <div className="order-title">
                    <h1>Заказ №{order.id}</h1>
                    <span className={`status-badge ${statusInfo.className}-detail`}>
                        {statusInfo.text}
                    </span>
                </div>
                { user?.role === 'admin' ? 
                    <Button 
                        type="text" 
                        icon={<PrinterOutlined />} 
                        className="print-button"
                        >
                        <PDFDownloadLink 
                            document={<DeliveryDocument order={order} />}
                            fileName={`доставка_${order.id}.pdf`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                            {({ loading }) => (loading ? 'Генерация...' : 'Печать')}
                        </PDFDownloadLink>
                    </Button> : <div></div>
                }                  
            </div>

            <div className="order-content">
                <div className="order-section">
                    <h2>информация о заказе</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">дата создания:</span>
                            <span className="info-value">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">способ получения:</span>
                            <span className="info-value">
                                {order.delivery_type === 'pickup' ? 'Самовывоз' : 'Доставка'}
                            </span>
                        </div>
                        {order.delivery_date && (
                            <div className="info-item">
                                <span className="info-label">дата доставки:</span>
                                <span className="info-value">
                                    {formatDate(order.delivery_date)} {order.delivery_time && `, ${order.delivery_time}`}
                                </span>
                            </div>
                        )}
                        <div className="info-item">
                            <span className="info-label">телефон:</span>
                            <span className="info-value">{order.customer_phone}</span>
                        </div>
                    </div>
                </div>

                <div className="order-section">
                    <h2>адрес {order.delivery_type === 'pickup' ? 'магазина' : 'доставки'}</h2>
                    <div className="address-card-detail">
                        <p className="comment-label">получатель:</p>
                        <p className="customer-name">{order.customer_name}</p>
                        <p className="address-text">
                            <p className="comment-label">адрес:</p>
                            {order.delivery_type === 'pickup' && order.store_address 
                                ? formatFullAddress(order.store_address).fullAddress
                                : order.address 
                                    ? order.full_address
                                    : 'Адрес не указан'}
                        </p>
                        {order.delivery_comment && (
                            <div className="delivery-comment">
                                <span className="comment-label">комментарий курьеру:</span>
                                <p>{order.delivery_comment}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="order-section">
                    <h2>состав заказа</h2>
                    <div className="products-list">
                        <Swiper
                            slidesPerView="auto"
                            spaceBetween={16}
                            className="products-swiper"
                        >
                            {order.items.map((item, index) => (
                                <SwiperSlide key={index} style={{ width: 'auto' }}>
                                    <div className="product-thumbnail">
                                        <img src={item.img_src} alt={item.name} />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <div className="products-details">
                            <div className="product-item">
                                <div className="products-item-container title-details">
                                    <div className="product-title">
                                        <span className="product-title">продукт</span>
                                    </div>
                                    <div className="product-title quantity">
                                        <span className="product-title">количество</span>
                                    </div>
                                    <div className="product-tile price-title">
                                        <span className="product-title">цена</span>
                                    </div>
                                </div>  
                            </div>
                            {order.items.map((item, index) => (
                                <div key={index} className="product-item">
                                    <div className="products-item-container">
                                        <div className="product-info">
                                            <h3 className="product-name-details">{item.name}</h3>
                                            <p className="product-volume">{item.volume} мл</p>
                                        </div>
                                        <div className="product-quantity-price">
                                            <span className="product-quantity">{item.quantity} шт.</span>
                                        </div>
                                        {item.item_discount > 0 ? (
                                            <div className='price-selected-discounted'>
                                                <p className='item-discount'>скидка {item.item_discount * item.quantity} ₽</p>
                                                <div className='price-wrapper'>
                                                    <p className='item-total'>{item.item_total * item.quantity} ₽</p>
                                                </div>
                                            </div>
                                            ) : (
                                            <p className='price-selected'>{item.item_total * item.quantity} ₽</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="order-section order-summary">
                    <h2>итого</h2>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="summary-label">Сумма заказа:</span>
                            <span className="summary-value">{order.order_subtotal} ₽</span>
                        </div>
                        {order.delivery_price > 0 && (
                            <div className="summary-item">
                                <span className="summary-label">Доставка:</span>
                                <span className="summary-value">{order.delivery_price} ₽</span>
                            </div>
                        )}
                        {order.order_discount > 0 && (
                            <div className="summary-item discount">
                                <span className="summary-label">Скидка:</span>
                                <span className="summary-value">-{order.order_discount} ₽</span>
                            </div>
                        )}
                        <div className="summary-item total">
                            <span className="summary-label">Общая сумма:</span>
                            <span className="summary-value">{order.order_total} ₽</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;