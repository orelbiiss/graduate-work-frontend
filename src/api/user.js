import { apiRequest } from './base';


export const userApi = {
  getProfile() {
    return apiRequest('/user/profile', 'GET');
  },


  updateProfile(userData) {
    return apiRequest('/user/profile', 'PATCH', userData);
  },

 
  changePassword({ current_password, new_password }) {
    return apiRequest('/user/change-password', 'POST', {
      current_password,
      new_password
    });
  },

  
  deleteAccount() {
    return apiRequest('/user/profile', 'DELETE');
  },
};