
import { useState } from 'react';
import { useToast } from '../components/ui/ToastProvider';


export function useForm(initialValues, onSubmit) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Функция для обработки изменения данных в полях формы
  const handleChange = (event) => {
    const { name, value } = event.target;
    // Обновляем состояние formData, добавляя или изменяя значение поля
    setFormData((formData) => ({ ...formData, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9+]/g, '');
    if (!value.startsWith('+7')) value = '+7' + value.replace(/^\+/, '');
    if (value.length > 12) value = value.substring(0, 12);
    
    handleChange({ target: { name: 'phone', value } });
  };

   // Функция для обработки отправки формы
   const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
  
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка при регистрации:', error); 

       // Проверяем, если ошибка содержит сообщение, показываем его
      if (error.message) {
        showToast(error.message, 'error');
      } else if (error.response && error.response.data) {
        // Если сервер вернул ошибки в виде поля "detail"
        const errorData = error.response.data;
        if (errorData.detail) {
          showToast(errorData.detail, 'error');
        } else {
          showToast('Произошла ошибка. Попробуйте еще раз.', 'error');
        }
      } else {
        // Если ошибка вообще не передается или не имеет стандартного формата
        showToast('Неизвестная ошибка', 'error');
      }
  } finally {
    setIsSubmitting(false);
  }
};
  

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
    setErrors,
    handlePhoneChange
  };
}