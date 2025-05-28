// authHelpers.js (или authUtils.js)
import { authApi } from '../api/auth';
import { saveUserToLocalStorage } from './localStorageUtils';

export async function loginAndLoadProfile(email, password, setUser, navigate) {

  const userData = await authApi.signIn(email, password);
  
  if (userData && userData.role) {

    setUser(userData);
    saveUserToLocalStorage(userData);

    // Редирект по роли
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/account');
    }
  }
}


