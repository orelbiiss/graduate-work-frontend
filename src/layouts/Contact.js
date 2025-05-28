import Header from "../components/Header";
import '../css/ContactPage.css';
import Footer from '../components/Footer';

function Contact(){
  return(
    <>
      <Header/>
      <Main/>
      <Footer/>
    </>
  )
}

function Main(){
  return(
    <section className="u-clearfix u-white u-section-1" id="carousel_8fe0">
          <div className="u-custom-color-1 u-expanded-width u-shape u-shape-rectangle u-shape-1" />
          <div className="u-list u-list-1">
            <div className="u-repeater u-repeater-1">
              <div className="u-align-center u-container-style u-list-item u-radius-20 u-repeater-item u-shape-round u-white u-list-item-1">
                <div className="u-container-layout u-similar-container u-valign-top u-container-layout-1">
                  <span className="u-file-icon u-icon u-text-palette-1-base u-icon-1">
                    <img src="img/Pin_light.svg" alt="" />
                  </span>
                  <h5 className="u-text u-text-custom-color-4 u-text-1">
                    адрес
                  </h5>
                  <p className="u-text u-text-custom-color-4 u-text-2">
                    невский
                  </p>
                </div>
              </div>
              <div className="u-align-center u-container-style u-list-item u-radius-20 u-repeater-item u-shape-round u-white u-list-item-2">
                <div className="u-container-layout u-similar-container u-valign-top u-container-layout-2">
                  <span className="u-file-icon u-icon u-text-palette-1-base u-icon-2">
                    <img src="img/Phone_light.svg" alt="" />
                  </span>
                  <h5 className="u-text u-text-custom-color-4 u-text-3">
                    номер телефона
                  </h5>
                  <p className="u-text u-text-custom-color-4 u-text-4">
                    +7(812)7010187
                  </p>
                </div>
              </div>
              <div className="u-align-center u-container-style u-list-item u-radius-20 u-repeater-item u-shape-round u-white u-list-item-3">
                <div className="u-container-layout u-similar-container u-valign-top u-container-layout-3">
                  <span className="u-file-icon u-icon u-text-palette-1-base u-icon-3">
                    <img src="img/Time_light.svg" alt="" />
                  </span>
                  <h5 className="u-text u-text-custom-color-4 u-text-5">время работы</h5>
                  <p className="u-text u-text-custom-color-4 u-text-6">
                    Пн—Вс 10:00—19:00
                  </p>
                </div>
              </div>
              <div
                className="u-align-center u-container-style u-list-item u-radius-20 u-repeater-item u-shape-round u-white u-list-item-4"
              >
                <div className="u-container-layout u-similar-container u-valign-top u-container-layout-4">
                  <span className="u-file-icon u-icon u-text-palette-1-base u-icon-4">
                    <img src="img/Message_light.svg" alt="" />
                  </span>
                  <h5 className="u-text u-text-custom-color-4 u-text-7">E-mail</h5>
                  <p className="u-text u-text-8">
                    <a
                      href="mailto:hello@theme.com"
                      className="u-active-none u-border-1 u-border-no-left u-border-no-right u-border-no-top u-border-palette-1-base u-btn u-button-link u-button-style u-hover-none u-none u-text-palette-1-base u-btn-1"
                    >
                      zerop-spb@mail.ru
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="data-layout-selected u-clearfix u-layout-wrap u-layout-wrap-1">
            <div className="u-layout">
              <div className="u-layout-row">
                <div
                  className="u-container-style u-layout-cell u-left-cell u-size-30 u-layout-cell-1"
                >
                  <div className="u-container-layout u-valign-top u-container-layout-5">
                    <div className="u-form u-form-1">
                      <form
                        action="https://forms.nicepagesrv.com/v2/form/process"
                        className="u-clearfix u-form-spacing-30 u-form-vertical u-inner-form"
                        source="email"
                        name="form"
                      >
                        <div className="u-form-email u-form-group u-form-partition-factor-2">
                          <input
                            type="email"
                        
                            id="email-319a"
                            name="email"
                            className="u-border-2 u-border-no-left u-border-no-right u-border-no-top u-border-palette-1-base u-input u-input-rectangle u-text-grey-80"
                            required=""
                            wfd-id="id2061"
                          />
                          <label
                            htmlFor="email-319a"
                            className="u-label"
                          >
                            e-mail
                          </label>
                        </div>
                        <div className="u-form-group u-form-name u-form-partition-factor-2">
                          <input
                            type="text"
                            id="name-319a"
                            name="name"
                            className="u-border-2 u-border-no-left u-border-no-right u-border-no-top u-border-palette-1-base u-input u-input-rectangle u-text-grey-80"
                            required=""
                            wfd-id="id2062"
                          />
                          <label
                            htmlFor="name-319a"
                            className="u-label"
                          >
                            ФИО
                          </label>
                        </div>
                        <div className="u-form-group u-form-message">
                          <textarea
                            rows={4}
                            cols={50}
                            id="message-319a"
                            name="message"
                            className="u-message u-border-no-left u-border-no-right u-border-no-top u-border-palette-1-base u-input u-input-rectangle u-text-grey-80"
                            required=""
                          />
                          <label
                            htmlFor="message-319a"
                            className="u-label"
                          >
                            Сообщение
                          </label>
                        </div>
                        <div className="u-align-left u-form-group u-form-submit">
                          <a href="#" className="btn-filled-fullwidth">
                            Подписаться
                          </a>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div
                  className="u-align-left u-container-style u-layout-cell u-right-cell u-size-30 u-layout-cell-2"
                >
                  <div className="u-container-layout u-container-layout-6">
                    <h2 className="u-text u-text-custom-color-4 u-text-default u-text-9">
                      Свяжитесь с ZeroP
                    </h2>
                    <h6 className="u-custom-font u-text u-text-font u-text-10">
                      Ваши вопросы и предложения ценны для нас
                    </h6>
                    <p className="u-text u-text-11">
                    В ZeroP мы готовы к диалогу. Независимо от того, нужна ли вам информация о наших напитках, вы хотите стать нашим партнером или просто поделиться своими мыслями - свяжитесь с нами, и мы с удовольствием ответим на все ваши запросы.
                    </p>
                    <div className="u-social-icons u-spacing-20 u-social-icons-1">
                      <a href="https://web.telegram.org/a/" className="u-social-url">
                        <span className="u-icon u-icon-circle u-social-facebook u-social-icon u-text-palette-1-base u-icon-5">
                          <img src='img/icon__tg.svg'className="icon__tg" alt="tg"></img>
                        </span>
                      </a>
                      <a href="https://web.whatsapp.com/"  className="u-social-url">
                        <span className="u-icon u-icon-circle u-social-facebook u-social-icon u-text-palette-1-base u-icon-5">
                          <img src='img/icon__wa.svg' className="icon__wa" alt="wa"></img>
                        </span>
                      </a>
                    <a href="https://m.vk.com/" className="u-social-url">
                      <span className="u-icon u-icon-circle u-social-facebook u-social-icon u-text-palette-1-base u-icon-5">
                        <img src='img/icon__vk.svg' className="icon__vk" alt="vk"></img>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </section>
  )
}

export default Contact;
