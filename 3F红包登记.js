// ==UserScript==
// @name         3F红包登记，diy便捷插件
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://work.bytenew.com/appMobile.html*
// @icon         https://www.google.com/s2/favicons?domain=bytenew.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Your code here...'
})();

var infosObj = {};
var myData = new Date();
window.onload = function () {
  getParamsFn();
};

setTimeout(function () {
  btn13yuanFn();
  let registrant = document.getElementsByClassName(
    "w-default-wrap edit-checkbox-behavior clearFix"
  )[4].childNodes;
  // registrant[82].innerText=='郑汉金'
  let input = document.getElementsByTagName("input");
  input[18].value = infosObj.dingDanHao;
  input[20].value = infosObj.seHao;
  input[28].value = infosObj.menDian;

  // 需要且重复的函数，传递所需数组进入
  needRepeatFn(registrant);
}, 3000);

function btn13yuanFn(money = 13) {
  let btn13yuan = document.createElement("button");
  btn13yuan.style.height = "50px";
  btn13yuan.style.width = "100px";
  btn13yuan.style.zIndex = 9999;
  btn13yuan.innerText = `${money}元红包登记`;
  document
    .getElementsByClassName("w-default-wrap edit-task-column-item")[0]
    .appendChild(btn13yuan);

  btn13yuan.addEventListener("click", function () {
    let ClickList = [7, 13, 14];
    // 勾选 sanfu服饰官方旗舰店

    for (let i = 0; i < ClickList.length; i++) {
      let number = ClickList[i];
      document
        .getElementsByClassName("w-default-wrap edit-checkbox-item")
        [number].firstElementChild.firstElementChild.click();
    }
    // 打款类型   好评返现
    document
      .getElementsByClassName("radio-box-icon wicon icon-radio")[1]
      .click();
    //   打款原因
    document.getElementsByTagName(
      "input"
    )[16].value = `商品奖励买家秀,客户要求红包,已发红包${money}元线下退【汉金2022年10月07日】`;

    // 已发红包金额
    document.getElementsByTagName("input")[27].value = money;
  });
}

// 必要且重复环节   // 优化下结构
function needRepeatFn(registrant) {
  // 隐藏无关紧要的登记名               不清楚为何需要减2
  for (let i = 0; i < registrant.length - 2; i++) {
    if (registrant[i].innerText != " 郑汉金") {
      registrant[i].style.display = "none";
    }
    if (registrant[i].innerText == " 郑汉金") {
      // 勾选 登记人郑汉金
      registrant[i].childNodes[0].lastElementChild.click();
      // 勾选 已发红包
      document
        .getElementsByClassName("w-default-wrap edit-checkbox-item")[15]
        .firstElementChild.firstElementChild.click();
    }
  }

  // 多选框
  let wrap1 = document.getElementsByClassName(
    "w-default-wrap edit-checkbox-behavior clearFix"
  );
  // 优化结构 转为flex
  setWrapStyle(wrap1);
}

// 获取来自链接中的参数
function getParamsFn() {
  let hash = window.location.hash;
  let query = hash.slice(hash.indexOf("?") + 1);
  let params = query.split("&");
  for (let i = 0; i < params.length; i++) {
    let name = params[i].slice(0, params[i].toString().indexOf("=")); // 参数名
    let data = params[i].slice(params[i].toString().indexOf("=") + 1); // 参数数据
    infosObj[name] = data;
  }
  console.log(infosObj)
  let input = document.getElementsByTagName("input");
  input[18].value = infosObj.dingDanHao;
  input[20].value = infosObj.seHao;
  input[28].value = infosObj.menDian;
}

// 设置样式
function setWrapStyle(params) {
  for (let i = 0; i < params.length; i++) {
    const element = params[i];
    element.style.display = "flex";
    element.style.justifyContent = "space-between";

    // 设置子节点样式
    for (let j = 0; j < element.children.length; j++) {
      const children = element.children[j];
      children.style.width = "auto";
    }
  }
}
