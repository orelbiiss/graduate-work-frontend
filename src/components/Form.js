import '../css/Form.css';
import { useForm } from '../hooks/useForm';
import { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { userApi } from '../api/user';
import { useUser } from '../contexts/UserContext';
import { saveUserToLocalStorage } from '../utils/localStorageUtils';
import { useToast } from '../components/ui/ToastProvider';
import { useNavigate } from 'react-router-dom'; 

function RegistrationForm({ initialData = null }) {
  
  const [formInitialized, setFormInitialized] = useState(false);
  const [originalData, setOriginalData] = useState(initialData);
  const { user, setUser } = useUser();
  const { showToast } = useToast();


  const { formData, errors, isSubmitting, handleChange, handleSubmit, setFormData, handlePhoneChange } = useForm({
    last_name: '',
    first_name: '',
    middle_name: '',
    gender: 'unspecified',
    birth_date: '',
    phone: '+7',
    email: '',
    password: '',
    confirm_password: ''
  }, async (formData) => {
    
    
    // Валидация
    if (!/^\+7\d{10}$/.test(formData.phone)) {
      throw { 
        status: 422,
        errors: { phone: 'Номер должен быть в формате +7XXXXXXXXXX' } 
      };
    }

    // Если данные не исходные (не редактируем профиль), проверяем пароль
    if (!originalData) {
      if (formData.password !== formData.confirm_password) {
        throw {
          status: 422,
          errors: { confirm_password: 'Пароли не совпадают' }
        };
      }
      
      if (formData.password.length < 6) {
        throw {
          status: 422,
          errors: { password: 'Пароль должен содержать минимум 6 символов' }
        };
      }
    }
      
     // Подготовка данных для отправки на сервер
      const userData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name,
        gender: formData.gender,
        birth_date: formData.birth_date,
        phone: formData.phone
      };

      console.log('Отправляемые данные:', userData);

      try {

        // Если это редактирование профиля
        if (originalData) {
          // Нормализация данных (удаление пробелов и проверка равенства)
          const normalize = (val) => {
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') return val.trim();
            return val;
          };
  
          const isEqual = Object.keys(userData).every((key) => {
            return normalize(originalData[key]) === normalize(userData[key]);
          });
      
          if (isEqual) {
            showToast('Никаких изменений не было внесено', 'info');
            return;
          }
          
          // Обновление данных пользователя через API
          await userApi.updateProfile(userData);
          setUser(prev => ({ ...prev, ...userData }));
          saveUserToLocalStorage({ ...user, ...userData });
          setOriginalData(userData);
      
          showToast('Профиль успешно обновлён', 'success' );

        } else {

          // Если регистрация, то регистрация через API
          const response = await authApi.signUp(userData);
          showToast('Регистрация прошла успешно! Проверьте вашу почту для подтверждения.', 'success');
        }
      } catch (error) {
        throw error;

      }
    }      
  )

  useEffect(() => {
    if (initialData && !formInitialized) {
      const normalized = {
        last_name: initialData.last_name || '',
        first_name: initialData.first_name || '',
        middle_name: initialData.middle_name || '',
        gender: initialData.gender || 'unspecified',
        birth_date: initialData.birth_date || '',
        phone: initialData.phone || '+7',
        email: initialData.email || ''
      };

      setFormData({
        ...normalized,
        password: '',
        confirm_password: ''
      });

      setOriginalData(normalized);
      setFormInitialized(true);
    }
  }, [initialData, formInitialized, setFormData]);


  

  return (
    <form onSubmit={handleSubmit}>
      
      <div className='personal__info'>

        <p className='section__description'>личная информация</p>
        
        <InputField id='lastname' name='last_name' placeholder='Фамилия' required
          value={formData.last_name}
          onChange={handleChange}
          error={errors.last_name}
        />
        
        <InputField id='name' name='first_name' placeholder='Имя' value={formData.first_name} required
          onChange={handleChange}
          error={errors.first_name}
        />
        
        <InputField id='patronymic' name='middle_name' placeholder='Отчество'
          value={formData.middle_name}
          onChange={handleChange}
          error={errors.middle_name}
        />
        
        <GenderSelection 
          value={formData.gender}
          onChange={handleChange}
          error={errors.gender}
        />

        <p className='section__description'>дата рождения</p>
        <InputField id='birth__date' name='birth_date' type='date' required
          value={formData.birth_date}
          onChange={handleChange}
          error={errors.birth_date}
          max={new Date().toISOString().split('T')[0]}
        />

        <p className='section__description'>контакты</p>
        <InputField id='phone' name='phone' type='tel' placeholder='Телефон'
          value={formData.phone}
          onChange={handlePhoneChange}
          error={errors.phone}
        />
        
        <InputField id='email' name='email' type='email' placeholder='Почта'  required
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        {!originalData && (
          <>
            <p className='section__description'>безопасность</p>
            <InputField id='password' name='password' type='password' placeholder='Пароль' required
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            
            <InputField id='confirm__password' name='confirm_password' type='password' placeholder='Повторите пароль' required
              value={formData.confirm_password}
              onChange={handleChange}
              error={errors.confirm_password}
            />
          </>
        )}
        
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
        
        <button 
          type='submit' 
          className='btn-filled-sidebar'
          disabled={isSubmitting}
        >
          {originalData ? 'Сохранить изменения' : 
          'Зарегистрироваться'
          }
        </button>
      </div>
    </form>
  );
}

function InputField({ id, name, type = 'text', placeholder, value, onChange, required, error,pattern }) {

  return (
    <div className='input__container'>
      {required && <img className='necessarily' src='/img/Star.svg' alt='Required' />}
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        pattern={pattern}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function GenderSelection({ value, onChange, error }) {
  return (
    <div className='radio'>
      <div className='radio__choice'>
        <input type='radio' id='female' name='gender' value='female'
          checked={value === 'female'}
          onChange={onChange}
        />
        <label htmlFor='female' className='label__reg'>Женщина</label>
      </div>
      <div className='radio__choice'>
        <input type='radio' id='male' name='gender' value='male'
          checked={value === 'male'}
          onChange={onChange}
        />
        <label htmlFor='male' className='label__reg'>Мужчина</label>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default RegistrationForm;