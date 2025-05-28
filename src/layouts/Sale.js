import Header from "../components/Header";
import Footer from '../components/Footer';
import UpBtn from '../components/UpBtn';
import 'swiper/css';
import 'swiper/css/pagination';
import '../css/SalePage.css';


function Sale(){
    return(
    <>
        <Header />
        <MainBlock/>
        <SetDrinks/>
        <Footer />
        <UpBtn />
        </>
    )
}

const stockInfo = [
    // sliders
    {
        className: 'slide',
        srcImg: '/img/set__drinks.png',
        title:"Узнай свой вкус",
        text:"Экономь, познавая вкусы! Узнай свой вкус с нашими ознакомительными наборами по выгодной цене. Дешевле, чем покупать по отдельности! Поторопись, количество ограничено! ",
        deadline: "ꚙ"
    },
    {
        className: 'slide',
        srcImg: '/img/promotion__banner.jpg',
        text:"Покупай Добрый-Кола в банках или бутылках, и получай призы.",
        deadline: "С 1 мая по 31 августа 2024 года"
    },
    {
        className: 'slide',
        srcImg: '/img/welcome.png',
        text:"Онлайн выгода: Получите скидку 300р на первую онлайн покупку при регистрации на сайте",
        deadline: "С 14 апреля по 20 сентября 2024 года"
    },
    {
        className: 'slide',
        srcImg: '/img/promotion__2.png',
        text:"Фитнес-выходные: скидка 20% на покупку спортивных напитков в выходные дни",
        deadline: ""
    },
    {
        className: 'slide',
        srcImg: '/img/good__morning.png',
        text:"Утренний бонус: Получите бесплатную бутылку сока при каждой покупке в период с 8:00 до 11:00 утра",
        deadline: " C 1 апреля по 1 мая 2024"
    },
    {
        className: 'slide',
        srcImg: '/img/frutonyanya.png',
        text:'Покупайте молочные продукты ФрутоНяня, получайте кешбэк и выигрывайте призы.',
        deadline: "С 8 апреля по 8 октября 2024"
    },
    {
        className: 'slide',
        srcImg: '/img/promotion__1.png',
        text:"2+1 на соки САДЫ ПРИДОНЬЯ",
        deadline: "С 19 апреля 2023 года по 31 мая 2024 года"
    },
]

function MainBlock(){
    return(
        <>
            <div className="promotion__num">
                <p>АКЦИИ / ВСЕГО {stockInfo.length}</p>
            </div>
            <RemainingPromotions />
        </>
        
    )
}

function RemainingPromotions() {
    const renderPromotions = stockInfo.map((elem, i) => {
        return (
            <>
                <div className={`promotion__${i}`} key={i}>
                    <img src={elem.srcImg} className="promotion__img" alt=""/> 
                    <div className="promotion__details">
                        <p className="promotion__text">{elem.text}</p>
                        <p className="promotion__deadline">Сроки проведения {elem.deadline}</p>
                    </div>
                    <a href="#" className="journal-item__link"></a>
                </div>
            </>
        );
    });

    // Создаем последовательность блоков
    const promotionBlocks = [];
    for (let i = 0; i < renderPromotions.length; i += 7) {
        promotionBlocks.push(
            <div className="triple__inline__block" key={i}>
                {renderPromotions[i]}
                {renderPromotions[i + 1]}
                {renderPromotions[i + 2]}
            </div>
        );
        promotionBlocks.push(
            <div className="triple__block" key={i + 3}>
                {renderPromotions[i + 3]}
                {renderPromotions[i + 4]}
                {renderPromotions[i + 5]}
               
            </div>
        );

        // Добавляем одиночный блок, если он существует
        if (renderPromotions[i + 6]) {
            promotionBlocks.push(
                <div className="single__block" key={i + 6}>
                    {renderPromotions[i + 6]}
                </div>
            );
        }
    }
    return (
        <div className="remaining__promotions">
            {promotionBlocks}
        </div>
    );
}

function SetDrinks(){
    const promotionalSets = [
        {
            setName: "Фруктовый Микс",
            setSubtitle: "Набор соков холодного отжима",
            setPrice: "3400",
            fillingSet: [
                {
                    name: "Зеленый Вихрь", 
                    description: "Зеленое яблоко, Киви, Шпинат, Лимон", 
                    energy: "45 ккал" 
                },
                { 
                    name: "Лимонадная Свежесть", 
                    description: "Лимон, Мята, Яблоко, Лайм, Апельсин", 
                    energy: "40 ккал" 
                },
                { 
                    name: "Апельсиновый Заряд", 
                    description: "Апельсин, Мандарин, Персик", 
                    energy: "35 ккал" 
                },
                { 
                    name: "Красная Смесь", 
                    description: "Клубника, Малина, Вишня, Клюква, Гранат", 
                    energy: "50 ккал" 
                },
                { 
                    name: "Дынное Удовольствие", 
                    description: "Дыня, Персик, Арбуз, Мята", 
                    energy: "55 ккал" 
                },
                { 
                    name: "Персиковый Рассвет", 
                    description: "Персик, Апельсин, Манго, Банан, Имбирь", 
                    energy: "60 ккал" 
                },
                { 
                    name: "Грушевая Гармония", 
                    description: "Груша, Яблоко, Карамбола, Ананас, Кокосовая вода", 
                    energy: "45 ккал" 
                }
            ]
        }
    ]

    const description = promotionalSets.map((elem, i) => {
        return(
            <>
              <div className="set__title" key={i}>
                    <p className="set__name">{elem.setName}</p>
                    <p className="set__subtitle">{elem.setSubtitle}</p>
                </div>
                <div>
                    <div className="set__price">
                        <img src="/img/wallet.svg" alt=""></img>
                        <p>{elem.setPrice} ₽</p>
                    </div>
                    <div className="border__description"></div>
                    <div className="set__description__container">    
                        <p>Этот набор соков представляет собой разнообразие вкусов и питательных веществ, способствующих здоровому образу жизни. Каждый из напитков в наборе содержит ценные витамины, которые играют важную роль в поддержании общего здоровья и метаболизма.</p>
                        <p><span className="list__title">В наборе соков присутствуют следующие витамины:</span> Витамин C, Витамин A, Витамин E, Витамин K, Бета-каротин (превитамин A)</p>
                        <span className="list__title">Состав набора:</span>
                        {elem.fillingSet.map((bottle, index) => (
                            <div key={index}>
                                <span>{bottle.name}: {bottle.description}</span>
                                <p> {`Энергетическая ценность (на 100 мл): ${bottle.energy}`}</p>
                            </div>
                            ))}
                    </div>
                </div>
            </>
        )
    })

    return(
    <>
        <div className="set__drinks__container">
            <div className="description__block">
                {description}
                <div className="set__btn__container">
                    <a className="btn__more">Подробнее</a>
                    <div className="btn__basket">
                        <img  className="icon" src='/img/add__to__basket.svg' alt=""></img>
                    </div>
                </div>
            </div>

            <div className='set__picture'>
                <img src="/img/set__drinks.png" alt=""></img>
            </div>
        </div>
    </>
    )
}



export default Sale;