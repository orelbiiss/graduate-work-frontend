import React, { createContext, useContext } from 'react';

const ProductCardContext = createContext();

export const ProductCardProvider = ({ children }) => {
    
    // Функция для приведения данных товара к единому формату
    const formatProductData = (drink) => {

        // массив объемов и цен 
        const volumePrices = drink?.volumePrices || drink?.volume_prices || [];
        // сортировка объемрв и цен
        const sortedVolumePrices = [...volumePrices].sort((a, b) => a.volume - b.volume);
        

        const volumes = sortedVolumePrices.map(value => value.volume);
        const prices = sortedVolumePrices.map(value => value.price);
        
        // функция получения цены для выбранного объема
        const getPrice = (selectedVolume = 0) => {
            // Находим цену для выбранного объема
            const volumePrice = sortedVolumePrices.find(vp => vp.volume === selectedVolume);
            // Берем скидку (приоритет у скидки на конкретный объем, если нет - общая скидка)
            const sale = volumePrice?.sale ?? drink?.sale ?? 0;
            
            // Если объем выбран и найден
            if (volumePrice) {
                const basePrice = volumePrice.price;
                return {
                    price: basePrice,
                    discountedPrice: sale > 0 ? Math.round(basePrice * (100 - sale) / 100) : basePrice,
                    volumePriceId: volumePrice.id,
                    hasDiscount: sale > 0
                };
            }
            
            // Если объем не выбран, используем минимальную цену
            if (prices.length > 0) {
                const minPriceObj = sortedVolumePrices.reduce((min, current) => 
                    current.price < min.price ? current : min
                );
                return {
                    price: minPriceObj.price,
                    discountedPrice: sale > 0 ? 
                        Math.round(minPriceObj.price * (100 - sale) / 100) : 
                        minPriceObj.price,
                    volumePriceId: null,
                    hasDiscount: sale > 0
                };
            }
            
            return { 
                price: 0, 
                discountedPrice: 0, 
                volumePriceId: null,
                hasDiscount: false
            };
        };


        // форматированные данные товара
        return {
            id: drink?.id,
            name: drink?.name,
            ingredients: drink?.ingredients || '',
            description: drink?.description || drink?.product_description || '',
            imgSrc: drink?.imgSrc || drink?.volume_prices?.[0]?.img_src || '',
            volumePrices: sortedVolumePrices,
            volumes: volumes,
            prices: prices,
            sale: drink?.sale || drink?.volume_prices?.[0]?.sale || drink?.global_sale || 0,
            quantity: drink?.quantity,
            getPrice: getPrice
        };
    };

    return (
        <ProductCardContext.Provider value={{ formatProductData }}>
            {children}
        </ProductCardContext.Provider>
    );
};

export const useProductCard = () => useContext(ProductCardContext);