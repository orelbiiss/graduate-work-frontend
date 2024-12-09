import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CartContextProvider, { CartContext } from '../layouts/CartContext';


describe('CartContextProvider', () => {
    // Тест: добавляет товар в корзину, если она пуста, и объем не указан
    it('добавляет товар в корзину, если она пуста, и объем не указан', () => {
      // Компонент TestComponent рендерит кнопку "Добавить в корзину" и отображает содержимое корзины
      const TestComponent = () => {
        const { addToCart, cart } = React.useContext(CartContext);
        return (
          <>
            <button onClick={() => addToCart({ id: '1', volume: '100мл', name: 'Test', price: 10 })}>Добавить в корзину</button>
            <div data-testid="cart">{JSON.stringify(cart)}</div>
          </>
        );
      };
  
      // Рендерим CartContextProvider с TestComponent внутри
      const { getByText, getByTestId } = render(
        <CartContextProvider>
          <TestComponent />
        </CartContextProvider>
      );
  
      // Нажимаем на кнопку "Добавить в корзину"
      fireEvent.click(getByText('Добавить в корзину'));
  
      // Проверяем, что товар добавлен в корзину и количество равно 1
      const cartContent = JSON.parse(getByTestId('cart').textContent);
      expect(cartContent.length).toBe(1);
      expect(cartContent[0].inBasket).toBe(1);
    });
  
    // Тест: увеличивает количество товара в корзине, если товар уже есть в корзине
    it('увеличивает количество товара в корзине, если товар уже есть в корзине', () => {
      // Компонент TestComponent рендерит кнопку "Добавить в корзину" и отображает содержимое корзины
      const TestComponent = () => {
        const { addToCart, cart } = React.useContext(CartContext);
        return (
          <>
            <button onClick={() => addToCart({ id: '1', volume: '100мл', name: 'Test', price: 10 })}>Добавить в корзину</button>
            <div data-testid="cart">{JSON.stringify(cart)}</div>
          </>
        );
      };
  
      // Рендерим CartContextProvider с TestComponent внутри
      const { getByText, getByTestId } = render(
        <CartContextProvider>
          <TestComponent />
        </CartContextProvider>
      );
  
      // Нажимаем дважды на кнопку "Добавить в корзину"
        fireEvent.click(getByText('Добавить в корзину'));
        fireEvent.click(getByText('Добавить в корзину'));
  
      // Проверяем, что количество товара увеличилось на 1
      const cartContent = JSON.parse(getByTestId('cart').textContent);
      expect(cartContent.length).toBe(1);
      expect(cartContent[0].inBasket).toBe(2); 
    });
  
    // Тест: добавляет новый товар в корзину
    it('добавляет новый товар в корзину', () => {
      // Компонент TestComponent рендерит кнопку "Добавить в корзину" и отображает содержимое корзины
      const TestComponent = () => {
        const { addToCart, cart } = React.useContext(CartContext);
        return (
          <>
            <button onClick={() => addToCart({ id: '2', volume: '200мл', name: 'Test2', price: 15 })}>Добавить в корзину</button>
            <div data-testid="cart">{JSON.stringify(cart)}</div>
          </>
        );
      };
  
      // Рендерим CartContextProvider с TestComponent внутри
      const { getByText, getByTestId } = render(
        <CartContextProvider>
          <TestComponent />
        </CartContextProvider>
      );
  
      // Нажимаем на кнопку "Добавить в корзину"
      fireEvent.click(getByText('Добавить в корзину'));
  
      // Проверяем, что новый товар добавлен в корзину
      const cartContent = JSON.parse(getByTestId('cart').textContent);
      expect(cartContent.length).toBe(1); // Здесь должно быть 1, так как корзина была пуста и мы добавили только один товар
    });
  });