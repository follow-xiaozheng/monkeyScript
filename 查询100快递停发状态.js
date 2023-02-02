// ==UserScript==
// @name         查询100快递停发状态
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.kuaidi100.com/stop/stop.jsp*
// @icon         https://www.google.com/s2/favicons?domain=kuaidi100.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    let clearInterTemp1 = setInterval(() => {
        // 右边固定的box
        let fixBox = document.getElementsByClassName('fix-box-middle')[0];
        let aX = createALable();
        let hiddenClass = ['header', 'nav-crumbs', 'nav-capsule']
        aX.innerText = "Show"
        for (let i = 0; i < hiddenClass.length; i++) {
            const element = document.getElementsByClassName(hiddenClass[i])[0];
            element.style.display = "none"
        }
        aX.addEventListener('click', function () {
            for (let i = 0; i < hiddenClass.length; i++) {
                const element = document.getElementsByClassName(hiddenClass[i])[0];
                if (element.style.display == 'none') {
                    element.style.display = "block"
                } else {
                    element.style.display = "none"
                }
            }
        })
        // 下标为3时，无定义的元素，则添加标签
        if (fixBox.children[3] == undefined) {
            fixBox.appendChild(aX)
            // 关闭定时器
            clearInterval(clearInterTemp1);
        }
    }, 500);
    // Your code here...
})();

var sanFuToken = "d4522694ce9c61p0305271edc60f2017";

// 添加快递停发按钮
addQueryStopStateBtn();

// 查询停发状态  快递停发
function addQueryStopStateBtn () {
    // 设置样式————————————————↓
    // 查询停发状态按钮   停发状态
    let getStopStateBtn = createBtn("查询停发", "5px 10px");
    let inputX = createInput("250px");
    getStopStateBtn.style.position = "fixed";
    getStopStateBtn.style.top = "50px";
    getStopStateBtn.style.left = "15px";
    inputX.style.position = "fixed";
    inputX.style.top = "15px";
    inputX.style.left = "15px";
    // 样式————————————————↑
    inputX.onkeydown = function (e) {
        if (e.code == "KeyQ" && e.altKey == true) {
            getStopStateBtn.click()
        }
    }
    // 地址栏Bar
    let addressBar = document.getElementsByClassName(
        "textarea textarea-search"
    )[0];
    getStopStateBtn.addEventListener("click", function () {
        // showAddressModule(inputX.value);   // 暂停
        // 订单号查询
        apiSanFuOrder(inputX.value);
        setTimeout(() => {
            // 获取地址
            let orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
            addressBar.focus();
            addressBar.value = orderInfo.data.detailAddress;
        }, 250);
    });
    // 获取地址栏内输入的按键
    addressBar.onkeydown = function (e) {
        console.log(e);
        if ((e.code == "KeyQ" && e.altKey == true) || (e.code == "KeyV" && e.ctrlKey == true)) {
            setTimeout(() => {
                document.getElementsByClassName("recog")[0].click();
                setTimeout(() => {
                    document.getElementsByClassName("btn btn-query")[0].click();
                }, 100);
            }, 100);
        }
    };

    const clearInter = setInterval(() => {
        const body = document.getElementsByTagName("body")[0];
        if (body.lastElementChild.nodeName != "BUTTON") {
            clearInterval(clearInter);
            body.appendChild(inputX);
            body.appendChild(getStopStateBtn);
        }
    }, 100);
}

// 显示是否地址停发模块   查看地址停发/查看停发
function showAddressModule (dingDanHao) {
    let divMain = document.createElement("div");
    divMain.style.padding = "10px 10px";
    divMain.style.backgroundColor = "white";
    divMain.style.borderRadius = "10px";
    //    let stopStateList = getLogisticsStateFn(dingDanHao);
    let stopStateList = getLogisticsStateFn(dingDanHao);
    setTimeout(() => {
        console.log(stopStateList);
    }, 1000);
    // stopStateList常用快递八个
    // for (let i = 0; i < stopStateList.length; i++) {
    for (let i = 0; i < 8; i++) {
        let div = document.createElement("div");
        div.style.padding = "2px 2px";
        // 三列 0快递公司 1结果 2原因
        //0 => expressCode  1 => reachable:  2 => reason
        for (let col = 0; col < 3; col++) {
            const span = document.createElement("span");
            // span.innerText = stopStateList[i][col]
            span.innerText = stopStateList;
            div.appendChild(span);
        }
        divMain.appendChild(div);
    }
    return divMain;
}

// 调用API，并且获取物流是否停发   需【订单号与地址】
function getLogisticsStateFn (dingDanHao) {
    let orderInfo = apiSanFuOrder(dingDanHao);
    setTimeout(() => {
        // 键入地址
        return apiLogisticsState();
    }, 600);
}

// 获取物流状态 是否停发
function apiLogisticsState (address = "广东省 广州市 白云区 XXXX") {
    // 详细地址分割  0省份 1市  2区 3详细地址
    const addressArr = address.split(" ");
    // 物流状态 停发与否
    let logisticsState;
    $.ajax({
        type: "post",
        url: "https://www.kuaidi100.com/apicenter/order.do?method=expressStopInquiries",
        data: {
            platform: "WWW",
            toProvince: addressArr[0],
            toCity: addressArr[1],
            toArea: addressArr[2],
            toAddress: addressArr[3].length <= 3 ? addressArr[4] : addressArr[3],
        },
        dataType: "dataType",
        success: function (res) {
            console.log(res.data);
            logisticsState = res.data.toReachable;
        },
    });

    setTimeout(() => {
        return logisticsState;
    }, 500);
}


window.onload = function (e) {
    // 参数数组
    let paramArr = window.location.search.slice(1).split('&')
    for (let i = 0; i < paramArr.length; i++) {
        const item = paramArr[i];
        let equalIndex = item.indexOf('=')
        let itemName = item.slice(0, equalIndex)
        let itemValue = item.slice(equalIndex + 1)
        console.log(itemName, itemValue)

    }
}


function apiSanFuOrder (dingDanHao) {

    if (dingDanHao == null || dingDanHao == undefined) {
        alert('请输入订单号')
        console.log(dingDanHao);
        return 0
    }
    $.ajax({
        type: "get",
        url: "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail",
        data: {
            ordId: dingDanHao,
        },
        dataType: "dataType",
        beforeSend: function (request) {
            request.setRequestHeader("authorization", sanFuToken);
        },
        // authorization:"3b614401e6cpa95f2697ccf7f379a007"
        success: function (response) {
            sessionStorage.setItem("orderInfo", response.responseText);
            alert("xxx");
            setTimeout(() => {
                console.log(response.responseText);
                console.log("Wocoa ");
            }, 500);
        },
        error: function (error) {
            sessionStorage.setItem("orderInfo", error.responseText);
            console.log("error");
            console.log(error);
            return error;
        },
    });
}

// 获取登录的ToKen
function apiGetLoginToken () {
    axios({
        method: 'post',
        url: 'https://m.sanfu.com/ms-sanfu-mgr-mall/system/login',
        data: JSON.stringify({
            userId: "ZHJ165",
            userPassword: "sf123321",
        }),
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    }).then((res) => {
        // 函数体
        let resToken = res.data.data.token
        sanFuToken = resToken
        console.log(res.data);
        localStorage.setItem('sanFuLoginToken', resToken)
    })
}



// 新按钮
function createBtn (value = "登记", padding = "10px 20px") {
    let btn = document.createElement("button");
    btn.style.padding = padding;
    btn.style.zIndex = 999;
    btn.innerText = value;
    return btn;
}

// 新输入框
function createInput (width = "200px", height = "20px") {
    let input = document.createElement("input");
    input.style.width = width;
    input.style.height = height;
    input.style.padding = "3px 0px";
    input.style.fontSize = "18px";
    input.style.border = "1px solid gray";
    input.style.borderRadius = "5px";
    input.style.zIndex = 999;
    return input;
}
// 新a标签
function createALable (params) {
    let a = document.createElement('a');
    a.style.padding = "5px 5px"
    a.style.fontSize = "18px"

    return a
}