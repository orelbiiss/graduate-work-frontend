import { apiRequest } from './base';

export const catalogApi = {
  // Секции
  getSections: () => 
    apiRequest('/sections/', 'GET'),

  getSectionById: (sectionId, page = 1, perPage = 20) =>
    apiRequest(`/sections/${sectionId}?page=${page}&per_page=${perPage}`, 'GET'),
  
  createSection: (title, image) => {
    const formData = new FormData();
    formData.append('title', title);
    if (image) {
      formData.append('image', image);
    }
    return apiRequest('/sections', 'POST', formData);
  },
  
  deleteSection: (sectionId) =>
    apiRequest(`/sections/${sectionId}`, 'DELETE'),

  // Напитки
  getDrink: (drinkId) =>
    apiRequest(`/product/${drinkId}`, 'GET'),

  getRandomDrinksBySection: (limit = 10) =>
    apiRequest(`/drinks/random/?limit=${limit}`, 'GET'),
  
  createDrink: (
    name,
    ingredients,
    productDescription,
    sectionId,
    volumePrices,
    globalSale,
    image
  ) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('ingredients', ingredients);
    formData.append('product_description', productDescription);
    formData.append('section_id', sectionId);
    formData.append('volume_prices', JSON.stringify(volumePrices));
    if (globalSale) {
      formData.append('global_sale', globalSale.toString());
    }
    if (image) {
      formData.append('image', image);
    }
    return apiRequest('/drinks/', 'POST', formData);
  },
  
  updateDrink: (
    drinkId,
    updates
  ) => {
    const formData = new FormData();
    if (updates.name) formData.append('name', updates.name);
    if (updates.ingredients) formData.append('ingredients', updates.ingredients);
    if (updates.quantity) formData.append('quantity', updates.quantity.toString());
    if (updates.productDescription) formData.append('product_description', updates.productDescription);
    if (updates.sectionId) formData.append('section_id', updates.sectionId);
    if (updates.sale) formData.append('sale', updates.sale.toString());
    if (updates.volumePrices) {
      formData.append('volume_prices', JSON.stringify(updates.volumePrices));
    }
    if (updates.image) {
      formData.append('image', updates.image);
    }
    return apiRequest(`/drinks/${drinkId}`, 'PATCH', formData);
  },
  
  deleteDrink: (drinkId) =>
    apiRequest(`/drinks/${drinkId}`, 'DELETE'),

  // напитки
  getDrinks: () => 
    apiRequest('/drinks/', 'GET'),
};