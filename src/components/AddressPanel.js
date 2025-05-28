import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { useAddress } from '../contexts/AddressContext';
import '../css/AddressSelection.css';
import { useForm } from '../hooks/useForm';


function AddressPanel({ onClose }) {
    const { addressFormData, setAddressFormData, storeAddressFormData, setStoreAddressFormData,
            addressQuery, setAddressQuery, addressSuggestions, setAddressSuggestions, 
            regionCity, setRegionCity, addressFromSuggestions, setAddressFromSuggestions, 
            isEditing, parseOpeningHours, setWorkingHours, originalAddress, DEFAULT_WORKING_HOURS, 
            addressType, addressCache, WEEK_DAYS, handleSaveAddress, workingHours, validationErrors, 
            setValidationErrors, setTouchedFields, formatFullAddress, resetForm
    } = useAddress();
    
    // Состояние для времени работы магазина
    const [showWorkingHours, setShowWorkingHours] = useState(false);
    const { handlePhoneChange } = useForm();

    // Инициализация времени работы при редактировании
    useEffect(() => {
        if (addressType === 'store' && isEditing && originalAddress?.opening_hours) {
            try {
                const parsedHours = parseOpeningHours(originalAddress.opening_hours);
                setWorkingHours(parsedHours);
            } catch {
                setWorkingHours(DEFAULT_WORKING_HOURS);
            }
        }
    }, [addressType, isEditing, originalAddress]);

    // Запрос подсказок адресов
    const fetchAddressSuggestions = useCallback(
        debounce(async (query) => {
            if (query.length < 3) return;

            if (addressCache.current[query]) {
                setAddressSuggestions(addressCache.current[query]);
                return;
            }
            
            const url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
            const token = process.env.REACT_APP_DADATA_SECRET_KEY;
            
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token " + token
                },
                body: JSON.stringify({
                    query: query,
                    count: 10,
                    from_bound: { value: "street" }, 
                    to_bound: { value: "house" },
                    restrict_value: true,
                    locations: [
                        {region: "Ленинградская"}, 
                        {region: "Санкт-Петербург"},
                    ]
                }),
            };

            try {
                const response = await fetch(url, options);
                const result = await response.json();
                const fetchedSuggestions = result.suggestions || [];

                setAddressSuggestions(fetchedSuggestions);
                addressCache.current[query] = fetchedSuggestions;
            } catch (error) {
                console.error("Ошибка при получении подсказок:", error);
            } 
        }, 200),
        []
    );

    useEffect(() => {
        return () => {
            fetchAddressSuggestions.cancel();
        };
    }, [fetchAddressSuggestions]);

    // Обработчик выбора адреса из подсказок
    const handleSelectAddress = (suggestion) => {
        const data = suggestion.data;
        // Формируем временный объект адреса для форматирования
        const formattedAddress = formatFullAddress({
            full_address: suggestion.unrestricted_value,
            street: data.street_with_type || '',
            house: `${data.house_type || ''} ${data.house || ''} ${data.block_type || ''} ${data.block || ''}`.trim(),
        });
        
        const updateFn = addressType === 'user' ? setAddressFormData : setStoreAddressFormData;
        updateFn(prev => ({
            ...prev,
            full_address: suggestion.unrestricted_value,
            street: data.street_with_type || '',
            house: `${data.house_type || ''} ${data.house || ''} ${data.block_type || ''} ${data.block || ''}`.trim(),
        }));

        setRegionCity({ displayRegionCity: formattedAddress.cityRegion });
        setAddressSuggestions([]);
        setAddressQuery(formattedAddress.streetHouse);
        setAddressFromSuggestions(true);
    };

    // Обработчик изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fullAddress') {
            setAddressQuery(value);
            fetchAddressSuggestions(value);
            setAddressFromSuggestions(false);
            return;
        }

        if (addressType === 'user') {
            setAddressFormData({ ...addressFormData, [name]: value });
        } else {
            setStoreAddressFormData({ ...storeAddressFormData, [name]: value });
        }
    };

    // Обработчик изменения времени работы
    const handleWorkingHoursChange = (dayId, field, value) => {
        setWorkingHours(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                [field]: value
            }
        }));
    };

    const handleBlur = useCallback((fieldName) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        
        // Сбрасываем ошибку, если поле заполнено
        if (addressType === 'user') {
          if (fieldName === 'street' && addressFormData.street) {
            setValidationErrors(prev => ({ ...prev, street: false }));
          }
          if (fieldName === 'house' && addressFormData.house) {
            setValidationErrors(prev => ({ ...prev, house: false }));
          }
          if (fieldName === 'apartment' && addressFormData.apartment) {
            setValidationErrors(prev => ({ ...prev, apartment: false }));
          }
        } else {
          if (fieldName === 'phone' && storeAddressFormData.phone && /^\+7\d{10}$/.test(storeAddressFormData.phone)) {
            setValidationErrors(prev => ({ ...prev, phone: false }));
          }
        }
    }, [addressType, addressFormData, storeAddressFormData]);

    // Обработчик клика вне области подсказок
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (addressSuggestions.length > 0 && !e.target.closest('.address-input-container')) {
                setAddressSuggestions([]);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [addressSuggestions]);

    const shouldShowError = !isEditing && !addressFromSuggestions && addressQuery.length > 0;


    // Рендеринг формы пользовательского адреса
    const renderUserAddressForm = () => (
        <>
            <p className='address-form-title'>адрес доставки</p>
            <RegionCityDisplay displayRegionCity={regionCity.displayRegionCity} />
            
            <AddressInputWithSuggestions
                addressQuery={addressQuery}
                handleChange={handleChange}
                onBlur={() => {
                    handleBlur('street');
                    handleBlur('house');
                }}
                handleSelectAddress={handleSelectAddress}
                isEditing={isEditing}
                validationErrors={validationErrors}
                addressSuggestions={addressSuggestions}
                shouldShowError={shouldShowError}
            />
            <div className="form-row">
                <div className='input-container'>
                    <FloatAnimateInput
                        id="apartment"
                        name="apartment"
                        value={addressFormData.apartment}
                        onChange={handleChange}
                        onBlur={() => handleBlur('apartment')}
                        label="квартира/офис"
                        error={validationErrors.apartment}
                        errorHint="введите номер квартиры"
                    />
                </div>
                <FloatAnimateInput
                    id="intercom"
                    name="intercom"
                    value={addressFormData.intercom}
                    onChange={handleChange}
                    label="домофон"
                />
            </div>

            <div className="form-row">
                <FloatAnimateInput
                    id="entrance"
                    name="entrance"
                    value={addressFormData.entrance}
                    onChange={handleChange}
                    label="подьезд"
                />
                <FloatAnimateInput
                    id="floor"
                    name="floor"
                    value={addressFormData.floor}
                    onChange={handleChange}
                    label="этаж"
                />
            </div>
            <div className="form-checkbox">
                <input
                    id="checkbox-input"
                    type="checkbox"
                    className="checkbox-input"
                    checked={addressFormData.is_default}
                    onChange={(e) => handleChange({
                        target: {
                            name: 'is_default',
                            value: e.target.checked
                        }
                    })}
                />
                <label htmlFor="checkbox-input" className="checkbox-label">
                    сделать основным адресом
                </label>
            </div>
        </>
    );

    // Рендеринг формы адреса магазина
    const renderStoreAddressForm = () => (
        <>
            <p className='address-form-title'>адрес магазина</p>
            <RegionCityDisplay displayRegionCity={regionCity.displayRegionCity} />

            <AddressInputWithSuggestions
                addressQuery={addressQuery}
                handleChange={handleChange}
                onBlur={() => {
                    handleBlur('street');
                    handleBlur('house');
                }}
                handleSelectAddress={handleSelectAddress}
                isEditing={isEditing}
                validationErrors={validationErrors}
                addressSuggestions={addressSuggestions}
                shouldShowError={shouldShowError}
            />
            
            <div className="form-row">
                <FloatAnimateInput
                    id="floor"
                    name="floor"
                    value={storeAddressFormData.floor}
                    onChange={handleChange}
                    label="этаж"
                />
                <div className='input-container'>
                    <FloatAnimateInput
                        id="phone-address-panel"
                        name="phone"
                        value={storeAddressFormData.phone}
                        onChange={handlePhoneChange}
                        onBlur={() => handleBlur('phone')}
                        label="телефон магазина"
                        error={validationErrors.phone}
                        errorHint="введите корректный телефон (+7XXXXXXXXXX)"
                    />
                </div>
            </div>

            <div className="form-checkbox">
                <input
                    id="checkbox-input"
                    type="checkbox"
                    className="checkbox-input"
                    checked={!storeAddressFormData.is_active}
                    onChange={(e) => handleChange({
                        target: {
                            name: 'is_active',
                            value: !e.target.checked
                        }
                    })}
                />
                <label htmlFor="checkbox-input" className="checkbox-label">
                    магазин временно не работает
                </label>
            </div>
            
            
            <div className="working-hours-section">
                <button 
                    type="button" 
                    className="working-hours-toggle"
                    onClick={() => setShowWorkingHours(!showWorkingHours)}
                >
                    {showWorkingHours ? 'скрыть время работы' : 'настроить время работы'}
                </button>
                
                {showWorkingHours && (
                    <div className="working-hours-grid">
                        {WEEK_DAYS.map(day => (
                            <div key={day.id} className="working-hours-day">
                                <label>
                                    <input
                                        type="checkbox"
                                        className='custom-checkbox'
                                        checked={workingHours[day.id].isWorking}
                                        onChange={(e) => handleWorkingHoursChange(
                                            day.id, 
                                            'isWorking', 
                                            e.target.checked
                                        )}
                                    />
                                    {day.name}
                                </label>
                                
                                {workingHours[day.id].isWorking ? (
                                    <div className="time-inputs">
                                        <input
                                            type="time"
                                            value={workingHours[day.id].from}
                                            onChange={(e) => handleWorkingHoursChange(
                                                day.id, 
                                                'from', 
                                                e.target.value
                                            )}
                                        />
                                        <span>—</span>
                                        <input
                                            type="time"
                                            value={workingHours[day.id].to}
                                            onChange={(e) => handleWorkingHoursChange(
                                                day.id, 
                                                'to', 
                                                e.target.value
                                            )}
                                        />
                                    </div>
                                ) : (<span className="day-off">Выходной</span>)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );

    return (
        <form className='address-form' onSubmit={handleSaveAddress}>
            {addressType === 'user' ? renderUserAddressForm() : renderStoreAddressForm()}
            
            <button type='submit' className='btn-filled-sidebar'>
                {isEditing ? 'Обновить' : 'Сохранить'}
            </button>
            <p className='back-to-btn' onClick={onClose}>← вернуться назад</p>
        </form>
    );
}

// Общий компонент для отображения региона/города
const RegionCityDisplay = ({ displayRegionCity }) => (
    displayRegionCity && (
        <div className="region-city-display">
            <p>{displayRegionCity}</p>
        </div>
    )
);

// Общий компонент для ввода адреса с подсказками
const AddressInputWithSuggestions = ({ addressQuery, handleChange, handleSelectAddress,
                                       isEditing, validationErrors, addressSuggestions,
                                       shouldShowError, onBlur
}) => (
    <div className={`address-input-container ${isEditing ? 'disabled' : ''}`}>
        <div className="float-animate">
            <input
                type="text"
                id='fullAddress'
                name="fullAddress"
                value={addressQuery}
                onBlur={onBlur}
                onChange={handleChange}
                className={`float-animate-input ${isEditing ? 'disabled' : ''} 
                ${validationErrors.street ? 'error' : ''} ${validationErrors.house ? 'error' : ''}`}
                placeholder=" "
                disabled={isEditing}
            />
            <label htmlFor="fullAddress" className={`float-animate-label ${validationErrors.street ? 'error' : ''}
                                        ${validationErrors.house ? 'error' : ''}`}>
                улица и дом
            </label>
        </div>
        {validationErrors.street && !validationErrors.house && (
            <p className="error-hint">введите название улицы</p>
        )}
        {validationErrors.house && !validationErrors.street && (
            <p className="error-hint">введите номер дома</p>
        )}
        {validationErrors.house && validationErrors.street && (
            <p className="error-hint">введите адрес</p>
        )}
        
        {addressSuggestions.length > 0 && (
            <ul className={`suggestions-list ${!addressSuggestions.length ? 'fade-out' : ''}`}>
                {addressSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleSelectAddress(suggestion)}>
                        {suggestion.value}
                    </li>
                ))}
            </ul>
        )}
        {shouldShowError && (
            <p className="error-message">Пожалуйста, выберите адрес из подсказок</p>
        )}
    </div>
);

// Компонент для поля с плавающей меткой
const FloatAnimateInput = ({ id, name, value, onChange, label, error, errorHint, onBlur,
                                type = "text", placeholder = " "
}) => (
    <>
    <div className="float-animate">
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`float-animate-input ${error ? 'error' : ''}`}
            placeholder={placeholder}
        />
        <label htmlFor={id} className={`float-animate-label ${error ? 'error' : ''}`}>
            {label}
        </label>
    </div>
    {error && errorHint && (
        <p className="error-hint">{errorHint}</p>
    )}
    </>
);

export default AddressPanel;