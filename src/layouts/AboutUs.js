import Header from "../components/Header";
import '../css/AboutUs.css'
import React, { useState } from "react";
import Footer from '../components/Footer';

function AboutUs(){
    return(
        <>
            <Header />
            <СompanyInfo />
            <Footer />
        </>
    )
}
// paragraph-content
// generateCompanyInfoBlocks
function СompanyInfo(){
    
    const companyInfoArray = [
        {
            className: 'company__introduction',
            title: 'О нашей компании ZeroP',
            accentText:'Мы - магазин безалкогольных напитков, стремящийся предложить разнообразие альтернатив, которые сочетают в себе отличный вкус и заботу о вас. ',
            text: 'У нас вы найдете свежевыжатые соки, освежающие смузи, витаминные морсы и многое другое от ведущих производителей. Мы заботимся о том, чтобы наши клиенты могли наслаждаться разнообразием напитков и выбирать то, что соответствует их вкусовым предпочтениям. Приглашаем вас посетить магазин ZeroP и попробовать лучшие безалкогольные напитки.',
            img: '/img/title__accent.svg'
        },
        {
            className: 'company__history',
            title: 'История создания компании',
            accentText:'',
            text: 'В магазине ZeroP вы можете сдать на повторную обработку и вторичную переработку не только пластиковые бутылки, но и другие виды упаковки. Присоединяйтесь к нам в борьбе за зеленое будущее и поддержите наши усилия по устойчивой переработке и экологической ответственности!',
            img: '/img/history__icon.svg'
        },
        {
            className: 'product__overview',
            title: 'О продукции',
            accentText:'В нашем магазине представлен огромный ассортимент безалкогольных напитков от различных брендов.',
            text: ' У нас вы найдете свежевыжатые соки, освежающие смузи и многое другое. Мы регулярно добавляем новые продукты, чтобы удовлетворить разнообразные предпочтения наших клиентов. Приходите к нам и открывайте для себя мир разнообразных безалкогольных напитков от лучших производителей!',
            img: '/img/milk__bottle.svg'
        },
        {
            className: 'eco__initiatives',
            title: 'О защите природы и переработке',
            accentText:'Мы с гордостью проводим ежедневную работу по снижению нашего экологического следа. В сотрудничестве с экологической компанией "GreenCare", мы внедряем инновационные методы упаковки и переработки.',
            text: 'В магазине ZeroP вы можете сдать на повторную обработку и вторичную переработку не только пластиковые бутылки, но и другие виды упаковки. Присоединяйтесь к нам в борьбе за зеленое будущее и поддержите наши усилия по устойчивой переработке и экологической ответственности!',
            img: '/img/recycling.svg'
        }
    ]

    const generateCompanyInfoBlocks = companyInfoArray.map((item, i) => (
        <div className={`block__info ${item.className}`} key={i} onClick={() => handleBlockClick(item)}>
            <div className="img__container">
                <img src={item.img}></img>
            </div>
            <p>{item.title}</p>
        </div>
    ));
    const [activeBlock, setActiveBlock] = useState();

    const handleBlockClick = (item) => {
        setActiveBlock(item);
    }

    return(
        <>
        <div className="container__aboutUs">
            <div className="row">
                <div className="left__section">
                    {generateCompanyInfoBlocks.slice(0, 2)}
                </div>
                <div className="right__section">
                    {generateCompanyInfoBlocks.slice(2)}
                </div>
                <div className="text__block-aboutUs">
                    <p className="text__block-text"><span className="text__block-accent__text">{activeBlock ? activeBlock.accentText: companyInfoArray[0].accentText}</span><br/>{activeBlock ? activeBlock.text : companyInfoArray[0].text}</p>
                </div>
            </div>
        </div>
        </>
    )
}

export default AboutUs;