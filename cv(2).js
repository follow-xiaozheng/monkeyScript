// ==UserScript==
// @name         CV退货退款信息PDD\KuaiShou
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://mms.pinduoduo.com/aftersales-ssr/detail*
// @match        https://s.kwaixiaodian.com/zone/refund/detail*
// @icon         https://mms-static.pinduoduo.com/favicon.ico
// @grant        none
// ==/UserScript==

;(function () {
  "use strict"

  // Your code here...
})()

setInterval(() => {
  let body = document.getElementsByTagName("body")[0]
  if (body.lastChild.nodeName != "BUTTON") {
    if (window.location.host == "mms.pinduoduo.com") {
      // 点击显示全部物流信息
      document.getElementsByClassName("mui-steps-item-title")[1].click()
    }
    let btn = addBtn()
    btn.addEventListener("click", () => {
      if (window.location.host == "mms.pinduoduo.com") {
        cvPddFn()
      } else if (window.location.host == "s.kwaixiaodian.com") {
        cvKuaiShouFn()
      }
    })
    body.appendChild(btn)
  }
}, 1000)

function cvPddFn() {
  // 订单号
  let dingdanhao = document
    .getElementsByClassName("Beast__1POzs")[0]
    .innerText.toString()
  // 门店
  let menDian = "GDD"
  // -----------
  // 售后类型，判断为仅退款还是退货退款
  let isLeiXing = document
    .getElementsByClassName("Beast__3ueKc")[1]
    .innerText.toString()
  // 优先退原因
  let youXianTui = isLeiXing == "仅退款" ? "拦截成功优先退" : "包裹退回优先退"
  // 物流状态
  let wuLiuZhuangTai = isLeiXing == "仅退款" ? "退回中" : "已签收"
  // 签收时间
  let qianShouShiJian =
    isLeiXing == "仅退款"
      ? ""
      : document
          .getElementsByClassName("mui-steps-item-description")[1]
          .innerText.toString()
  //价格
  let JiaGe =
    isLeiXing == "仅退款"
      ? document.getElementsByClassName("Beast__16mAT")[1].innerText.toString()
      : document.getElementsByClassName("Beast__16mAT")[0].innerText.toString()
  // ---------------
  // 快递单号
  let kuaiDiDanHao = document
    .getElementsByClassName("logistics-order-info-tip")[1]
    .innerText.toString()

  // 收录信息

  JiaGe = parseFloat(JiaGe.slice(1))
  let info = [
    dingdanhao,
    "",
    menDian,
    "",
    youXianTui,
    "",
    wuLiuZhuangTai,
    kuaiDiDanHao,
    qianShouShiJian,
    JiaGe,
  ]
  alert(info)
}

function cvKuaiShouFn() {
  let dingdanhao = ""
  let tuiKuanBianHao = ""
  let menDian = "GDD"
  let youXianTui = ""
  let wuLiuZhuangTai = ""
  let kuaiDiDanHao = ""
  let qianShouShiJian = ""
  let JiaGe = ""
  // 获取标签组，以便正确查询到订单号等信息
  let labels = document.getElementsByClassName("label__BFlU4")
  let labelValue = document.getElementsByClassName("content__Rf0s7")
  for (let i = 0; i < labels.length; i++) {
    const element = labels[i]
    const value = labelValue[i].firstChild.innerText
    if (element.innerText == "订单编号") {
      dingdanhao = value
    }
    if (element.innerText == "售后单号") {
      tuiKuanBianHao = value
    }
    if (element.innerText == "退款金额") {
      JiaGe = parseFloat(value.slice(1))
    }
    if (element.innerText == "售后类型") {
      youXianTui = value == "仅退款" ? "拦截成功优先退" : "包裹退回优先退"
      wuLiuZhuangTai = value == "仅退款" ? "退回中" : "已签收"
      // 签收时间
      const qianShouTime = document.getElementsByClassName(
        "ant-steps-item-subtitle"
      )[0].innerText
      qianShouShiJian = value == "仅退款" ? "" : qianShouTime
    }
    // 筛选正确的快递单号
    let kddhTemp = document.getElementsByClassName("ant-tabs-extra-content")[0]
      .innerText
    let kddhIndex = kddhTemp.indexOf("：")
    kuaiDiDanHao = kddhTemp.slice(kddhIndex + 1)
  }
  // 收录信息
  let info = [
    dingdanhao,
    tuiKuanBianHao,
    menDian,
    "",
    youXianTui,
    "",
    wuLiuZhuangTai,
    kuaiDiDanHao,
    qianShouShiJian,
    JiaGe,
  ]
  alert(info)
}

// 添加按钮 并且返回按钮  编辑样式
function addBtn() {
  var btn = document.createElement("button")
  btn.style.height = "50px"
  btn.style.width = "100px"
  btn.style.backgroundColor = "rgba(255, 255, 255, 0)"
  btn.style.position = "fixed"
  btn.style.top = "100px"
  btn.style.right = "50px"
  btn.innerText = "CV信息"
  return btn
}
