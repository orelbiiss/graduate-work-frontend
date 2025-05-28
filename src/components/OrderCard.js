import '../css/OrderCard.css';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from './ui/ToastProvider';
import ConfirmationModal from './ui/ConfirmationModal';
import { useNavigate } from 'react-router';
import { useAddress } from '../contexts/AddressContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';

function OrderCard({ order, onStatusChange }) {
    
    const [currentStatus, setCurrentStatus] = useState(order.status); 
    const [showConfirmation, setShowConfirmation] = useState(false); 
    const [selectedStatus, setSelectedStatus] = useState(null); 
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();
    const { user } = useUser(); 
    const { showToast } = useToast();
    const { formatFullAddress } = useAddress();

    // Обновляем статус при изменении пропса order
    useEffect(() => {
        setCurrentStatus(order?.status);
    }, [order?.status]);

    const getStatusInfo = (status) => {
        switch(status) {
            case 'processing':
                return {
                    status: 'в сборке',
                    className: 'order-status-building'
                };
            case 'delivering':
                return {
                    status: 'в пути',
                    className: 'order-status-shipping'
                };
            case 'completed':
                return {
                    status: 'выполнен',
                    className: 'order-status-completed'
                };
            case 'cancelled':
                return {
                    status: 'отменен',
                    className: 'order-status-cancelled'
                };
            default: // 'new' и другие случаи
                return {
                    status: 'новый',
                    className: 'order-status-new'
                };
        }
    };

    const currentStatusInfo = getStatusInfo(currentStatus);
    const newStatusInfo = getStatusInfo(selectedStatus);

    // Обработка клика по статусу
    const handleStatusClick = (newStatus) => {
        setSelectedStatus(newStatus);
        setShowConfirmation(true); // Показать окно подтверждения
    };

    // Подтверждение изменения статуса
    const confirmStatusChange = async () => {
        try {
            setCurrentStatus(selectedStatus); // Обновляем статус на фронтенде
            setShowConfirmation(false); // Закрываем модальное окно
            onStatusChange(order.id, selectedStatus); // Обновляем статус на сервере
            showToast(`Статус заказа №${order.id} изменен на "${newStatusInfo.status}"`, 'success');
        } catch (err) {
            console.error('Ошибка обновления статуса:', err);
            showToast('Ошибка обновления статуса', 'error');
        }
    };

    // Отмена изменения статуса
    const cancelStatusChange = () => {
        setShowConfirmation(false);
        setSelectedStatus(null);
    };

    const handleCardClick = () => {
        navigate('/account/edit')
        setShowDetails(true);
    };


    return (
        <>
        <div className="order-card">
            <div className="order-info" onClick={handleCardClick}>
                <div className={currentStatusInfo.className}>{currentStatusInfo.status}</div>
                <p className="order-number">{order.id}</p>
            </div>
            <div className="order-details" onClick={handleCardClick}>
                <p className='order-date'>{new Date(order.created_at).toLocaleDateString('ru-RU')}</p>
                <div className="delivery-info">
                    <p className="delivery-label">
                        {order.delivery_type === 'pickup' ? 'самовывоз:' : 'доставка:'}
                    </p>
                    <p className="delivery-address">
                        {order.delivery_type === 'pickup' && order.store_address ? (
                            <>
                                 {formatFullAddress(order.store_address).streetHouse}
                                {order.store_address.opening_hours && (
                                    <span className="opening-hours">, Режим работы: {order.store_address.opening_hours}</span>
                                )}
                            </>
                        ) : order.address ? (
                            formatFullAddress(order.address).streetHouse
                        ) : (
                            'Адрес не указан'
                        )}
                    </p>
                </div>
                <div className="product-thumbnails">
                    <Swiper
                        className='product-thumbnails-swiper'
                        slidesPerView="auto"
                        spaceBetween={20}
                    >
                        {order.items.map((item, i) => (
                            <SwiperSlide key={item.id} style={{ width: 'auto' }}>     
                                <div key={i} className="back-thumbnails">
                                    <img src={item.img_src} alt={item.name} />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                <div className="order-summary-card">
                    <div className="sum-label">сумма</div>
                    <div className="order-sum">{order.order_total}</div>
                </div>
            </div>
            {user.role === 'admin' && (
                <div className='status-navigation'>
                    <p className='navigation-status-building' onClick={() => handleStatusClick('processing')}>в сборке</p>
                    <p className='navigation-status-shipping' onClick={() => handleStatusClick('delivering')}>в пути</p>
                    <p className='navigation-status-completed' onClick={() => handleStatusClick('completed')}>выполнен</p>
                </div>
            )}
        </div>

        {showConfirmation && (
        <ConfirmationModal
            show={showConfirmation}
            orderId={order.id}
            currentStatus={currentStatusInfo.status}
            newStatus={newStatusInfo.status}
            onCancel={cancelStatusChange}
            onConfirm={confirmStatusChange}
            cancelText = 'отмена'
            confirmText = 'подтвердить'
            title = 'Подтвердите изменение статуса заказа'
            isAdminPanel = {true}
        />
        )}
        </>
    );
}

export default OrderCard;
