import { useEffect, useState } from "react";
import Header from "../components/Header";
import PersonalIdentificationBlock from "../components/PersonalIdentificationBlock";
import RegistrationForm from "../components/Form";
import { useUser } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authApi } from '../api/auth';
import '../css/ProfileEditPage.css';
import AddressList from "../components/AddressList";
import '../css/Btn.css';
import { useAddress } from '../contexts/AddressContext';
import OrderDetailsModal from "../components/OrderDetailsModal";

function ProfileEditPage({ showDetailsOrder }) {

    const { user, setUser } = useUser();
    const navigate = useNavigate(); // Для редиректа на страницу входа
    const [ address, setAddress] = useState(false);
    const { setShowAddressForm, setAddressType, userAddresses, setRegionCity, setAddressQuery } = useAddress(); 


    const openAddressPanel = () => {
      setShowAddressForm(true);
      setAddressType(user?.role === 'admin' ? 'store' : 'user');
    };
  
    useEffect(() => {
      if (user?.role === 'admin') {
        setAddressType('admin');
      }
    }, [user?.role, setAddressType]);

    // Прокрутка вверх при монтировании компонента
    useEffect(() => {
        window.scrollTo(0, 0);
        
        // При открытии страницы — скрываем прокрутку у body
        document.body.style.overflow = 'hidden';
        document.body.style.top = '0px';
        document.body.style.position = 'relative';
    
        // При выходе со страницы — восстанавливаем прокрутку
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Функция выхода
    const handleSignOut = async () => {
        try {
            await authApi.signOut(); // Отправляем запрос на выход
            setUser(null); // Очищаем данные пользователя из контекста
            Cookies.remove('accessToken'); // Удаляем токен из куки
            localStorage.removeItem('user');
            localStorage.removeItem('address'); // Удаляем данные пользователя из локального хранилища
            localStorage.removeItem("deliveryCalculatorData");
            setRegionCity({ region: '', city: '' });
            setAddressQuery('');
            navigate('/'); // Перенаправляем на страницу входа
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        } 
    };

    console.log(showDetailsOrder)
      

    return (
      <>
        <Header />
        <div className={`profile-edit-container ${user?.role ==='admin' && 'admin'}`}>
          <aside className="profile-sidebar">
            <PersonalIdentificationBlock />
            <div className="user-orders-section">
              { user?.role === 'admin' ? 
                  (<Link to="/admin" className="section-text">заказы</Link>)
              : (<Link to="/account" className="section-text">мои заказы</Link>)}
            </div>
            <div className="account-management-section">
              { user?.role === 'admin' ? 
                  (<>
                    <p className="section-text" onClick={() => setAddress(true)}>адреса магазинов</p>
                    <p className="section-text" onClick={handleSignOut}>каталог</p>
                  </>)
              : (<p className="section-text" onClick={() => setAddress(true)}>мои адреса</p>)}
              <p className="section-text" onClick={handleSignOut}>выйти</p>
            </div>
          </aside>
          <section className="profile-dynamic-section">
            {showDetailsOrder && (
              <OrderDetailsModal 
               
              />
            )}
            { address ? (
              <>
              {user?.role === 'admin' ? <h2>адреса магазинов</h2> : <h2>мои адреса</h2>}
                <AddressList setAddressType={setAddressType} openAddressPanel={openAddressPanel} />
                {(user?.role === 'admin' || userAddresses?.length === 0) && (
                  <button type="button" onClick={openAddressPanel} className="btn-filled-sidebar">
                    {user?.role === 'admin' ? 'добавить новый адрес магазина' : 'добавить адрес'}
                  </button>
              )}
              </>
            ): ( 
                <>
                <h2>мой профиль</h2>
                <RegistrationForm initialData={user} />
                </>
            )
            }
          </section>
        </div>
      </>
    );
}

export default ProfileEditPage;
