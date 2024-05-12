import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SidePanel from './SideBar.js';
import '../Header.css';
import { CartContext } from '../layouts/CartContext.js';


function Header() {

  const location = useLocation(); // Получаем текущий URL с помощью useLocation

  // Проверяем, находится ли пользователь на странице productpage
  const isProductPage = location.pathname === '/productPage';

  // Стили для ProductSwiper
  const productSwiperStyle = isProductPage ? 'productpage-header__section' : 'header__section';

  const { cart } = useContext(CartContext);
  const { setLoginWindowOpen } = useContext(CartContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);


  // Функция для открытия/закрытия боковой панели 
  //или перехода на страницу корзины в зависимости от размера экрана
  function togglePanel() {
      setIsPanelOpen(!isPanelOpen);
  }

  function toggleLoginWindow() {
      setLoginWindowOpen(true); 
}
  
  return(
    <header className={productSwiperStyle}>
      <div className="social__media__icons">
        <a href="https://web.telegram.org/a/">
          <img src='img/icon__tg.svg'className="icon__tg"></img>
        </a>
        <a href="https://web.whatsapp.com/">
          <img src='img/icon__wa.svg' className="icon__wa"></img>
        </a>
        <a href="https://m.vk.com/">
          <img src='img/icon__vk.svg' className="icon__vk"></img>
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
        <img className='profile__circle' src='/img/profile__circle.svg' onClick={() => { setIsPanelOpen(true); toggleLoginWindow()}}></img>
        <img className="icon__basket" src='/img/basket.svg' alt="корзина" onClick={togglePanel}/>
        <div className={"count" + (cart.length ? ' active' : '')} onClick={togglePanel}>
          {cart.reduce((acc, item) => acc + item.inBasket, 0)}
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
                <img src='img/icon__tg.svg'className="icon__tg"></img>
              </a>
              <a href="https://web.whatsapp.com/">
                <img src='img/icon__wa.svg' className="icon__wa"></img>
              </a>
              <a href="https://m.vk.com/">
                <img src='img/icon__vk.svg' className="icon__vk"></img>
              </a>
            </div>
          </div> : 
        ''}
      <SidePanel isOpen={isPanelOpen}  onClose={togglePanel} />
  </header>
  )
}

export default Header;