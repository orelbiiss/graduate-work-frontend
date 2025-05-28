import React, { createContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart';
import { useUser } from './UserContext';

export const CartContext = createContext();

function CartContextProvider({ children }) {

  // Состояние корзины
  const [cart, setCart] = useState({
    id: null,
    user_id: null,
    cart_discount: null,
    cart_subtotal: null,
    cart_total: null,
    cart_quantity: null,
    items: []
  });
  const [isLoginWindowOpen, setLoginWindowOpen] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // загрузка корзины пользователя с сервера
  const fetchCart = useCallback(async () => {
    try {
      
      const response = await cartApi.getCart();
      setCart({
        id: response?.id || 'guest',
        user_id: response?.user_id || null,
        cart_discount: response?.cart_discount || 0,
        cart_subtotal: response?.cart_subtotal || 0,
        cart_total: response?.cart_total || 0,
        cart_quantity: response?.cart_quantity || 0,
        items: Array.isArray(response?.items) ? response.items : []
      });
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('Неавторизованный пользователь - корзина сохранена');
      } else {
        setError(err.message);
      }
    } 
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Автоматическая загрузка при изменении пользователя
  useEffect(() => {
    if (!user || user.role === 'admin') return;
      fetchCart();
      setLoginWindowOpen(false);
  }, [fetchCart, user]);

  // добавление товара в корзину 
  const addToCart = async (item, volume) => {
    try {

      // определение выбранного объема
      const selectedVolume = volume === 0 ? item.volumes[0] : volume;
      const volumePrice = item.volumePrices.find(vp => vp.volume === selectedVolume);


      const requestData = {
        drink_volume_price_id: volumePrice.id,
        quantity: 1
      };

      // отправление запроса с обновлением корзины
      await cartApi.addToCart(requestData);
      await fetchCart(); 
    } catch (err) {
      setError(err.message);
      if (err.response?.status === 401) {
        setLoginWindowOpen(true);
      }
    } 
  };

  // Уменьшение количества товара на 1 единицу
  const removeOneItem = async (item) => {
    try {
      
      // Используем специальный эндпоинт для уменьшения количества
      await cartApi.decrementItem(item.id);
      await fetchCart();
    } catch (err) {
      setError(err.message);
      if (err.response?.status === 401) {
        setLoginWindowOpen(true);
      }
    } 
  };

  // Полное удаление позиции из корзины (независимо от количества)
  const removeFromCart = async ( item ) => {
    try {
      await cartApi.removeCartItem(item);
      await fetchCart();
    } catch (err) {
      setError(err.message);
    } 
  };

  // полная очистка корзины 
  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      await fetchCart();
    } catch (err) {
      setError(err.message);
    } 
  };

  return (
    <CartContext.Provider value={{
      cart,
      fetchCart, 
      addToCart,
      removeOneItem,
      removeFromCart,
      clearCart,
      isLoginWindowOpen,
      setLoginWindowOpen,
      error
    }}>
      {children}
    </CartContext.Provider>
  );
}

export default CartContextProvider;