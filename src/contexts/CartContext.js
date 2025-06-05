import React, { createContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart';
import { useUser } from './UserContext';

export const CartContext = createContext();

function CartContextProvider({ children }) {
  const [cart, setCart] = useState({
    id: null,
    user_id: null,
    cart_discount: 0,
    cart_subtotal: 0,
    cart_total: 0,
    cart_quantity: 0,
    items: []
  });
  const [isLoginWindowOpen, setLoginWindowOpen] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

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

  useEffect(() => {
    if (!user || user.role === 'admin') return;
    fetchCart();
    setLoginWindowOpen(false);
  }, [fetchCart, user]);

  const addToCart = async (item, volume) => {
    try {
      const selectedVolume = volume === 0 ? item.volumes[0] : volume;
      const volumePrice = item.volumePrices.find(vp => vp.volume === selectedVolume);

      // Оптимистичное обновление
      setCart(prevCart => {
        const existingItemIndex = prevCart.items.findIndex(
          cartItem => cartItem.drink_volume_price_id === volumePrice.id
        );

        let newItems;
        if (existingItemIndex >= 0) {
          newItems = [...prevCart.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + 1
          };
        } else {
          newItems = [
            ...prevCart.items,
            {
              id: Date.now().toString(),
              drink_volume_price_id: volumePrice.id,
              drink_id: item.id,
              drink_name: item?.name,
              img_src: item?.image,
              ingredients: item.ingredients, 
              volume: selectedVolume,
              price: volumePrice.price,
              price_original: volumePrice.price,
              price_final: volumePrice.price,
              sale: 0,
              quantity: 1,
              subtotal: volumePrice.price
            }
          ];
        }

        const newQuantity = prevCart.cart_quantity + 1;
        const newSubtotal = prevCart.cart_subtotal + volumePrice.price;
        const newTotal = newSubtotal - (prevCart.cart_discount || 0);

        return {
          ...prevCart,
          items: newItems,
          cart_quantity: newQuantity,
          cart_subtotal: newSubtotal,
          cart_total: newTotal
        };
      });

      const requestData = {
        drink_volume_price_id: volumePrice.id,
        quantity: 1
      };

      await cartApi.addToCart(requestData);
      await fetchCart(); // Синхронизация с сервером после успешного запроса
    } catch (err) {
      // Откат изменений при ошибке
      fetchCart();
      setError(err.message);
      if (err.response?.status === 401) {
        setLoginWindowOpen(true);
      }
    }
  };

  const removeOneItem = async (item) => {
    try {
      // Оптимистичное обновление
      setCart(prevCart => {
        const itemIndex = prevCart.items.findIndex(cartItem => cartItem.id === item.id);
        if (itemIndex === -1) return prevCart;

        const newItems = [...prevCart.items];
        const currentItem = newItems[itemIndex];

        if (currentItem.quantity <= 1) {
          return prevCart; // Для полного удаления используем removeFromCart
        }

        newItems[itemIndex] = {
          ...currentItem,
          quantity: currentItem.quantity - 1,
          subtotal: currentItem.price * (currentItem.quantity - 1)
        };

        const newQuantity = prevCart.cart_quantity - 1;
        const newSubtotal = prevCart.cart_subtotal - currentItem.price;
        const newTotal = newSubtotal - (prevCart.cart_discount || 0);

        return {
          ...prevCart,
          items: newItems,
          cart_quantity: newQuantity,
          cart_subtotal: newSubtotal,
          cart_total: newTotal
        };
      });

      await cartApi.decrementItem(item.id);
      await fetchCart();
    } catch (err) {
      fetchCart();
      setError(err.message);
      if (err.response?.status === 401) {
        setLoginWindowOpen(true);
      }
    }
  };

  const removeFromCart = async (item) => {
    try {
      // Оптимистичное обновление
      setCart(prevCart => {
        const itemIndex = prevCart.items.findIndex(cartItem => cartItem.id === item.id);
        if (itemIndex === -1) return prevCart;

        const removedItem = prevCart.items[itemIndex];
        const newItems = prevCart.items.filter(cartItem => cartItem.id !== item.id);

        const newQuantity = prevCart.cart_quantity - removedItem.quantity;
        const newSubtotal = prevCart.cart_subtotal - removedItem.subtotal;
        const newTotal = newSubtotal - (prevCart.cart_discount || 0);

        return {
          ...prevCart,
          items: newItems,
          cart_quantity: newQuantity,
          cart_subtotal: newSubtotal,
          cart_total: newTotal
        };
      });

      await cartApi.removeCartItem(item);
      await fetchCart();
    } catch (err) {
      fetchCart();
      setError(err.message);
    }
  };

  const clearCart = async () => {
    try {
      // Оптимистичное обновление
      setCart(prevCart => ({
        ...prevCart,
        items: [],
        cart_quantity: 0,
        cart_subtotal: 0,
        cart_total: 0,
        cart_discount: 0
      }));

      await cartApi.clearCart();
      await fetchCart();
    } catch (err) {
      fetchCart();
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