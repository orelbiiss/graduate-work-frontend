import { useNavigate } from 'react-router-dom';
import { Pagination } from 'antd';


const CustomPagination = ({ currentPage, totalPages, onPageChange, statusFilter, pageSize }) => {
    const navigate = useNavigate();

    const handlePageChange = (page) => {
        onPageChange(page);  // Обновляем данные в родительском компоненте
        navigate(`?page=${page}&status=${statusFilter}`); // Обновляем URL с параметром страницы и фильтра
    };

    return (
        <Pagination
                current={currentPage}
                total={totalPages * pageSize}
                pageSize={pageSize} // Количество элементов на странице
                onChange={handlePageChange}
                showSizeChanger={false} // Скрываем выбор количества элементов на странице
                className="custom-pagination"
            />
    );
};

export default CustomPagination;
