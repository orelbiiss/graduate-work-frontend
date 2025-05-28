import React, { useState } from "react";

export default function UpBtn(){
    const [showBtn, setShowBtn] = useState("btn none");

    window.onscroll = function () {
        scrollFunction();
    };
    return (
        <>
            <img
                onClick={topFunction}
                id="btn"
                className={showBtn}
                src='/img/UpCircle.svg'
                alt=""
            />
        </>
    );


    function scrollFunction() {
      if (
        document.body.scrollTop > 500 ||
        document.documentElement.scrollTop > 500
      ) {
        setShowBtn("btn");
      } else {
        setShowBtn("none");
      }
    }
    function topFunction() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
}