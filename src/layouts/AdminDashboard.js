import { useState, useEffect } from 'react';
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
    const [ limit, setLimit ] = useState(9);
    const [loading, setLoading] = useState(false);

    // Адаптивный лимит элементов
    const isLargeScreen = useMediaQuery('(min-width: 1630px)');
    useEffect(() => {
        setLimit(isLargeScreen ? 12 : 9);
    }, [isLargeScreen]);

    // Получение статистики
    const fetchStats = async () => {
        try {
            const [counts, statusCountsData] = await Promise.all([
                adminApi.getActiveOrdersCount(),
                adminApi.getOrdersCountByStatus()
            ]);
            setActiveOrdersCount(counts);
            setStatusCounts(statusCountsData);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    };

    // Получение заказов
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await adminApi.getAllOrders({
                page: currentPage,
                limit: limit,
                status: statusFilter === 'all' ? 'all' : statusFilter
            });
            setOrders(response.orders);
            setTotalOrders(response.total);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchOrders();
    }, [currentPage, statusFilter]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
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