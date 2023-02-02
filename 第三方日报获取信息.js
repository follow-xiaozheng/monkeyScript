// ==UserScript==
// @name         第三方日报获取信息
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://s.kwaixiaodian.com/*
// @icon         https://www.google.com/s2/favicons?domain=kwaixiaodian.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Your code here...

  let axiosX = document.createElement("script");
  axiosX.src = "https://unpkg.com/axios/dist/axios.min.js";
  document.getElementsByTagName("body")[0].appendChild(axiosX);
})();

setTimeout(function () {
  getKSStoreData();
}, 3000);

// 快手
function getKSStoreData() {
  console.log("xxx");
  let btn = document.createElement("button");
  btn.innerText = "CV店铺数据-购物体验分";
  btn.style.position = "absolute";
  btn.style.top = "0px";
  document.getElementsByClassName("nv5r1dW29lCHhprs3vW8")[0].appendChild(btn);

  btn.addEventListener("click", function () {
    axios
      .get("https://s.kwaixiaodian.com/rest/app/tts/apollo/shopexp/getDetail")
      .then((res) => console.log(res)); // 快手店铺数据——购物体验分

    axios
      .post("https://s.kwaixiaodian.com/rest/pc/cs/b/data/reply/overview", {
        dateParam: 1671033600000,
        dateType: 4,
        elementId: null,
        queryType: 1,
      })
      .then((res) => console.log(res)); // 历史响应数据
  });
}
