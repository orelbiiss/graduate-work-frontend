import Header from '../components/Header';
import "../MainPage.css";  
import React, { useContext, useState} from 'react';
import { CartContext } from './CartContext';



import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';

function MainPage() {
    return (
      <>
        <Header />
        <Main />
      </>
    )
}

function Main({ addToCart }){
  return(
    <main className="oblast">
      <section className="first__section">
        <div className="img__wrapper">
          <picture>
            <img src='/img/title.svg' height="100%" width="100%" alt="" />
          </picture>
        </div>
        <div className="text__wrapper">
          <p className="description">
            Мы - магазин безалкогольных напитков, стремящийся предложить
            разнообразие альтернатив, которые сочетают в себе отличный вкус и
            заботу о вас. Наш ассортимент включает свежие соки, натуральные
            безалкогольные коктейли и другие напитки, созданные для удовлетворения
            ваших вкусовых предпочтений.
          </p>
        </div>
        <div className="button">
          <Link className="sale" to="/sale">
            АКЦИИ
          </Link>
          <Link className="beverages" to="/catalog">
            НАПИТКИ
          </Link>
        </div>
        <Link className="beverages" to="/catalog">
          НАПИТКИ
        </Link>
        <Link className="sale" to="/sale">
          АКЦИИ
        </Link>
      </section>
      <section className="second__section">
        <div className='product__1024px'>
          <div className="product__img__1024px">
            <picture>
              <source
                className="img__1024px"
                type="image/webp"
                srcSet="/img/webp/Напитки.webp 1x, /img/webp/Напитки__2x.webp 2x"
              />
              <img
                className="img__1024px"
                srcSet="/img/Напитки.png 1x,
                          /img/2x/Напитки__2x.png 2x"
                alt="Вода негазировананая"/>
            </picture>
          </div>
        </div>
        <div class="square">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <InfoProduct addToCart={addToCart}/>
      </section>
    </main>
  )
}

function InfoProduct() {

  const info = [
    {
      imgSrc1x: "/img/ZeroP__Вода__негазированная.png",
      imgSrc2x: "/img/2x/ZeroP__Вода__негазированная__2x.png",
      webpSrc1x: "/img/webp/ZeroP__Вода__негазированная.webp",
      webpSrc2x: "/img/webp/ZeroP__Вода__негазированная__2x.webp",
      alt: "Вода негазировананая",
      name: "ZeroP: Вода негазированная",
      cost: "100 ₽",
      volumes: [500, 1000, 1500],
      prices: [100, 150, 200]
    },
    {
      imgSrc1x: "/img/ZeroP__Вишневый__сок.png",
      imgSrc2x: "/img/2x/ZeroP__Вишневый__сок__2x.png",
      webpSrc1x: "/img/webp/ZeroP__Вишневый__сок.webp",
      webpSrc2x: "/img/webp/ZeroP__Вишневый__сок__2x.webp",
      alt: "Вишневый сок",
      name: "ZeroP: Вишневый сок свежевыжатый",
      cost: "100 ₽",
      volumes: [500, 1000, 1500],
      prices: [100, 150, 200],
    },
    {
      imgSrc1x: "/img/ZeroP__Orange__juice.png",
      imgSrc2x: "/img/2x/ZeroP__Orange__juice__2x.png",
      webpSrc1x: "/img/webp/ZeroP__Orange__juice.webp",
      webpSrc2x: "/img/webp/ZeroP__Orange__juice__2x.webp",
      alt: "Апельсиновый сок",
      name: "ZeroP: Апельсиновый сок свежевыжатый",
      cost: "200 ₽",
      volumes: [500, 1000, 1500],
      prices: [100, 150, 200],
    }
  ];

  const { addToCart } =  useContext(CartContext);
  const SwiperSslide = info.map((elem, i) => {

    return(
      <SwiperSlide className="product" key={i}>
        <div className="product__img">
          <picture>
            <source
              className="img"
              type="image/webp"
              srcSet={`${elem.webpSrc1x} 1x, ${elem.webpSrc2x} 2x`}
              />
            <img
              className="img"
              srcSet={`${elem.imgSrc1x} 1x, ${elem.imgSrc2x} 2x`}
              alt={elem.alt}
              />
          </picture>
        </div>
        <div className="info__product" key={i}>
          <p className="product__name">{elem.name}</p>
          <div className="cost">
            <p>{elem.cost}</p>
            <img className="plus" src='/img/add__ring.svg' onClick={() => addToCart(elem, elem.volumes[0])}/>
          </div>
        </div>
      </SwiperSlide>
    );
  });
  
    return (
      <Swiper 
        slidesPerView = {1.55}
        loop={true}
        navigation={true}
        modules={[Navigation]}
        className="swiper__main__page">
        {SwiperSslide}
      </Swiper>
    );
  }

export default MainPage;