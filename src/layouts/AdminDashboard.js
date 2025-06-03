import { useState, useEffect, useRef } from 'react';
import AccauntLayout from "../components/AccaountLayout";
import { adminApi } from '../api/admin';
import { useMediaQuery } from 'usehooks-ts';
import Header from "../components/Header";

function AdminDashboard() {
    // Состояния для статистики
    const [activeOrdersCount, setActiveOrdersCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({});
    
    // Состояния для пагинации и фильтрации
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [limit, setLimit] = useState(9);
    const [loading, setLoading] = useState(false);

    // Кэш для хранения данных
    const cacheRef = useRef({
        stats: null,
        orders: {}
    });

    // Адаптивный лимит элементов
    const isLargeScreen = useMediaQuery('(min-width: 1630px)');
    useEffect(() => {
        setLimit(isLargeScreen ? 12 : 9);
    }, [isLargeScreen]);

    // Получение статистики
    const fetchStats = async () => {
        try {
            // Проверяем кэш перед запросом
            if (cacheRef.current.stats) {
                setActiveOrdersCount(cacheRef.current.stats.counts);
                setStatusCounts(cacheRef.current.stats.statusCounts);
                return;
            }

            const [counts, statusCountsData] = await Promise.all([
                adminApi.getActiveOrdersCount(),
                adminApi.getOrdersCountByStatus()
            ]);
            
            // Сохраняем в кэш
            cacheRef.current.stats = {
                counts,
                statusCounts: statusCountsData
            };
            
            setActiveOrdersCount(counts);
            setStatusCounts(statusCountsData);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    };

    // Получение заказов
    const fetchOrders = async () => {
        const cacheKey = `${currentPage}-${limit}-${statusFilter}`;
        
        // Проверяем кэш перед запросом
        if (cacheRef.current.orders[cacheKey]) {
            setOrders(cacheRef.current.orders[cacheKey].data);
            setTotalOrders(cacheRef.current.orders[cacheKey].total);
            return;
        }

        setLoading(true);
        try {
            const response = await adminApi.getAllOrders({
                page: currentPage,
                limit: limit,
                status: statusFilter === 'all' ? 'all' : statusFilter
            });
            
            // Сохраняем в кэш
            cacheRef.current.orders[cacheKey] = {
                data: response.orders,
                total: response.total
            };
            
            setOrders(response.orders);
            setTotalOrders(response.total);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка данных при изменении параметров
    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter, limit]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            // Инвалидируем кэш после изменения статуса
            cacheRef.current.stats = null;
            cacheRef.current.orders = {};
            await Promise.all([fetchStats(), fetchOrders()]);
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
        }
    };

    const statusData = [
        { name: 'новый', count: statusCounts['new'] || 0, className: 'status-new' },
        { name: 'в сборке', count: statusCounts['processing'] || 0, className: 'status-building' },
        { name: 'в пути', count: statusCounts['delivering'] || 0, className: 'status-shipping' },
        { name: 'выполнен', count: statusCounts['completed'] || 0, className: 'status-completed' }
    ];

    const monitoringBlock = (
        <div className='order-monitoring'>
            <div className='total-num'>
                <p className='total-num-text'>общее количество заказов:</p>
                <p className='total-num-num'>{activeOrdersCount}</p>
            </div>
            <div className='status-container'>
                {statusData.map((status, index) => (
                    <div key={index} className="status-item">
                        <div className='status-name'>
                            <p className={status.className}>{status.name}</p>
                        </div>
                        <p className='status-num'>{status.count}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            <Header />
            <AccauntLayout 
                monitoringBlock={monitoringBlock}
                onStatusChange={handleStatusChange}
                orders={orders}
                loading={loading}
                totalOrders={totalOrders}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                isAdmin={true}
            />
        </>
    );
}

export default AdminDashboard;