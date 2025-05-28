import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SidePanel from './SideBar.js';
import '../css/Header.css';
import { CartContext } from '../contexts/CartContext.js';
import { useUser } from '../contexts/UserContext.js';
import { useAddress } from '../contexts/AddressContext';


function Header() {

  const location = useLocation(); // Получаем текущий URL с помощью useLocation
  const navigate = useNavigate(); // Используем navigate для редиректа
  const { user } = useUser();
  const { setShowAddressForm, showAddressForm } = useAddress();
  

  // Автоматическое открытие при хэше
  useEffect(() => {
    if (location.hash.startsWith('#password-reset') || 
        location.hash.startsWith('#verify-email') ||  // Добавляем проверку для email
        location.hash === '#cart') {
      setTimeout(() => setIsPanelOpen(true), 100);
    }
  }, [location.hash]);
  
  // Проверяем, находится ли пользователь на странице productpage
  const isProductPage = location.pathname === '/productPage';
  const isCheckOut = location.pathname === '/checkout';

  // Стили для ProductSwiper
  const productSwiperStyle = isProductPage ? 'productpage-header__section' : 'header__section';

  const { cart } = useContext(CartContext);
  const { setLoginWindowOpen } = useContext(CartContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (showAddressForm) {
      setIsPanelOpen(true);
    }
  }, [showAddressForm]);
  // Функция для открытия/закрытия боковой панели 
  //или перехода на страницу корзины в зависимости от размера экрана
  function togglePanel() {
    setIsPanelOpen(!isPanelOpen);
    if (!isPanelOpen) {
      setShowAddressForm(false);
    }
  }

  function toggleLoginWindow() {
      setLoginWindowOpen(true); 
}

 // Проверка роли пользователя из localStorage
 function handleProfileClick() {
   // Проверяем роль в localStorage
  if (user?.role === 'admin') {
    navigate('/admin'); // Если админ — переходим на страницу админа
  } else if (user?.role === 'user') {
    navigate('/account'); // Если обычный пользователь — переходим в личный кабинет
  } else {
    setIsPanelOpen(true);
    toggleLoginWindow(); // Если нет роли — показываем окно входа
  }
}
  
  return(
    <>
    { user?.role === 'admin' || isCheckOut ?  
     (<header className='header-checkout'>
            <div className="back-arrow" onClick={() => window.history.back()}></div>
            <Link to="/">
                <img className="logo" src='/img/logo.svg' alt="Лого" title='logo' />
            </Link>
            <div className="close-icon" onClick={() => window.history.back()}></div>
      </header> ):(
      <header className={productSwiperStyle}>
        <div className="social__media__icons">
          <a href="https://web.telegram.org/a/">
            <img src='/img/icon__tg.svg'className="icon__tg" alt='tg'></img>
          </a>
          <a href="https://web.whatsapp.com/">
            <img src='/img/icon__wa.svg' className="icon__wa" alt='wa'></img>
          </a>
          <a href="https://m.vk.com/">
            <img src='/img/icon__vk.svg' className="icon__vk" alt='vk'></img>
          </a>
        </div>
        <ul className="navigation__links">
          <li className="hdr__text">
            <Link to="/catalog">Напитки</Link>
          </li>
          <li className="hdr__text">
            <Link to="/sale">Акции</Link>
          </li>
          <Link to="/">
            <img className="logo" src='/img/logo.svg' alt="Лого" title='logo' />
          </Link>
          <li className="hdr__text">
            <Link to="/aboutUs">О нас</Link>
          </li>
          <li className="hdr__text">
            <Link to="/contact">Контакты</Link>
          </li>
        </ul>
        <div className="basket__menu__icons">
          <img className='profile__circle' src='/img/profile__circle.svg' onClick={handleProfileClick} alt='профиль'></img>
          <img 
            className='icon__basket'
            src='/img/basket.svg' 
            alt="корзина" 
            onClick={togglePanel} 
          />
          <div className={"count" + (cart.items.length ? ' active' : '')} onClick={togglePanel}>
            {cart.items.length}
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            id="icon__menu"
            className={isMenuOpen ? "icon__menu__cross" : "icon__menu__default"}
            >
            <span />
            <span />
            <span />
            <span />
          </button>

        </div>
          {isMenuOpen ? 
            <div  className='burger__links'>
              <div className='links'>
                <Link to="/catalog">Напитки</Link>
                <Link to="/sale">Акции</Link>
                <Link to="/aboutUs">О нас</Link>
                <Link to="/contact">Контакты</Link>
              </div>
              <div className="social__media__icons__footer">
                <a href="https://web.telegram.org/a/">
                  <img src='/img/icon__tg.svg'className="icon__tg" alt='tg'></img>
                </a>
                <a href="https://web.whatsapp.com/">
                  <img src='/img/icon__wa.svg' className="icon__wa" alt='wa'></img>
                </a>
                <a href="https://m.vk.com/">
                  <img src='/img/icon__vk.svg' className="icon__vk" alt='vk'></img>
                </a>
              </div>
            </div> : 
          ''}
      </header>)
    }
    <SidePanel isOpen={isPanelOpen}  onClose={togglePanel}/>
  </>
  )
}

export default Header;