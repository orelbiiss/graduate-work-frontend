import React, { useEffect, useRef } from 'react';
import { useAddress } from '../contexts/AddressContext';

const DeliveryCalculator = ({ userAddress, cartTotal, onCalculated }) => {
    
    const { storeAddresses } = useAddress(); // Получение списка адресов магазинов из контекста
    const ymapsRef = useRef(null);                           // Ссылка на API Яндекс.Карт

    // Параметры для расчета стоимости доставки
    const deliveryParams = {
        baseFee: 250,         // Базовая стоимость доставки
        freeRadius: 5,        // Радиус бесплатной доставки (км)
        standardRate: 25,      // Стандартный тариф (₽/км) для 5-15 км
        premiumRate: 35,       // Повышенный тариф (₽/км) для 15-30 км
        maxDistance: 30,       // Максимальное расстояние доставки (км)
        freeThreshold: 1000,   // Сумма заказа для бесплатной доставки (₽)
        minOrderAmount: 300,   // Минимальная сумма заказа для доставки (₽)
        minFee: 300,           // Минимальная стоимость доставки (₽)
        discountStart: 600,    // Сумма заказа для начала скидки (₽)
        maxDiscount: 0.3       // Максимальный размер скидки (30%)
    };

    useEffect(() => {
        const scriptId = 'yandex-maps-script';

        if (window.ymaps) {
            window.ymaps.ready(() => {
                ymapsRef.current = window.ymaps;
                calculateDelivery();
            });
            return;
        }

        if (document.getElementById(scriptId)) {
            const interval = setInterval(() => {
                if (window.ymaps) {
                    clearInterval(interval);
                    window.ymaps.ready(() => {
                        ymapsRef.current = window.ymaps;
                        calculateDelivery();
                    });
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=c4843192-fa7a-47ab-a595-f330b120219d&lang=ru_RU`;
        script.async = true;

        script.onload = () => {
            window.ymaps.ready(() => {
                ymapsRef.current = window.ymaps;
                calculateDelivery();
            });
        };

        script.onerror = () => {
            onCalculated({
                price: deliveryParams.baseFee,
                discount: 0,
                error: 'Не удалось загрузить Яндекс.Карты'
            });
        };

        document.head.appendChild(script);

        return () => {
            if (script.onload) script.onload = null;
            if (script.onerror) script.onerror = null;
        };
    }, []);

    const calculateDelivery = async () => {

        if (!userAddress || !storeAddresses?.length || !ymapsRef.current) {
            onCalculated({
                price: deliveryParams.baseFee,
                discount: 0
            });
            return;
        }

        try {
            const userCoords = await geocode(userAddress);
            const nearest = await findNearestStore(userCoords, storeAddresses);
            const price = calculatePrice(nearest.distance, cartTotal);

            let result = {
                price,
                distance: nearest.distance,
                store: nearest.store
            };
            
            if (price === 0) {
                result.text = 'Бесплатно';
                result.discount = 1; 
            } else if (cartTotal > deliveryParams.discountStart && cartTotal < deliveryParams.freeThreshold) {
                const progress = (cartTotal - deliveryParams.discountStart) / 
                               (deliveryParams.freeThreshold - deliveryParams.discountStart);
                const discount = progress * deliveryParams.maxDiscount;
                result.text = `${price} ₽ (скидка ${Math.round(discount * 100)}%)`;
                result.discount = discount;
            } else {
                result.text = `${price} ₽`;
                result.discount = 0;
            }

            onCalculated(result);
        } catch (err) {
            onCalculated({
                price: deliveryParams.baseFee,
                text: `${deliveryParams.baseFee} ₽`,
                discount: 0,
                error: err.message
            });
        }
    };

    const findNearestStore = async (userCoords, stores) => {
        const results = await Promise.allSettled(
            stores.map(async (store) => {
                try {
                    const storeCoords = await geocode(`${store.street}, ${store.house}`);
                    const route = await buildRoute(userCoords, storeCoords);
                    return {
                        store,
                        distance: (route.getLength() / 1000).toFixed(1)
                    };
                } catch {
                    return null;
                }
            })
        );

        const validResults = results
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);

        if (!validResults.length) throw new Error('Нет доступных магазинов');
        
        return validResults.reduce((prev, curr) => 
            parseFloat(prev.distance) < parseFloat(curr.distance) ? prev : curr
        );
    };

    const geocode = (address) => {
        return new Promise((resolve, reject) => {
            if (!ymapsRef.current?.geocode) {
                reject(new Error('API Яндекс.Карт не готово'));
                return;
            }

            ymapsRef.current.geocode(address, { results: 1 })
                .then(res => {
                    const firstGeoObject = res.geoObjects.get(0);
                    if (!firstGeoObject) {
                        reject(new Error('Адрес не найден'));
                        return;
                    }
                    resolve(firstGeoObject.geometry.getCoordinates());
                })
                .catch(reject);
        });
    };

    const buildRoute = (from, to) => {
        return new Promise((resolve, reject) => {
            if (!ymapsRef.current?.route) {
                reject(new Error('API Яндекс.Карт не готово'));
                return;
            }

            ymapsRef.current.route([from, to])
                .then(route => {
                    if (!route) {
                        reject(new Error('Не удалось построить маршрут'));
                        return;
                    }
                    resolve(route);
                })
                .catch(reject);
        });
    };

    const calculatePrice = (distance, orderAmount) => {
        const distanceNum = parseFloat(distance);
        
        if (distanceNum > deliveryParams.maxDistance) {
            throw new Error(`Доставка возможна только в пределах ${deliveryParams.maxDistance} км`);
        }

        if (orderAmount < deliveryParams.minOrderAmount) {
            throw new Error(`Минимальная сумма заказа для доставки - ${deliveryParams.minOrderAmount} ₽`);
        }

        if (orderAmount >= deliveryParams.freeThreshold || distanceNum <= deliveryParams.freeRadius) {
            return 0;
        }

        let price = deliveryParams.baseFee;

        if (distanceNum <= 15) {
            price += (distanceNum - deliveryParams.freeRadius) * deliveryParams.standardRate;
        } else {
            price += 
                (15 - deliveryParams.freeRadius) * deliveryParams.standardRate + 
                (distanceNum - 15) * deliveryParams.premiumRate;
        }

        price = Math.max(price, deliveryParams.minFee);

        if (orderAmount > deliveryParams.discountStart && orderAmount < deliveryParams.freeThreshold) {
            const progress = (orderAmount - deliveryParams.discountStart) / 
                            (deliveryParams.freeThreshold - deliveryParams.discountStart);
            
            const discountFactor = 1 - (progress * deliveryParams.maxDiscount);
            price = Math.round(price * discountFactor);
            
            price = Math.max(price, deliveryParams.minFee * (1 - deliveryParams.maxDiscount));
        }

        return price;
    };

    useEffect(() => {
        if (ymapsRef.current) {
            calculateDelivery();
        }
    }, [userAddress, cartTotal]);

    return null;
};

export default DeliveryCalculator;