import React, { useContext, useState, useEffect } from 'react';
import '../css/SideBar.css';
import '../css/Btn.css';
import { CartContext } from '../contexts/CartContext.js';
import { useLocation, useNavigate } from 'react-router-dom'; 
import AuthPanels from './AuthPanels';
import CartPanels from './CartPanels';
import AddressPanel from './AddressPanel';
import { useAddress } from '../contexts/AddressContext.js';


function SidePanel({ isOpen, onClose }) {

  const navigate = useNavigate();
  const location = useLocation();
  const { cart, fetchCart } = useContext(CartContext);
  const { isLoginWindowOpen, setLoginWindowOpen } = useContext(CartContext);
  const [ useRegistrationPanel, setUseRegistrationPanel ] = useState(false);
  const [ loginRegisterChoice, setLoginRegisterChoice ] = useState(false);
  const [ showEmailPasswordResetPanel, setShowEmailPasswordResetPanel ] = useState(false);
  const [ showNewPasswordForm, setShowNewPasswordForm ] = useState(false);
  const [ resetToken, setResetToken ] = useState('');
  const [ showVerificationPanel, setShowVerificationPanel ] = useState(false);
  const [ verificationToken, setVerificationToken ] = useState('');
  const { setShowAddressForm, showAddressForm, resetForm } = useAddress();

   // 1. Эффект только для первоначального парсинга хэша
   useEffect(() => {
    if (!isOpen) return; // Работаем только когда панель открыта

    if (location.hash.startsWith('#password-reset-confirm-')) {
      const token = location.hash.replace('#password-reset-confirm-', '');
      setResetToken(token);
      setShowNewPasswordForm(true);
      setLoginWindowOpen(true);
    }
    else if (location.hash === '#password-reset-email') {
      setShowEmailPasswordResetPanel(true);
      setLoginWindowOpen(true);
    }  
    
    else if (location.hash.startsWith('#verify-email-')) {
      const token = location.hash.replace('#verify-email-', '');
      setVerificationToken(token);
      setShowVerificationPanel(true);
      setLoginWindowOpen(true);
    }
  }, [location.hash, isOpen, fetchCart, setLoginWindowOpen]);

  // 2. Эффект для обработки изменений хэша
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!isOpen && hash) {
        // Если панель закрыта, но есть хэш - открываем
        if (hash.startsWith('#password-reset')) {
          setLoginWindowOpen(true);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isOpen, setLoginWindowOpen]);

  // 3. Эффект для управления URL и состоянием
  useEffect(() => {
    if (!isOpen) return;
  
    // Сохраняем текущий хэш, если он уже есть
    const currentHash = window.location.hash;
    
    let newHash = currentHash; // По умолчанию оставляем текущий хэш
  
    // Проверка на необходимость обновления хэша:
      // 1. Если хэш отсутствует
      // 2. Или относится к внутренней логике работы панели
    if (!currentHash || 
        currentHash.startsWith('#password-reset') || 
        currentHash.startsWith('#verify-email') ||
        currentHash === '#signin' || 
        currentHash === '#signup' ||
        currentHash === '#cart' ||
        currentHash === '#empty-cart') {
      
       // Определение нового хэша на основе текущего состояния компонента
      if (showNewPasswordForm) {
        newHash = `#password-reset-confirm-${resetToken}`;
      }
      else if (showEmailPasswordResetPanel) {
        newHash = '#password-reset-email';
      }
      else if (showVerificationPanel) {
        newHash = `#verify-email-${verificationToken}`;
      }
      else if (isLoginWindowOpen) {
        newHash = loginRegisterChoice ? '#signup' : '#signin';
      }
      else if (cart?.items?.length > 0) {
        newHash = '#cart';
      } else {
        newHash = '#empty-cart';
      }
    }
  
    // Обновляем URL только если хэш изменился
    if (window.location.hash !== newHash) {
      navigate(`${location.pathname}${newHash}`, { replace: true });
    }
  
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = '' };
  }, [isOpen, showNewPasswordForm, showEmailPasswordResetPanel, showVerificationPanel,
      isLoginWindowOpen, loginRegisterChoice, cart?.items?.length, resetToken, 
      verificationToken, location.pathname, navigate]);

  // 4. Функция закрытия панели
  const handleClose = () => {
    setLoginWindowOpen(false);
    setUseRegistrationPanel(false);
    setShowEmailPasswordResetPanel(false);
    setShowAddressForm(false);
    resetForm();
    onClose();
    
    // Удаление только служебных хэшей, относящихся к панели
    const currentHash = window.location.hash;
    if (currentHash.startsWith('#password-reset') || 
        currentHash.startsWith('#verify-email') ||
        currentHash === '#signin' || 
        currentHash === '#signup' ||
        currentHash === '#cart' ||
        currentHash === '#empty-cart') {
      navigate(location.pathname, { replace: true });
    }
  };

  const sidebarStatus = () => {
    let status;
    
    if (showAddressForm) {
      return <AddressPanel onClose={handleClose} />;
    }
    if (showVerificationPanel) {
      return <AuthPanels.EmailVerificationPanel 
        token={verificationToken}
        onSuccess={() => {
          setShowVerificationPanel(false);
          setLoginWindowOpen(false);
        }}
        onBack={() => setShowVerificationPanel(false)}
      />;
    }
    if (showNewPasswordForm) {
      return <AuthPanels.NewPasswordForm 
        token={resetToken}
        onSuccess={() => {
          setShowNewPasswordForm(false);
          setShowEmailPasswordResetPanel(false);
          setLoginWindowOpen(false);
        }}
        onBack={() => setShowNewPasswordForm(false)}
      />;
    }
    if (showEmailPasswordResetPanel) {
      return <AuthPanels.PasswordResetEmailForm 
        onBack={() => setShowEmailPasswordResetPanel(false)}
        onSuccess={(token) => {
          setResetToken(token);
          setShowNewPasswordForm(true);
        }}
      />;
    } if (isLoginWindowOpen) {
      status = <AuthPanels.RegisterUser 
      loginRegisterChoice = {loginRegisterChoice} 
      setLoginRegisterChoice={setLoginRegisterChoice}
      onPasswordResetClick={() => setShowEmailPasswordResetPanel(true)}
      onVerificationStart={(token) => {
        setVerificationToken(token);
        setShowVerificationPanel(true);
      }}/>;
    } else {
      if (cart?.items?.length > 0) {
        status =
          <CartPanels.ShoppingCart
          setUseRegistrationPanel={setUseRegistrationPanel}
          useRegistrationPanel={useRegistrationPanel}
          loginRegisterChoice={loginRegisterChoice}
          setLoginRegisterChoice={setLoginRegisterChoice}
          setShowEmailPasswordResetPanel={setShowEmailPasswordResetPanel}
          setVerificationToken={setVerificationToken}
          setShowVerificationPanel={setShowVerificationPanel}
          setLoginWindowOpen={setLoginWindowOpen}
          />;
      } else {
        status = <CartPanels.EmptyCart />;
      }
    }
    return status;
  };

  return (
    <div className={`${isOpen ? 'side-panel-open' : 'side-panel'}`}>
      <div className='handleClickOutside' onClick={handleClose}></div>
      <div className={ isOpen ? 'content-block-open' : 'content-block'} >
        <div className='content'> 
          <img src='/img/close__square__light.svg' className='close__btn' onClick={handleClose} alt=''></img>
          {sidebarStatus()}
        </div>
      </div>
    </div>
  );
}

export default SidePanel;