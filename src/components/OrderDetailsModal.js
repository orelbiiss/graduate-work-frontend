import React from 'react';
import '../css/OrderDetailsModal.css';

function OrderDetailsModal({ order, onClose }) {
  // Форматирование даты
  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Форматирование адреса магазина
  const formatStoreAddress = (store) => {
    if (!store) return '';
    return `${store.postal_code}, ${store.city}, ${store.street}`;
  };

  return (
    <div className="order-details-modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>МОИ ПОКУПКИ</h2>
        <div className="order-header">
          <span className="order-number">{order.id}</span>
          <span className="order-type">Покупка в магазине</span>
        </div>

        <div className="order-info-section">
          <h3>информация о заказе</h3>
          <div className="info-row">
            <span>дата покупки</span>
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="info-row">
            <span>способ оплаты</span>
            <span>{order.payment_method || 'картой'}</span>
          </div>
          {order.delivery_type === 'pickup' && order.store_address && (
            <div className="info-row">
              <span>адрес магазина</span>
              <span>{formatStoreAddress(order.store_address)}</span>
            </div>
          )}
          {order.delivery_type === 'pickup' && order.store_address && (
            <button className="store-details-btn">ПОДРОБНЕЕ О МАГАЗИНЕ</button>
          )}
        </div>

        <div className="order-summary-section">
          <h3>сумма заказа</h3>
          <div className="summary-row">
            <span>продукты</span>
            <span>{order.order_subtotal.toLocaleString('ru-RU')} ₽</span>
          </div>
          {order.order_discount > 0 && (
            <div className="summary-row discount">
              <span>СКИДКА</span>
              <span>– {order.order_discount.toLocaleString('ru-RU')} ₽</span>
            </div>
          )}
          <div className="summary-row total">
            <strong>итого</strong>
            <strong>{order.order_total.toLocaleString('ru-RU')} ₽</strong>
          </div>
        </div>

        <div className="order-items-section">
          <h3>состав заказа / {order.items.length} шт.</h3>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-header">
                <h4>{item.name}</h4>
                <span>{item.volume || item.weight}</span>
              </div>
              <div className="item-prices">
                <div className="original-price">
                  <span>{item.price_original.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="discount-price">
                  <span>– {item.discount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="final-price">
                  <span>{item.price_final.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
              {index < order.items.length - 1 && <hr className="item-divider" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;