import { useState, useEffect } from 'react';
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

    // Адаптивный лимит элементов
    const isLargeScreen = useMediaQuery('(min-width: 1630px)');
    useEffect(() => {
        setLimit(isLargeScreen ? 12 : 9);
    }, [isLargeScreen]);

    // Загрузка данных при изменении параметров
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeView === 'orders') {
                    const response = await orderApi.getMyOrders({
                        page: currentPage,
                        limit,
                        status: statusFilter === 'all' ? 'all' : statusFilter
                    });
                    setOrders(response.orders);
                    setTotalItems(response.total);
                } else {
                    const response = await orderApi.getMyPurchasedItems({ page: currentPage, limit });
                    setDrinks(response.drinks.map(drink => formatProductData(drink)));
                    setTotalItems(response.total);
                }
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage, statusFilter, activeView, limit]);

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