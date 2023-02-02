// ==UserScript==
// @name         CV退货退款信息PDD\KuaiShou
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://mms.pinduoduo.com/aftersales-ssr/detail*
// @match        https://s.kwaixiaodian.com/zone/refund/detail*
// @match        https://fxg.jinritemai.com/ffa/morder/aftersale/detail-v2*
// @icon         https://mms-static.pinduoduo.com/favicon.ico
// @grant        none
// ==/UserScript==

;(function () {
  "use strict"

  // Your code here...
})()
// 定义全局数据
var global_JSON_DATA

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
        let pddInfo = cvPddFn()
        alert(pddInfo)
      } else if (window.location.host == "s.kwaixiaodian.com") {
        cvKuaiShouFn()
      }else if(window.location.host =='fxg.jinritemai.com'){
        let DouYinInfo = cvDouYinFn()
        alert(DouYinInfo)
      }
    })
    // 测试获取数据按钮_______________________
    getData()
    body.appendChild(btn)
  }
}, 1000)

function cvDouYinFn() {
  let dingdanhao = ""
  let tuiKuanBianHao = ""
  let menDian = "GDD"
  let youXianTui = ""
  let wuLiuZhuangTai = ""
  let kuaiDiDanHao = ""
  let qianShouShiJian = ""
  let JiaGe = ""
  // 获取标签组，以便正确查询到订单号等信息
  let labels = document.getElementsByClassName('style_item-wrapper__3_upj')
  for (let i = 0; i < labels.length; i++) {
    // if(labels[21]){
    //   continue
    // }
    const labelTitle = labels[i].firstChild.innerText
    const labelValue = labels[i].lastElementChild.innerText
    // console.log(labelTitle);
    if (labelTitle == "订单编号") {
      dingdanhao = labelValue
      console.log(labelValue);
    }
    if (labelTitle == "售后编号") {
      tuiKuanBianHao = labelValue
    }
    if (labelTitle == "退款金额") {
      JiaGe = parseFloat(labelValue.slice(1))
    }
    if (labelTitle == "售后类型") {
      youXianTui = labelValue == "仅退款" ? "拦截成功优先退" : "包裹退回优先退"
      wuLiuZhuangTai = labelValue == "仅退款" ? "退回中" : "已签收"
      // 签收时间
      const qianShouTime =document.getElementsByClassName('auxo-tabs-tabpane')[1].getElementsByClassName('index_date__33Sfm')[0].innerText
      qianShouShiJian = labelValue == "仅退款" ? "" : qianShouTime
    }
    // 筛选正确的快递单号
    let kddhTemp = document.getElementsByClassName('auxo-tabs-tabpane')[1].getElementsByClassName('style_content__2tUGJ')[1].children[1].innerText
    let kddhIndex = kddhTemp.indexOf("：")
    kuaiDiDanHao = kddhTemp.slice(kddhIndex + 1)
  }
  // 获取退货单信息
  getTuiHuo_Info(dingdanhao)
  menDian = global_JSON_DATA.data[0].netSales[0].logisticsMsgDto[0].sHO_ID
  console.log(menDian);
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
  console.log(info);
  // alert(info)
  return info
}

function cvPddFn() {
  // 订单号
  let dingdanhao = document
    .getElementsByClassName("Beast__1POzs")[0]
    .innerText.toString()
  // 获取三福后台管理系统发货门店
  getFaHuo_Info(dingdanhao)
  // 订单号细节信息
  let ddhDetails = global_JSON_DATA.data
  // 订单号中的销售详细信息
  let netSales = ddhDetails.netSales
  // 门店
  let menDian = "仅退款" ? netSales[0].logisticsMsgDto[0].sHO_ID : "GDD"
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
  let JiaGe
  // ---------------
  // 快递单号
  let kuaiDiDanHao = document
    .getElementsByClassName("logistics-order-info-tip")[1]
    .innerText.toString()
  getFaHuo_Info(dingdanhao)
  console.log(global_JSON_DATA.data)

  let labels = document.getElementsByClassName("Beast__2-PbN")
  for (let i = 0; i < labels.length; i++) {
    const element = labels[i]
    // 标签标题
    const labelTitle = element.firstChild.innerText
    // 标签内容
    const labelValue = element.children[1].innerText
    if (labelTitle == "退款金额：") {
      JiaGe = parseFloat(labelValue.slice(1))
    }
  }

  // 收录信息
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
  //   alert(info)
  console.log(global_JSON_DATA.data)
  return info
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
  btn.style.right = "100px"
  btn.innerText = "CV信息"
  return btn
}

function getData() {
  // let query_btn = document.getElementsByClassName('el-button el-button--primary is-plain')[0];
  let getDataBtn = document.createElement("button")
  getDataBtn = document.createElement("button")
  getDataBtn.style.position = "fixed"
  getDataBtn.style.top = "50px"
  getDataBtn.style.right = "100px"
  getDataBtn.style.padding = "10px 20px"
  getDataBtn.innerText = "获取数据"
  // alert('success')
  document.getElementsByTagName("body")[0].appendChild(getDataBtn)

  getDataBtn.addEventListener("click", () => {
    xhrFn()
    console.log("数据:")
    console.log(global_JSON_DATA.data)
  })
}

// 查询订单号信息
function getFaHuo_Info(dingDanHao) {
  let queryStr = "ordId=" + dingDanHao
  xhrFn(queryStr)
}

function getTuiHuo_Info(dingDanHao) {
  let queryStr = "tbOrdIds=" + dingDanHao
  const url = "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getRefundAndSalesReturnDetail?"
  xhrFn(queryStr,url)
}
// 原生JS XHR
function xhrFn(queryStr = "ordId=221110-563827219310886",url="https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail?") {
  let xhr = new XMLHttpRequest()
  //   let global_JSON_DATA
  url = url + queryStr
  xhr.open("get", url, true)
  xhr.onreadystatechange = function () {
    if ((xhr.readyState = 4 && xhr.status == 200)) {
      let info = xhr.responseText
      //   global_JSON_DATA = eval("(" + info + ")")
      global_JSON_DATA = JSON.parse(info)
    }
  }
  // 设置请求头   将授权字段发送服务器
  xhr.setRequestHeader("authorization", "3b614401e6cpa95f2697ccf7f379a007")
  xhr.send()
  //   console.log(xhr)
}
// jQuery写法
/*

$.ajax({
        type: "get",
        url: "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail",
        data: {
          ordId:"221110-563827219310886"
        },
        dataType: "dataType",
        beforeSend:function (request) {
          request.setRequestHeader("authorization","3b614401e6cpa95f2697ccf7f379a007")
        },
        // authorization:"3b614401e6cpa95f2697ccf7f379a007"
        success: function (response) {
          console.log(response);
        },
        error :function(error) {
          console.log(error);
        }
      });


  */
