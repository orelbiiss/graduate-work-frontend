// src/contexts/AddressContext.js
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { addressApi } from '../api/address';
import { useToast } from '../components/ui/ToastProvider';
import { saveAddressToLocalStorage, getAddressFromLocalStorage } from '../utils/localStorageUtils';
import { useUser } from './UserContext';

// Конфигурация констант
const WEEK_DAYS = [
    { id: 'mon', name: 'Понедельник', short: 'Пн' },
    { id: 'tue', name: 'Вторник', short: 'Вт' },
    { id: 'wed', name: 'Среда', short: 'Ср' },
    { id: 'thu', name: 'Четверг', short: 'Чт' },
    { id: 'fri', name: 'Пятница', short: 'Пт' },
    { id: 'sat', name: 'Суббота', short: 'Сб' },
    { id: 'sun', name: 'Воскресенье', short: 'Вс' }
];

const DEFAULT_WORKING_HOURS = WEEK_DAYS.reduce((acc, day) => ({
    ...acc,
    [day.id]: { from: '10:00', to: '19:00', isWorking: true }
    }), {});

    const INITIAL_USER_ADDRESS_FORM = {
    full_address: '', street: '', house: '', apartment: '', 
    entrance: '', floor: '', intercom: '', is_default: false
    };

    const INITIAL_STORE_ADDRESS_FORM = {
    full_address: '', street: '', house: '', floor: '', is_active: true, 
    opening_hours: '', phone: ''
    };

    const AddressContext = createContext();

    export function AddressProvider({ children }) {
    const { showToast } = useToast();
    const { user } = useUser();
    const addressCache = useRef({});
    
    // Состояния
    const [userAddresses, setUserAddresses] = useState([]);
    const [storeAddresses, setStoreAddresses] = useState([]);
    const [addressFormData, setAddressFormData] = useState(INITIAL_USER_ADDRESS_FORM);
    const [storeAddressFormData, setStoreAddressFormData] = useState(INITIAL_STORE_ADDRESS_FORM);
    const [addressQuery, setAddressQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [regionCity, setRegionCity] = useState({ displayRegionCity: '' });
    const [addressFromSuggestions, setAddressFromSuggestions] = useState(false);
    const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [originalAddress, setOriginalAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressType, setAddressType] = useState('user');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [validationErrors, setValidationErrors] = useState({
        street: false,
        house: false,
        apartment: false,
        phone: false
    });
    const [touchedFields, setTouchedFields] = useState({
        street: false,
        house: false,
        apartment: false,
        phone: false
    });
    
    
    const isEditing = Boolean(editingAddressId);

    // Общие функции для работы с адресами
    const fetchAddresses = useCallback(async (type, useCache = true) => {
        setAddressType(user?.role === 'admin' ? 'store' : 'user');
        try {
        if (type === 'user' && useCache) {
            const cachedAddresses = getAddressFromLocalStorage();
            if (cachedAddresses?.length) return cachedAddresses;
        }

        const response = type === 'user' 
            ? await addressApi.getUserAddresses()
            : await addressApi.getAllStoreAddresses();
        
        const addresses = response || [];
        
        if (type === 'user' && useCache) {
            saveAddressToLocalStorage(addresses);
        }
        
        return addresses;
        } catch (error) {
        console.error(`Error fetching ${type} addresses:`, error);
        return [];
        }
    }, []);

    const refreshAddresses = useCallback(async (type) => {
        const setter = type === 'user' ? setUserAddresses : setStoreAddresses;
        const updatedAddresses = await fetchAddresses(type, false);

        setter(updatedAddresses);
        
        if (type === 'user') {
        saveAddressToLocalStorage(updatedAddresses);
        }
        
        return updatedAddresses;
    }, [fetchAddresses]);

    // Функция для форматирования частей адреса (улица, дом и т.д.)
    const formatAddressPart = (part) => {
        if (!part) return '';
        const [type, ...value] = part.split(' ');
        const abbreviations = {
            'ул': 'ул.', 'пер': 'пер.', 'пр-кт': 'пр-кт', 'пр': 'пр.', 'б-р': 'б-р',
            'наб': 'наб.', 'ш': 'ш.', 'пл': 'пл.', 'д': 'д.', 'к': 'к.', 'стр': 'стр.'
        };
        return `${abbreviations[type] || type} ${value.join(' ')}`.trim();
    };

    // Функция для извлечения города и региона из адреса
    const extractRegionCity = (address) => {
        if (!address?.full_address) return { displayRegionCity: '' };
        
        const parts = address.full_address.split(', ');
        const city = parts.find(p => p.startsWith('г '))?.replace('г ', '') || '';
        const region = getFullRegionName(parts.find(p => p.includes('обл'))) || '';
        
        return {
            displayRegionCity: region.includes(city) ? `г. ${city}` : `г. ${city}, ${region}`
        };
    };

    // Преобразование сокращённых названий регионов в полные
    const getFullRegionName = (region) => {
        if (!region) return '';
        const regionMap = {
            'обл': 'область',
        };
    
        return Object.keys(regionMap).reduce((acc, key) => {
            return acc.replace(new RegExp(key, 'g'), regionMap[key]);
        }, region);
    };

    const formatFullAddress = useCallback((address) => {
        if (!address) return '';
        
        const { displayRegionCity } = extractRegionCity(address);
        const city = displayRegionCity.split(',')[0];

        return {
            streetHouse: `${formatAddressPart(address.street)}, ${formatAddressPart(address.house)}`,
            cityRegion: displayRegionCity,
            fullInfo: `${formatAddressPart(address.street)}, ${formatAddressPart(address.house)}, ${displayRegionCity}`,
            checkoutFormat: `${city}, ${formatAddressPart(address.street)}, ${formatAddressPart(address.house)}`,
            openingHours: address.opening_hours,
            phone: address.phone
        };

    }, [addressType, extractRegionCity, formatAddressPart]);

    // Функции для работы с временем работы
    const parseOpeningHours = useCallback((hoursStr) => {
        if (!hoursStr) return { ...DEFAULT_WORKING_HOURS };
        
        const result = { ...DEFAULT_WORKING_HOURS };
        const parts = hoursStr.split(', ');
        
        parts.forEach(part => {
        const [daysRange, timeRange] = part.split(': ');
        const [from, to] = timeRange?.split('-') || [];
        if (!daysRange || !from || !to) return;
        
        if (daysRange.includes('-')) {
            const [startDay, endDay] = daysRange.split('-');
            const startIndex = WEEK_DAYS.findIndex(d => d.short === startDay);
            const endIndex = WEEK_DAYS.findIndex(d => d.short === endDay);
            
            for (let i = startIndex; i <= endIndex; i++) {
            const dayId = WEEK_DAYS[i]?.id;
            if (dayId) result[dayId] = { from, to, isWorking: true };
            }
        } else {
            const day = WEEK_DAYS.find(d => d.short === daysRange);
            if (day) result[day.id] = { from, to, isWorking: true };
        }
        });
        
        return result;
    }, []);

    const formatOpeningHours = useCallback((hours) => {
        const groupedDays = [];
        let currentGroup = null;
        
        WEEK_DAYS.forEach(day => {
        const dayHours = hours[day.id];
        if (!dayHours?.isWorking) return;
        
        const timeStr = `${dayHours.from}-${dayHours.to}`;
        
        if (currentGroup?.time === timeStr) {
            currentGroup.endDay = day.short;
        } else {
            if (currentGroup) groupedDays.push(currentGroup);
            currentGroup = { startDay: day.short, endDay: day.short, time: timeStr };
        }
        });
        
        if (currentGroup) groupedDays.push(currentGroup);
        
        return groupedDays.map(group => {
        const days = group.startDay === group.endDay 
            ? group.startDay 
            : `${group.startDay}-${group.endDay}`;
        return `${days}: ${group.time}`;
        }).join(', ');
    }, []);


    // Обработчики действий
    const handleSetDefaultAddress = useCallback(async (addressId) => {
        try {
        await addressApi.updateAddress(addressId, { is_default: true });
        await refreshAddresses('user');
        showToast("Основной адрес изменён", "success");
        } catch (error) {
        console.error("Ошибка при изменении основного адреса:", error);
        showToast("Не удалось изменить основной адрес", "error");
        }
    }, [refreshAddresses, showToast]);

    const handleDeleteAddress = useCallback(async (addressId) => {
        try {
        const apiCall = addressType === 'user' 
            ? addressApi.deleteAddress 
            : addressApi.deleteStoreAddress;
        
        await apiCall(addressId);
        await refreshAddresses(addressType);
        
        setShowConfirmation(false);
        showToast("Адрес удален", "success");
        } catch (error) {
        console.error("Ошибка при удалении адреса:", error);
        showToast("Не удалось удалить адрес", "error");
        }
    }, [addressType, refreshAddresses, showToast]);

    const validateAddressForm = useCallback(() => {
        const errors = {
            street: false,
            house: false,
            apartment: false,
            phone: false
            };
        
            let isValid = true;
            const missingFields = [];

            const shouldValidateField = (fieldName) => {
                return touchedFields[fieldName] || !isEditing;
            };

            if (shouldValidateField('street') && !addressFormData.street?.trim()) {
                errors.street = true;
                isValid = false;
                missingFields.push('улица');
            }
            if (shouldValidateField('house') && !addressFormData.house?.trim()) {
                errors.house = true;
                isValid = false;
                missingFields.push('дом');
            }

            // Валидация только для пользовательского адреса
            if (addressType === 'user') {
                if (shouldValidateField('apartment') && !addressFormData.apartment?.trim()) {
                    errors.apartment = true;
                    isValid = false;
                    missingFields.push('квартира');
                }
            }
            // Валидация только для адреса магазина
            else if (addressType === 'store') {
                if (shouldValidateField('phone') && (!storeAddressFormData.phone?.trim() || !/^\+7\d{10}$/.test(storeAddressFormData.phone))) {
                    errors.phone = true;
                    isValid = false;
                    missingFields.push('телефон');
                }
                
                // Добавьте другие специфичные для магазина проверки при необходимости
            }
            if (missingFields.length > 0) {
                let message;
                if (missingFields.length === 1) {
                    message = `Заполните обязательное поле: ${missingFields[0]}`;
                } else {
                    const lastField = missingFields.pop();
                    message = `Заполните обязательные поля: ${missingFields.join(', ')} и ${lastField}`;
                }
                showToast(message, "info");
            }
        
    
        setValidationErrors(errors);
     
        if (isEditing && originalAddress) {
            const formData = addressType === 'user' ? addressFormData : storeAddressFormData;
            const isChanged = Object.keys(formData).some(key => {
                const currentValue = formData[key];
                const originalValue = originalAddress[key];
                return (currentValue || '') !== (originalValue || '');
            });
            
            if (!isChanged) {
                showToast('Не было внесено изменений в адрес', "info");
                isValid = false;
            }
        }

        return isValid;
    }, [addressType, addressFormData, storeAddressFormData, isEditing, originalAddress, showToast, touchedFields]);

    const handleSaveAddress = useCallback(async (e) => {
        e.preventDefault();
        if (!validateAddressForm()) return;

        try {
        let response;
        const isUserAddress = addressType === 'user';
        
        if (isUserAddress) {
            const addressData = {
            full_address: addressFormData.full_address,
            street: addressFormData.street,
            house: addressFormData.house,
            apartment: addressFormData.apartment,
            entrance: addressFormData.entrance || null,
            floor: addressFormData.floor || null,
            intercom: addressFormData.intercom || null,
            is_default: addressFormData.is_default
            };
            
            response = isEditing 
            ? await addressApi.updateAddress(editingAddressId, addressData)
            : await addressApi.createAddress(addressData);
        } else {
            const openingHours = formatOpeningHours(workingHours);
            const storeAddressData = {
            full_address: storeAddressFormData.full_address,
            street: storeAddressFormData.street,
            house: storeAddressFormData.house,
            floor: storeAddressFormData.floor || null,
            is_active: storeAddressFormData.is_active,
            opening_hours: openingHours,
            phone: storeAddressFormData.phone
            };
            
            response = isEditing 
            ? await addressApi.updateStoreAddress(editingAddressId, storeAddressData)
            : await addressApi.createStoreAddress(storeAddressData);
        }
        
         // Обновляем список адресов после успешного сохранения
        const updatedAddresses = await refreshAddresses(addressType);
        
        // Если это было создание нового адреса и он должен быть основным
        if (addressType === 'user' && addressFormData.is_default && !isEditing) {
            await handleSetDefaultAddress(response.id);
        }

        showToast(`Адрес успешно ${isEditing ? 'обновлен' : 'добавлен'}`, "success");
        setShowAddressForm(false);
        resetForm();
        return updatedAddresses;
    } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message || "Неизвестная ошибка";
        showToast(`Ошибка при сохранении: ${errorMessage}`, "error");
        }
    }, [
        addressType, addressFormData, storeAddressFormData, 
        editingAddressId, isEditing, workingHours, 
        validateAddressForm, refreshAddresses, showToast, formatOpeningHours
    ]);

    const handleEditAddress = useCallback((addressId) => {
        if (addressType === 'user') {
            const cachedAddresses = getAddressFromLocalStorage();
            const addressToEdit = cachedAddresses?.find(addr => addr.id === addressId);
            
            if (addressToEdit) {
                const formattedAddress = formatFullAddress(addressToEdit);
                
                setOriginalAddress({...addressToEdit});
                setAddressFormData({
                full_address: addressToEdit.full_address,
                street: addressToEdit.street,
                house: addressToEdit.house,
                apartment: addressToEdit.apartment,
                entrance: addressToEdit.entrance || '',
                floor: addressToEdit.floor || '',
                intercom: addressToEdit.intercom || '',
                is_default: addressToEdit.is_default
                });
                
                setAddressQuery(formattedAddress.streetHouse);
                setRegionCity({displayRegionCity: formattedAddress.cityRegion});
            }
            } else {
            const addressToEdit = storeAddresses.find(addr => addr.id === addressId);
                if (addressToEdit) {
                    const formattedAddress = formatFullAddress(addressToEdit);

                    setOriginalAddress({...addressToEdit});
                    setStoreAddressFormData({
                    full_address: addressToEdit.full_address,
                    street: addressToEdit.street,
                    house: addressToEdit.house,
                    floor: addressToEdit.floor,
                    phone: addressToEdit.phone,
                    opening_hours: addressToEdit.opening_hours,
                    is_active: addressToEdit.is_active
                    });
                    setWorkingHours(parseOpeningHours(addressToEdit.opening_hours));
                    setAddressQuery(formattedAddress.streetHouse);
                    setRegionCity({displayRegionCity: formattedAddress.cityRegion });
            }
        }
        
        setEditingAddressId(addressId);
        setShowAddressForm(true);
        setAddressFromSuggestions(true);
    }, [addressType, storeAddresses, parseOpeningHours]);

    const resetForm = useCallback(() => {
        setAddressFormData(INITIAL_USER_ADDRESS_FORM);
        setStoreAddressFormData(INITIAL_STORE_ADDRESS_FORM);
        setWorkingHours(DEFAULT_WORKING_HOURS);
        setRegionCity({ displayRegionCity: '' });
        setAddressQuery('');
        addressCache.current = {};
        setAddressFromSuggestions(false);
        setEditingAddressId(null);
        setOriginalAddress(null);
    }, []);

    // Загрузка начальных данных
    useEffect(() => {

        if (!user?.id) return;
        
        const loadInitialAddresses = async () => {
        const [userAddrs, storeAddrs] = await Promise.all([
            fetchAddresses('user'),
            fetchAddresses('store')
        ]);
        setUserAddresses(userAddrs);
        setStoreAddresses(storeAddrs);
        };
        loadInitialAddresses();
    }, [user?.id, fetchAddresses]);


    // Провайдер значения
    const contextValue = {
        // Константы
        WEEK_DAYS,
        
        // Состояния
        userAddresses,
        storeAddresses,
        addressFormData,
        storeAddressFormData,
        addressQuery,
        addressSuggestions,
        regionCity,
        addressFromSuggestions,
        editingAddressId,
        originalAddress,
        showAddressForm,
        addressType,
        showConfirmation,
        addressToDelete,
        workingHours,
        isEditing,
        addressCache,
        validationErrors,
        touchedFields,
        
        // Сеттеры
        setAddressFormData,
        setStoreAddressFormData,
        setAddressQuery,
        setAddressSuggestions,
        setRegionCity,
        setAddressFromSuggestions,
        setEditingAddressId,
        setOriginalAddress,
        setShowAddressForm,
        setAddressType,
        setShowConfirmation,
        setAddressToDelete,
        setWorkingHours,
        setTouchedFields,
        setValidationErrors,
        getFullRegionName,
        formatFullAddress,
        
        // Действия
        handleSetDefaultAddress,
        handleDeleteAddress,
        handleSaveAddress,
        handleEditAddress,
        refreshUserAddresses: () => refreshAddresses('user'),
        refreshStoreAddresses: () => refreshAddresses('store'),
        resetForm,
        formatOpeningHours,
        parseOpeningHours,
        formatAddressPart,
        extractRegionCity
    };

    return (
        <AddressContext.Provider value={contextValue}>
        {children}
        </AddressContext.Provider>
    );
}

export function useAddress() {
  return useContext(AddressContext);
}