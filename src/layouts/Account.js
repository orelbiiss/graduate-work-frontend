import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import AccauntLayout from "../components/AccaountLayout";
import { orderApi } from '../api/order';
import { useProductCard } from '../contexts/ProductCardContext';
import { useMediaQuery } from 'usehooks-ts';

function Accaunt() {
    // Состояния
    const [activeView, setActiveView] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [drinks, setDrinks] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(9);
    const { formatProductData } = useProductCard();
    const navigate = useNavigate();

    // Добавлено: Кэш для хранения загруженных данных
    const cacheRef = useRef({
        orders: {},
        drinks: {}
    });

    // Адаптивный лимит элементов
    const isLargeScreen = useMediaQuery('(min-width: 1630px)');
    useEffect(() => {
        setLimit(isLargeScreen ? 12 : 9);
    }, [isLargeScreen]);

    // Загрузка данных при изменении параметров
    useEffect(() => {
        const fetchData = async () => {
            const cacheKey = `${currentPage}-${limit}-${statusFilter}`;
            
            // Проверяем есть ли данные в кэше
            if (activeView === 'orders' && cacheRef.current.orders[cacheKey]) {
                setOrders(cacheRef.current.orders[cacheKey].data);
                setTotalItems(cacheRef.current.orders[cacheKey].total);
                return;
            }
            
            if (activeView === 'drinks' && cacheRef.current.drinks[`${currentPage}-${limit}`]) {
                setDrinks(cacheRef.current.drinks[`${currentPage}-${limit}`].data);
                setTotalItems(cacheRef.current.drinks[`${currentPage}-${limit}`].total);
                return;
            }

            setLoading(true);
            try {
                if (activeView === 'orders') {
                    const response = await orderApi.getMyOrders({
                        page: currentPage,
                        limit,
                        status: statusFilter === 'all' ? 'all' : statusFilter
                    });
                    
                    // Сохраняем в кэш
                    cacheRef.current.orders[cacheKey] = {
                        data: response.orders,
                        total: response.total
                    };
                    
                    setOrders(response.orders);
                    setTotalItems(response.total);
                } else {
                    const response = await orderApi.getMyPurchasedItems({ page: currentPage, limit });
                    const formattedDrinks = response.drinks.map(drink => formatProductData(drink));
                    
                    // Сохраняем в кэш
                    cacheRef.current.drinks[`${currentPage}-${limit}`] = {
                        data: formattedDrinks,
                        total: response.total
                    };
                    
                    setDrinks(formattedDrinks);
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage, statusFilter, activeView, limit, formatProductData]);

    // Обновление URL при смене раздела
    useEffect(() => {
        navigate(`#${activeView === 'orders' ? 'my-orders' : 'purchased-drinks'}`);
    }, [activeView, navigate]);

    // Переключатель разделов
    const orderViewSwitcher = (
        <div className="view-switcher">
            <div className="switcher-container">
                <p className={`switcher-option ${activeView === 'orders' ? 'active' : ''}`}
                   onClick={() => { setActiveView('orders'); setCurrentPage(1); }}>
                    заказы
                </p>
                <p className={`switcher-option ${activeView === 'drinks' ? 'active' : ''}`}
                   onClick={() => { setActiveView('drinks'); setCurrentPage(1); }}>
                    напитки
                </p>
                <div className="switcher-indicator" />
                <div className="hover-indicator" />
            </div>
        </div>
    );

    return (
        <>
            <Header/>
            <AccauntLayout 
                orderViewSwitcher={orderViewSwitcher}
                orders={orders}
                drinks={drinks}
                loading={loading}
                totalOrders={totalItems}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                activeView={activeView}
                pageSize={limit}
            />
        </>
    );
}

export default Accaunt;