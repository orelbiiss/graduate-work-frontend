import { useEffect, useState } from 'react';
import '../css/AccauntLayout.css';
import { useUser } from '../contexts/UserContext';


function PersonalIdentificationBlock({ onEditClick }) {
    const { user } = useUser(); // Получаем данные пользователя из контекста
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    useEffect(() => {
        if (user) {
          setFirstName(user?.first_name); // Устанавливаем имя из данных пользователя
          setLastName(user?.last_name); // Устанавливаем фамилию из данных пользователя
        }
      }, [user]);


    return (
        <div className='personal-identification'>
            <div className='personal-identificatio-txt-img'>
                <img src='/img/avatar.svg' onClick={onEditClick} alt="avatar" />
                <div className='personal-identification-text'>
                    <p className='first-name' onClick={onEditClick}>{firstName}</p> 
                    <p className='last-name' onClick={onEditClick}>{lastName}</p> 
                </div>
            </div>
        </div>
    );
}

export default PersonalIdentificationBlock;
