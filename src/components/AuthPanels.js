import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useUser } from '../contexts/UserContext.js';
import { useForm } from '../hooks/useForm';
import Form from './Form.js';
import { loginAndLoadProfile } from '../utils/authUtils.js';
import { useToast } from '../components/ui/ToastProvider';
import { passwordApi } from '../api/password.js';
import { authApi } from '../api/auth';
import { saveUserToLocalStorage } from '../utils/localStorageUtils';

function RegisterUser({loginRegisterChoice, setLoginRegisterChoice, onPasswordResetClick }){

    return (
        <>
        <div className='registration__container'>
            <p className='registration__title'>войти или</p>
            <p className='registration__title'>зарегистрироваться</p>
            <div className='loginRegisterChoice'>
            <p className={ loginRegisterChoice ? 'login' : 'login-active'} onClick={() => setLoginRegisterChoice(false)}>вход</p> /
            <p className={ loginRegisterChoice ? 'register-active' : 'register'} onClick={() => setLoginRegisterChoice(true)}>регистрация</p>
            </div>

            { loginRegisterChoice ? <Form /> : 
                                    <LoginForm onPasswordResetClick = {onPasswordResetClick}/> }
        </div>
        </>
    )
}

function EmailVerificationPanel({ token, onSuccess, onBack }) {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const { showToast } = useToast();
    const { setUser } = useUser();
    const navigate = useNavigate();
    const requestSent = useRef(false);

    useEffect(() => {
        if (!token || requestSent.current) return;

        const verifyEmail = async () => {
        requestSent.current = true;
        setIsSubmitting(true);
        try {
            const response = await authApi.verifyEmail(token);
            if (response.status === 'success') {
            setIsVerified(true);
            showToast('Email успешно подтвержден. Регистрация завершена', 'success');

            const profile = await authApi.getProfile();
            saveUserToLocalStorage(profile);
            setUser(profile);

            // Таймер обратного отсчета
            const timer = setInterval(() => {
                setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    onSuccess();
                    navigate('/account');
                }
                return prev - 1;
                });
            }, 1000);
            }
        } catch (error) {
            setError(error.response?.data?.detail || 'Ошибка подтверждения email');
        } finally {
            setIsSubmitting(false);
        }
        };

        verifyEmail();
    }, [token, onSuccess, showToast, setUser, navigate]);

    return (
        <div className='registration__container'>
        <p className='registration__title'>Подтверждение email</p>

        {isSubmitting ? (
            <p className='text__description'>Идет подтверждение...</p>
        ) : error ? (
            <>
            <div className='email-verified'>
                <img className='error-block-img' src='/img/icon-error.svg' alt=''/>
                <p className='error-text'>{error}</p>
            </div>
            <button className='back-to-login-btn' onClick={onBack}>
                ← Вернуться назад
            </button>
            </>
        ) : isVerified ? (
            <div className='success-block'>
            <div className='email-verified'>
                <img className='success-block-img' src='/img/icon-success.svg' alt='Успешно' />
                <p className='confirmation-message'>Email успешно подтвержден. Регистрация завершена</p>
            </div>
            <p className='success-text'>Спасибо за регистрацию!</p>
            <p className='redirect-message'>Сейчас вы будете автоматически перенаправлены в профиль</p>
            <div className='circle-timer'>
                {[5, 4, 3, 2, 1].map((n) => (
                <span key={n} className={`circle ${countdown === n ? 'active' : ''}`}>
                    {n}
                </span>
                ))}
            </div>
            </div>
        ) : (
            <p className='text__description'>Проверяем токен подтверждения...</p>
        )}
        </div>
    );
}

function PasswordResetEmailForm({ onBack }) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(0); // Таймер в секундах
    const [requestSent, setRequestSent] = useState(false); 
    const { showToast } = useToast();



    // Запуск таймера
    useEffect(() => {
        let interval;
        if (timer > 0) {
        interval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Форматирование времени в MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
        // Здесь будет запрос на восстановление пароля
        // Искусственная задержка + реальный запрос
        await Promise.all([ passwordApi.initiatePasswordReset(email),
            new Promise(resolve => setTimeout(resolve, 1000)) // Минимальная задержка 1 сек
        ]);
        showToast('Инструкции отправлены на ваш email', 'success');
        setTimer(90); // Устанавливаем таймер на 1.5 минуты (90 секунд)
        setRequestSent(true);
        } catch (error) {
        showToast(error.response?.data?.message || 'Ошибка при отправке', 'error');
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <div className='registration__container'>
        <p className='registration__title'>Восстановление</p>
        <p className='registration__title'>пароля</p>
        <p className='text__description'>
            введите email,<b> указанный при регистрации</b>. На него будет отправлена ссылка для сброса пароля
        </p>
        <form className='main__input__container' onSubmit={handleSubmit}>
            <div className='input__container'>
            <input 
                id='email' 
                name='email'
                type="email"
                placeholder="введите email для восстановления"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>
            <div className="resend-container">
            {requestSent && timer > 0 && (
                <span className="resend-timer">
                    отправить повторно через {formatTime(timer)}
                </span>
            )}
            </div>
            <button className={requestSent && timer > 0 ? 'btn-filled-sidebar-disabled' : 'btn-filled-sidebar' } type="submit" disabled={isSubmitting || timer > 0}>
            {isSubmitting ? 'Отправка...' : requestSent ? 'Отправить запрос повторно' : 'Отправить инструкции'}
            </button>
        </form>
        <button className='back-to-login-btn' onClick={onBack}>
            ← вернуться к входу
        </button>
        </div>
    );
}

function NewPasswordForm({ token, onSuccess, onBack }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
        }

        setIsSubmitting(true);
        setError('');

        try {
        // Вызов API для сброса пароля
        await passwordApi.confirmPasswordReset(token, newPassword);
        
        showToast('Пароль успешно изменён! Теперь вы можете войти с новым паролем.', 'success');
        
        // Через 2 секунды закрываем форму
        setTimeout(() => {
            onSuccess();
        }, 2000);
        
        } catch (error) {
        console.error('Password reset error:', error);
        
        const backendError = error.response?.data?.detail || 
                            error.message || 'unknown_error';

        // Справочник человекочитаемых сообщений
        const ERROR_MESSAGES = {
            // Стандартные ошибки бэкенда
            invalid_link: {
            title: 'Недействительная ссылка',
            message: 'Эта ссылка для сброса пароля не работает. Попробуйте запросить новую.'
            },
            expired_link: {
            title: 'Ссылка устарела',
            message: 'Срок действия ссылки истёк (действует 15 минут). Запросите новую ссылку.'
            },
            already_used: {
            title: 'Ссылка использована',
            message: 'Вы уже использовали эту ссылку. Каждая ссылка работает только один раз.'
            },
            
            unknown_error: {
            title: 'Ошибка',
            message: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте ещё раз.'
            }
        };

        const { title, message } = ERROR_MESSAGES[backendError] || ERROR_MESSAGES.unknown_error;
        
        showToast(title, 'error');
        setError(message);
        } finally {
        setIsSubmitting(false);
        }
    };
    

    return (
        <div className='registration__container'>
        <p className='registration__title'>Новый пароль</p>
            <form className='main__input__container' onSubmit={handleSubmit}>
            <div className='input-group'>
                <div className='input__container'>
                <input type="password" id='password' placeholder="Новый пароль" required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength="8"
                />
                </div>
                
                <div className='input__container'>
                <input type="password" id='confirm__password' placeholder="Подтвердите пароль" required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength="8"
                />
                </div>
            
            </div>
            
            {error && <div className="error-message">{error}</div>}
            <button 
                className='btn-filled-sidebar' 
                type="submit" 
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Сохранение...' : 'Сохранить пароль'}
            </button>
            </form>
            
            <button className='back-to-login-btn' onClick={onBack}>
            ← назад
            </button>
        </div>
    );
    }

    const initialValues = {
    email: '',
    password: ''
    };

    function LoginForm({ onPasswordResetClick }) {

    const navigate = useNavigate();
    const { setUser } = useUser();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);


    // Функция для обработки входа
    const onSubmit = async (formData) => {
        setIsLoading(true);

        try {

        await loginAndLoadProfile(formData.email, formData.password, setUser, navigate);

        } catch (error) {
        console.error('Login error:', error);

        let errorMessage = 'Ошибка при входе';
        
        if (error.response) {
            // Если есть ответ от сервера
            const { status, data } = error.response;
            
            if (status === 400) {
            // Ошибки валидации или аутентификации
            if (data.detail === "Пользователь не найден") {
                errorMessage = "Пользователь с таким email не найден";
            } else if (data.detail === "Неверный пароль") {
                errorMessage = "Неверный пароль";
            } else if (data.detail) {
                errorMessage = data.detail;
            }
            } else if (status === 500) {
            errorMessage = "Ошибка сервера, попробуйте позже";
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        showToast(errorMessage, 'error')
        } finally {
            setIsLoading(false);
        }
    };

    const {
        formData,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit
    } = useForm(initialValues, onSubmit);

    return (
        <form className='main__input__container' onSubmit={handleSubmit}>
        <div className='input-group'>
            <div className='input__container'>
            <label className='label__reg'></label>
            <input 
                id="email"
                type="email" 
                name="email" 
                placeholder='e-mail' 
                value={formData.email}
                onChange={handleChange}
                required 
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className='input__container'>
            <label className='label__reg'></label>
            <input 
                id="password"
                type="password" 
                name="password" 
                placeholder='пароль' 
                value={formData.password}
                onChange={handleChange}
                required 
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
            <p className='recover-password' onClick={onPasswordResetClick}>восстановить пароль</p>
            </div>
        </div>
        {errors.general && <div className="error-message">{errors.general}</div>}
        <button 
            className='btn-filled-sidebar' 
            type="submit"
            disabled={isSubmitting}
        >
            {isLoading ? ('Вход...') : 'Войти'}
        </button>
        </form>
    );
}

// Объект для экспорта всех компонентов аутентификации
const AuthPanels = {
    EmailVerificationPanel,
    PasswordResetEmailForm,
    NewPasswordForm,
    RegisterUser,
    LoginForm
};
  
export default AuthPanels;