import '../css/Footer.css';

function Footer(){
    return(
        <footer className="footer">
            <div className="main__info">
                <div className="first__block">
                    <img src="img/footer__logo.svg" alt=''/>
                </div>
                <div className="second__block">
                    <p className="block__title">Информация</p>
                    <a href="aboutUs.html" className="second__block__text">
                        О нас
                    </a>
                    <a href="sale.html" className="second__block__text">
                        Акции
                    </a>
                    <a href="" className="second__block__text">
                        Клиентсике дни
                    </a>
                    <a href="" className="second__block__text">
                        Магазины
                    </a>
                    <a href="" className="second__block__text">
                        Доставка и оплата
                    </a>
                    <a href="" className="second__block__text">
                        Вакансии
                    </a>
                </div>
                <div className="third__block">
                <div className="contact">
                    <p className="block__title">Контакты</p>
                    <div className="third__block__info">
                    <div className="phone__number">
                        <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <path
                            d="M17.7071 13.7071L20.3552 16.3552C20.7113 16.7113 20.7113 17.2887 20.3552 17.6448C18.43 19.57 15.3821 19.7866 13.204 18.153L11.6286 16.9714C9.88504 15.6638 8.33622 14.115 7.02857 12.3714L5.84701 10.796C4.21341 8.61788 4.43001 5.56999 6.35523 3.64477C6.71133 3.28867 7.28867 3.28867 7.64477 3.64477L10.2929 6.29289C10.6834 6.68342 10.6834 7.31658 10.2929 7.70711L9.27175 8.72825C9.10946 8.89054 9.06923 9.13846 9.17187 9.34373C10.3585 11.7171 12.2829 13.6415 14.6563 14.8281C14.8615 14.9308 15.1095 14.8905 15.2717 14.7283L16.2929 13.7071C16.6834 13.3166 17.3166 13.3166 17.7071 13.7071Z"
                            stroke="#222222"
                        />
                        </svg>
                        <p className="third__block__text">+7(812)7010187</p>
                    </div>
                    <div className="e-mail">
                        <img src='/img/Message_light.svg' alt=''/>
                        <p className="third__block__text">zerop-spb@mail.ru</p>
                    </div>
                    <div className="working__hours">
                        <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        >
                        <circle cx={12} cy={12} r="8.5" stroke="#222222" />
                        <path
                            d="M16.5 12H12.25C12.1119 12 12 11.8881 12 11.75V8.5"
                            stroke="#222222"
                            strokeLinecap="round"
                        />
                        </svg>
                        <p className="third__block__text">Пн—Вс 10:00—19:00</p>
                    </div>
                    </div>
                </div>
                <div className="social__media">
                    <p className="block__title">Социальные сети</p>
                    <div className="social__media__icons__footer">
                        <a href="https://web.telegram.org/a/">
                            <img src='img/icon__tg.svg'className="icon__tg" alt='tg'></img>
                        </a>
                        <a href="https://web.whatsapp.com/">
                            <img src='img/icon__wa.svg' className="icon__wa" alt='wa'></img>
                        </a>
                        <a href="https://m.vk.com/">
                            <img src='img/icon__vk.svg' className="icon__vk" alt='vk'></img>
                        </a>
                    </div>
                </div>
                </div>
                <form action="#" className="form">
                <p className="block__title">ПОДПИШИСЬ НА РАССЫЛКУ</p>
                <div className="email__wrapper">
                    <div className="float-animate">
                        <input
                            type="email"
                            id="contact-float"
                            name="email"
                            className="float-animate-input"
                        />
                        <label htmlFor="contact-float" className="float-animate-label">
                            e-mail
                        </label>
                    </div>
                    <div className="checkbox">
                    <input
                        id="form__agreement"
                        type="checkbox"
                        className="checkbox__input"
                        defaultChecked=""
                    />
                    <label htmlFor="form__agreement" className="checkbox__label">
                        <span className="checkbox__label__text">
                        я ознакомился и согласен с{" "}
                        <span className="accent__text">
                            политикой обработки персональных данных
                        </span>
                        </span>
                    </label>
                    </div>
                    <button type="submit" className="form__button">
                        <span className="btn-filled-fullwidth">подписаться</span>
                    </button>
                </div>
                </form>
            </div>
            <div className="copyright">
                <p>© Интернет-магазин безалкогольных напитков «ЗероПресент» </p>
            </div>
            </footer>

    )
}

export default Footer;