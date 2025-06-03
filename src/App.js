import './css/GeneralStyles.css';

import MainPage from './layouts/MainPage';
import Catalog from './layouts/Catalog'
import Sale from "./layouts/Sale";
import AboutUs from "./layouts/AboutUs";
import Contact from "./layouts/Contact";
import Account from './layouts/Account';
import AdminDashboard from './layouts/AdminDashboard';
import CheckOut from './layouts/CheckOut';
import ProfileEditPage from './layouts/ProfileEditPage';


import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"; 
import ProductPage from './layouts/ProductPage';
import CartContextProvider from './contexts/CartContext';
import { ApiProvider } from './contexts/ApiContexts';
import { UserProvider } from './contexts/UserContext';
import { ProductCardProvider } from './contexts/ProductCardContext';
import { ProtectedRoute } from './utils/ProtectedRoute';
import { ToastProvider } from './components/ui/ToastProvider';
import { PreLoaderProvider } from './contexts/PreLoaderContext';
import { AddressProvider } from './contexts/AddressContext';
import PreLoader from './components/PreLoader';


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage/>,
  },
  {
    path: "/catalog",
    element: <Catalog/>,
  },
  {
    path: "/aboutUs",
    element: <AboutUs/>
  },

  {
    path: "/sale",
    element: <Sale/>
  },

  {
    path: "/contact",
    element: <Contact/>
  },
  {
    path: "/product/:id",
    element: <ProductPage/>
  },
  {
    path: "/checkout",
    element: <CheckOut/>
  },
  {
    path: "/account",
    element:   (
      <ProtectedRoute allowedRoles={['user']}>
        <Account/>
      </ProtectedRoute>
    )
  },
  {
    path: "/admin",
    element:   (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard/>
      </ProtectedRoute>
    )
  },
  {
    path: "/account/edit",
    element: (
      <ProtectedRoute>
        <ProfileEditPage/>
      </ProtectedRoute>
    )
  }

]);


function App() {
  return (
    <>
      <PreLoaderProvider>
        <PreLoader/> 
        <ToastProvider>
          <ApiProvider>
            <UserProvider>
              <AddressProvider>
                <ProductCardProvider> 
                  <CartContextProvider>
                    <RouterProvider router={router} />
                  </CartContextProvider>
                </ProductCardProvider>
              </AddressProvider>
            </UserProvider>
          </ApiProvider>
        </ToastProvider>
      </PreLoaderProvider>
    </>
  );
}

export default App;
