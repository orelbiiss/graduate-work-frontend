import React, { useState } from 'react';
import { useAddress } from '../contexts/AddressContext';
import ConfirmationModal from './ui/ConfirmationModal';

function AddressList({ deliveryMethod, onSelectAddress  }) {
    const { userAddresses, storeAddresses, addressType, showConfirmation, addressToDelete, 
            handleDeleteAddress, handleSetDefaultAddress, setShowConfirmation, 
            setAddressToDelete, handleEditAddress, formatFullAddress
    } = useAddress();

    const [hoveredCard, setHoveredCard] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const updateBlock = (addressId) => {
        return(
            <div className='update-block'>
                <svg onClick={() => handleEditAddress(addressId)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.69403 8.66988L13.6109 4.75306C14.093 4.27088 14.747 4 15.4289 4C16.8489 4 18 5.15112 18 6.5711C18 7.253 17.7291 7.90697 17.2469 8.38914L13.3301 12.306C11.6273 14.0088 9.49375 15.2168 7.15752 15.8008L6.40049 15.9901C6.1646 16.0491 5.95094 15.8354 6.00991 15.5995L6.19917 14.8425C6.78322 12.5063 7.99123 10.3727 9.69403 8.66988Z" fill="white"/>
                    <path d="M16.5 9.13608C14.682 9.7421 12.2579 7.31804 12.8639 5.5M13.6109 4.75306L9.69403 8.66988C7.99123 10.3727 6.78322 12.5063 6.19917 14.8425L6.00991 15.5995C5.95094 15.8354 6.1646 16.0491 6.40049 15.9901L7.15752 15.8008C9.49375 15.2168 11.6273 14.0088 13.3301 12.306L17.2469 8.38914C17.7291 7.90697 18 7.253 18 6.5711C18 5.15112 16.8489 4 15.4289 4C14.747 4 14.093 4.27088 13.6109 4.75306Z" stroke="#2B1B1B" strokeWidth="1.05"/>
                    <path d="M19 20H5" stroke="#2B1B1B" strokeWidth="1.05" strokeLinejoin="round"/>
                </svg>
                <svg onClick={() => {
                    setShowConfirmation(true);
                    setAddressToDelete(addressId);
                }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="#2B1B1B" strokeLinejoin="square"/>
                    <path d="M6 6L18 18" stroke="#2B1B1B" strokeLinejoin="square"/>
                </svg>
            </div>
        );
    };

    const handleAddressSelect = (address) => {
        setSelectedAddressId(address.id);
        onSelectAddress && onSelectAddress(address);
    };

    // Функция рендеринга карточки адреса (разные шаблоны для разных типов)
    const renderAddressCard = (address) => {

        const formattedAddress = formatFullAddress(address);

        // 1. Карточка магазина для выбора при самовывозе (с радио-кнопкой)
        if (deliveryMethod === 'pickup'){
             
            return (
                <div key={address.id} className='address-card'>
                    <div className='address-item' onClick={() => handleAddressSelect({
                        id: address.id, 
                        street: address.street, 
                        house: address.house,
                        openingHours: formattedAddress.openingHours,
                        phone: formattedAddress.phone
                    })}
                >
                        <div className="form-checkbox">
                            <input
                                id={`checkbox-${address.id}`}
                                type="checkbox"
                                className="checkbox-input"
                                checked={selectedAddressId === address.id}
                                onChange={() => handleAddressSelect(address.id)}
                            />
                            <label htmlFor={`checkbox-${address.id}`} className="checkbox-label">
                            </label>
                        </div>
                        <div className='address-info'>
                            <div className="street-house">{formattedAddress.streetHouse}</div>
                                <div className="opening-hours">График работы: {formattedAddress.openingHours}</div>
                                <div className="phone">{formattedAddress.phone}</div>
                        </div>
                </div>
                </div>
            );
        } 

        // 2. Карточка пользовательского адреса (для раздела адресов пользователя)
        if (addressType === 'user') {
            
            return (
                <div key={address.id} className='address-card'
                    onMouseEnter={() => setHoveredCard(address.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <div className='address-item' onClick={() => handleSetDefaultAddress(address.id)}>
                        <div className="form-checkbox">
                            <input
                                id={`checkbox-${address.id}`}
                                type="checkbox"
                                className="checkbox-input"
                                checked={address.is_default}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => {}}
                            />
                            <label htmlFor={`checkbox-${address.id}`} className="checkbox-label">
                            </label>
                        </div>
                        <div className='address-info'>
                            <div className="street-house">{formattedAddress.streetHouse}</div>
                            <div className="city-region">{formattedAddress.cityRegion}</div>
                        </div>
                    </div>
                    {hoveredCard === address.id && (
                        updateBlock(address.id)
                    )}
                </div>
            );
        } 

        // 3. Карточка магазина для админки (без радио-кнопки, с кнопками редактирования)
        return (
            <div key={address.id} className='address-card'
                onMouseEnter={() => setHoveredCard(address.id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div className='address-item'>
                    <div className='address-info'>
                        {!address.is_active && (
                            <div className="store-inactive-label">
                                магазин временно не работает
                            </div>
                        )}
                        <div className="street-house">{formattedAddress.streetHouse}</div>
                        <div className="opening-hours">График работы:</div>
                        <div className="opening-hours">{formattedAddress.openingHours}</div>
                        <div className="phone">{formattedAddress.phone}</div>
                    </div>
                </div>
                {hoveredCard === address.id && (
                    updateBlock(address.id)
                )}
            </div>
        );
    };

    // Определяем, какие адреса показывать
    const currentAddresses = deliveryMethod === 'pickup' 
        ? storeAddresses.filter(store => store.is_active) // Для самовывоза - только активные магазины
        : addressType === 'user' 
            ? userAddresses // Для личного кабинета - адреса пользователя
            : storeAddresses; // Для админки - все магазины

    const noAddressesText = addressType === 'user' 
        ? 'У вас пока нет сохраненных адресов' 
        : 'Нет доступных адресов магазинов';

    return (
        <>
            <div className='address-cards'>
                {currentAddresses.length > 0 ? (
                    currentAddresses.map(renderAddressCard)
                ) : (
                    <div className="no-addresses">
                        {noAddressesText}
                    </div>
                )}
            </div>

            {showConfirmation && (
                <ConfirmationModal
                    show={showConfirmation}
                    address={`${currentAddresses.find(a => a.id === addressToDelete)?.street}, 
                              ${currentAddresses.find(a => a.id === addressToDelete)?.house}`}
                    onCancel={() => setShowConfirmation(false)}
                    onConfirm={() => handleDeleteAddress(addressToDelete)}
                    cancelText='нет, оставить'
                    confirmText='удалить'
                    title='удалить адрес?'
                    description={
                        <p>
                            Отменить удаление адреса <br /> 
                            {`${currentAddresses.find(a => a.id === addressToDelete)?.street}, 
                              ${currentAddresses.find(a => a.id === addressToDelete)?.house}` }
                            <br />
                            будет невозможно
                        </p>
                    }
                    isAddressDelete={true}
                />
            )}
        </>
    );
}

export default AddressList;