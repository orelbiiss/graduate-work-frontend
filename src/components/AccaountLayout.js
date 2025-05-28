import '../css/AccauntLayout.css';
import { Segmented, Progress } from 'antd';
import OrderCard from './OrderCard';
import Pagination from '../utils/Pagination';
import PersonalIdentificationBlock from './PersonalIdentificationBlock';
import CardToAdd from './CardToAdd';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useProductCard } from '../contexts/ProductCardContext';
import '../css/CardToAdd.css';
import { useUser } from '../contexts/UserContext';


function AccauntLayout({ monitoringBlock, onStatusChange, orderViewSwitcher, orders,  drinks, loading,
                         totalOrders, currentPage, setCurrentPage, statusFilter, setStatusFilter,
                         isAdmin, activeView, pageSize
}) {
    const navigate = useNavigate();
    const totalPages = Math.ceil(totalOrders / pageSize);
    const { formatProductData } = useProductCard();
    const { user } = useUser();
    const statusMap = {
        'все': 'all',
        'новый': 'new',
        'в сборке': 'processing',
        'в пути': 'delivering',
        'выполнен': 'completed',
        'отменен': 'cancelled'
    };

    const reverseStatusMap = {
        'all': 'все',
        'new': 'новый',
        'processing': 'в сборке',
        'delivering': 'в пути',
        'completed': 'выполнен',
        'cancelled': 'отменен'
    };


    useEffect(() => {
        navigate(`?page=${currentPage}&status=${statusFilter}`);
    }, [currentPage, statusFilter, navigate]);

    const handleStatusFilterChange = (value) => {
        setCurrentPage(1); // Сброс на первую страницу при изменении фильтра
        setStatusFilter(statusMap[value] || 'all');
    };

    // Получаем текущее значение для Segmented в русской локали
    const getCurrentFilterValue = () => {
        return reverseStatusMap[statusFilter] || 'все';
    };
    

    const renderContent = () => {
        if (loading) {
            return <Progress type="line" percent={50} status="active" showInfo={false} />;
        }

        // Для администратора - только заказы
        if (isAdmin) {
            return orders.length === 0 
                ? <p>Нет заказов для отображения.</p>
                : 
                <article className='orders-grid'>
                    {orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onStatusChange={onStatusChange}
                                isAdmin={isAdmin}
                            />
                    ))}
                </article>
                ;
        }

        // Для обычных пользователей - проверяем activeView
        if (activeView === 'orders') {
            return orders.length === 0 
                ? <p>Нет заказов для отображения.</p>
                : (
                    <article className='orders-grid'>
                        {orders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onStatusChange={onStatusChange}
                                    isAdmin={isAdmin}
                                />
                        ))}
                    </article>
            );
        };

        // Для напитков (только для обычных пользователей)
        return drinks.length === 0 
            ? <p>Нет напитков для отображения.</p>
            : (
                <article className="drinks-grid">
                    {drinks.map(drink => (
                        <CardToAdd 
                            key={drink.id} 
                            item={formatProductData(drink)}
                        />
                    ))}
                </article>
            );
    };


    return (
        <main className={`layout ${user?.role === 'admin' && 'admin'}`}>
            <aside className="account-menu">  
                <PersonalIdentificationBlock onEditClick={() => navigate('/account/edit')} />
                {isAdmin && monitoringBlock}
            </aside>
            
            <div className='orders-header'>
                {isAdmin ? (
                    <>
                        <p>все заказы</p>
                        <Segmented
                            options={['все', 'новый', 'в сборке', 'в пути', 'выполнен']}
                            onChange={handleStatusFilterChange}
                            value={getCurrentFilterValue()}
                        />
                    </>
                ) : (
                    orderViewSwitcher
                )}
            </div>
            
            {renderContent()}
            
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                />
            )}
        </main>
    );
}

export default AccauntLayout;