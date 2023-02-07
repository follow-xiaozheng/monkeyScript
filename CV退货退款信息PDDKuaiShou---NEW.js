// ==UserScript==
// @name         CV退货退款信息PDD\KuaiShou
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://mms.pinduoduo.com/*
// @match        https://s.kwaixiaodian.com/*
// @match        https://s.kwaixiaodian.com/zone/refund/detail*
// @match        https://s.kwaixiaodian.com/zone/cultivation/star/shop/star/class
// @match       *https://fxg.jinritemai.com/*
// @match        https://fxg.jinritemai.com/ffa/morder/aftersale/detail-v2*
// @match        https://fxg.jinritemai.com/ffa/maftersale/aftersale/detail-v2*
// @match        https://mms.pinduoduo.com/aftersales/aftersale_list*
// @match        https://fxg.jinritemai.com/ffa/maftersale/aftersale/list*
// @icon         https://mms-static.pinduoduo.com/favicon.ico
// @grant        none
// ==/UserScript==


//  平台店铺数据
class PlatformStoreData {
    constructor(platform = "拼多多") {
        this.platform = platform;
        switch (platform) {
            case "拼多多":
            case "PDD":
                break;
            case "抖音":
            case "DY":
            case "douyin":
                return this.douYinStoreData();
            case "快手":
            case "KS":
            case "kuaishou":
                return this.kuaiShouStoreData();
            default:
                break;
        }
    }
    kuaiShouStoreData () {
        return this.storeDataAPI(
            "https://s.kwaixiaodian.com/rest/app/tts/apollo/shopexp/getDetail"
        );
    }
    douYinStoreData () {
        // 店铺数据
        let storeDataUrl =
            "https://fxg.jinritemai.com/governance/shop/experiencescore/getOverviewByVersion?version=6.0&exp_version=6.2";
        let storeDataDetailUrl =
            "https://fxg.jinritemai.com/governance/shop/experiencescore/getAnalysisScoreV5?time=90&filter_by_industry=true&number_type=90&version=6.0&exp_version=6.2";
        let storeData = this.storeDataAPI(storeDataUrl);
        let storeDataDetail = this.storeDataAPI(storeDataDetailUrl);
        return Promise.all([storeData, storeDataDetail]);
    }

    // 店铺数据API
    storeDataAPI (url, config = { method:'', data:'' }) {
        return fetch(url, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => res.json());
    }
}
// message提示文本、type提示类型、removeTime关闭时间
class diyMessage {
    $message ({ message, type = "success", removeTime = 1500 }) {
        let messageDiv = document.createElement("div");
        let messageStyleObj = {
            padding: "10px 20px",
            fontSize: "18px",
            backgroundColor: "rgba(248, 248, 248, 0.8)",
            borderRadius: "5px",
            position: "fixed",
            left: "50%",
            top: "30px",
            transition: "all 1s",
        };
        setTimeout(() => {
            messageDiv.style.top = "40px";
        }, 100);
        // 一次性设置样式
        for (const key in messageStyleObj) {
            // 只通过  非原型链上的数据
            if (Object.hasOwnProperty.call(messageStyleObj, key)) {
                const value = messageStyleObj[key];
                messageDiv.style[key] = value;
            }
        }
        switch (type) {
            case "success":
            case "成功":
                messageDiv.style.border = "1px solid #77c94e";
                messageDiv.style.color = "#77c94e";
                messageDiv.innerText = message == undefined ? "成功success" : message;
                break;
            case "error":
            case "失败":
                messageDiv.style.border = "1px solid #9c322a";
                messageDiv.style.color = "#9c322a";
                messageDiv.innerText = message == undefined ? "失败error" : message;
                break;
            default:
                messageDiv.innerText = "默认成功";
                break;
        }
        document.getElementsByTagName("body")[0].appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.style.top = "20px";
            setTimeout(() => {
                messageDiv.remove();
            }, 250);
            // 默认1500毫秒
        }, removeTime);
    }
}

// 备注 需传入对应平台 目前为拼多多
class Note {
    constructor(platform = "拼多多") {
        this.platform = platform;
        switch (platform) {
            case "拼多多":
            case "pdd":
            case "PDD":
                this.url = "https://mms.pinduoduo.com/pizza/order/noteTag";
                break;
            case "抖音":
            case "douyin":
            case "dy":
                this.url = "URL_douyin";
                break;
            default:
                this.url = "https://mms.pinduoduo.com/pizza/order/noteTag";
                break;
        }
    }
    // 查询
    query ({ orderNo, source = 1 }) {
        return this.noteApi("/query", {
            orderSn: orderNo,
            source: 1,
        });
    }
    // 更改数据     orderNo订单号,remark备注信息
    update ({ orderNo, remark, remarkTagColor, remarkTagName, source = 1 }) {
        let noteData = this.query({ orderNo }).then((res) => res);
        return Promise.all([noteData]).then((value) => {
            console.log(value, "queryNote函数的返回值");
            if (value[0].result.note != null) {
                remark = value[0].result.note + "\n" + remark;
            }
            return this.noteApi("/update", {
                orderSn: orderNo,
                remark: remark,
                remarkTag: remarkTagColor,
                remarkTagName: remarkTagName,
                source: 1,
            });
        });
    }
    // 获取备注API
    noteApi (type = "/query", data) {
        return fetch(this.url + type, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                return data;
            });
    }
}
// 解析常用订单          本地缓存 key: SANFU_ORDER_JSON
class ResolvingSFOrder {
    constructor() {
        this.jsonChangeObject();
    }

    // 获取本地缓存转化为对象或者数组
    jsonChangeObject (json = localStorage.getItem("SANFU_ORDER_JSON")) {
        this.orderObj = JSON.parse(json);
        // console.log(this.orderObj)

        return this.orderObj;
    }
}
// 常用模块
class CommonModule extends Note {
    // 通用的备注按钮
    currencyNoteBtn ({ orderNo, remark }, innerText = "默认按钮") {
        let btn = this.createBtn({ innerText: innerText });
    }
    // 修改备注按钮
    updateNoteBtn () {
        let commonModule = new CommonModule(); // XXX  后期需修改
        let btn = this.createBtn({});
        btn.addEventListener("click", function () {
            let orderNoStr = prompt("请输入订单号，多个订单号请用英文逗号分开");
            if (orderNoStr != null || orderNoStr != undefined) {
                // 将获取到的内容用分割为数组
                let orderNoArr = orderNoStr.split(",");
                let remarkText = prompt("请输入需添加的内容");
                if (remarkText != null || remarkText != undefined) {
                    for (let i = 0; i < orderNoArr.length; i++) {
                        const orderNo = orderNoArr[i].toString();
                        commonModule.update
                            .call(commonModule, { orderNo: orderNo, remark: remarkText })
                            .then((res) => {
                                // console.log(res);
                                let diyAlertInfo = commonModule.DiyAlert(res.errorMsg);
                                console.log(diyAlertInfo);
                            });
                    }
                }
            }
            commonModule;
        });

        return btn;
    }

    // 设置对象元素样式
    setObjAllStyle (element, object) {
        for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {
                const value = object[key];
                element.style[key] = value;
            }
        }
    }

    // 设置缓存 默认为修改覆盖
    setStoreageBtn (type = "updata") {

        // 默认按钮本身就是覆盖缓存   updata作用
        let btn = this.createBtn({ innerText: "设置缓存" });
        let $this = this;
        let diyAlert = $this.DiyAlert("", `${type}Storeage`, {
            left: (innerWidth / 2) - 50 + 'px',
            top: (innerHeight / 2) - 50 + 'px',
            isSetContentToStore: true,
            isDiy: true,
        });
        let divMainX = diyAlert.divMain;
        // 获取自定义弹窗底部DIV
        let buttomDivX = diyAlert.buttomDiv;
        // 实际就是确认按钮  第一个
        let updataBtn = buttomDivX.firstElementChild;
        // 获取diyAlert里面的 输入文本框
        let inputTextX = diyAlert.inputText;
        let addBtn = document.createElement('button');
        let removeBtn = document.createElement('button');
        addBtn.innerText = '添加'
        removeBtn.innerText = '删除'
        let needAddElement = [addBtn, removeBtn,]
        for (let i = 0; i < needAddElement.length; i++) {
            const element = needAddElement[i];
            buttomDivX.appendChild(element)
        }
        addBtn.addEventListener('click', () => {
            let storeageTemp = JSON.parse(localStorage.getItem('SANFU_ORDER_JSON'));
            let inputTextValue = JSON.parse(inputTextX.value);
            // 将两个值连接在一块
            let temp = storeageTemp.concat(inputTextValue)
            temp = JSON.stringify(temp);
            localStorage.setItem('SANFU_ORDER_JSON', temp);
        })
        // 设置到本地缓存中
        updataBtn.addEventListener('click', () => {
            localStorage.setItem('SANFU_ORDER_JSON', inputTextX.value)
        })


        // 点击按钮  添加diy
        btn.addEventListener("click", () => {

            document.getElementsByTagName('body')[0].appendChild(divMainX)
        });
        return btn;
    }
    // 获取当前页面所有订单号
    getHTMLALLOderNoBtn (platform = '拼多多') {
        let btn = this.createBtn({ innerText: 'GET所有订单号' });
        let $this = this;
        btn.addEventListener('click', () => {

            let _href = location.href;
            let orderNoArr = []
            // 默认是售后单页面
            let classE = 'table-item-header_item_header__1fRVw'
            let classOrderNoE = 'table-item-header_sn__2gbGk'
            // 工单界面
            if (_href == 'https://mms.pinduoduo.com/aftersales/work_order/list') {
                classE = 'listItem_itemHeader__2CBuV'
                classOrderNoE = 'tableItemHeader_sn__xXp1-'
            }
            let orderModule = document.getElementsByClassName(classE);

            for (let i = 0; i < orderModule.length; i++) {
                const element = orderModule[i];
                let orderNo = element.getElementsByClassName(classOrderNoE)[0].innerText
                orderNoArr.push(orderNo);
            }

            $this.DiyAlert(orderNoArr.join(','), '当前页面订单号')
        })
        return btn;
    }
    // 获取售后的订单号 已打钩的订单号     needType 所需类型    默认平台拼多多
    getAfterSalesOrderBtn (needType = '订单号', platform = "拼多多") {
        let btn = this.createBtn({});
        btn.addEventListener("click", function () {
            let orderModules = document.getElementsByClassName('after-sales-table_order_item__3QqLW');
            // 复选框
            let checkbox = document.getElementsByClassName(
                "after-sales-table_checkbox_wrap__j47E8"
            );
            if (location.host == 'fxg.jinritemai.com') {
                orderModules = document.getElementsByClassName('auxo-table-row auxo-table-row-level-0');
                // 需要动态 checkbox = document.getElementsByClassName('auxo-checkbox-wrapper-checked')[0]
            }
            let orderNoArr = [];
            for (let i = 0; i < orderModules.length; i++) {
                let orderNo = orderModules[i].getElementsByClassName(
                    "table-item-header_sn__2gbGk"
                )[0]
                let isChecke = false;
                if (location.host == 'fxg.jinritemai.com') {
                    orderNo = orderModules[i].getElementsByClassName('style_id__iHitI')[0];
                    isChecke = undefined !== orderModules[i].getElementsByClassName('auxo-checkbox-wrapper-checked')[0]

                } else if (location.host == 'mms.pinduoduo.com') {
                    isChecke = checkbox[i].firstElementChild.getAttribute("data-checked") == "true"
                }
                //     第一个为抖音的checkbox   第二个为拼多多
                // 由于当抖音执行的时候，会寻找不到元素 因此选择为  抖音的判断在前
                if (
                    isChecke
                ) {
                    // 所需类型为订单号  则传入订单号
                    if (needType == '订单号') {
                        console.log(isChecke, orderNo.innerText);
                        orderNoArr.push(orderNo.innerText);
                    } else if (needType == '快递单号') {
                        let kddh = orderModules[i].getElementsByClassName('kuaiDiDanHao')[0];
                        orderNoArr.push(kddh.innerText)
                    }
                }
            }
            if (orderNoArr.length != 0) {
                // call修改this指向
                let commonModule = new CommonModule(); // XXX  后期需修改
                // 参数1 为返回值return，参数二才是那边获取到的数据
                if (needType == '订单号') {
                    commonModule.DiyAlert.call(this, orderNoArr.join(","));
                } else if (needType == '快递单号') {
                    commonModule.DiyAlert.call(this, orderNoArr.join("\n"));
                }
            }
        });

        return btn;
    }

    createBtn ({ innerText = "按钮", height = "50px", width = "100px" }) {
        var btn = document.createElement("button");
        btn.className = "diyBtn_Class";
        btn.style.height = height;
        btn.style.width = width;
        btn.style.backgroundColor = "rgba(255, 255, 255, 0)";
        btn.innerText = innerText;
        return btn;
    }

    // 创建存放物流信息的模块   返回div元素
    // 需传入物流信息obj
    createLogisticsDiv (obj) {
        // 创建ul 用于存储物流信息
        let div = document.createElement('div');
        div.classList.add('ulKuaiDiWuLiuClass')
        div.style.display = 'flex';
        div.style.visibility = 'hidden'
        div.style.position = 'absolute'
        div.style.left = `-${div.offsetWidth + 50}px`
        div.style.zIndex = 999
        div.style.backgroundColor = 'rgb(255,255,255)'
        div.style.overflow = 'auto'
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const element = obj[key];
                let div_liX = document.createElement('div');
                div_liX.style.padding = '10px'
                if (element != null || element.length > 0 || element != '') {
                    div.style.height = '40%'
                }

                // 内层里面执行对应添加
                for (const keyX in element) {
                    if (Object.hasOwnProperty.call(element, keyX)) {
                        let span = document.createElement('span')
                        span.style.display = 'block'
                        const elementX = element[keyX];
                        span.innerText = elementX
                        div_liX.appendChild(span)
                    }
                }
                div.appendChild(div_liX)
            }
        }

        return div
    }
    // diy弹窗
    /*
     Tips:
    调用 临时缓存（sessionstoreage)：:"DiyAlertInfos"   可获得内容
    isDiy  判断是否需Diy，如需diy，直接返回整个div自定义，需自行添加到页面
    isSetContentToStore 设置内容是否到缓存中
     */
    DiyAlert (
        text = "默认无内容",
        title = "Diy弹窗",
        config = {
            left: `${window.innerWidth / 2}px`,
            top: `${window.innerHeight / 2}px`,
            isDiy: false,
            isSetContentToStore: false,
        }
    ) {
        const BODY = document.getElementsByTagName("body")[0];
        let $commonModule = new CommonModule();
        // 最外层____________↓
        let divMain = document.createElement("div");
        divMain.classList.add("showDiyAlert");
        let divMainStyle = {
            padding: "10px 10px",
            position: "fixed",
            margin: "auto auto",
            border: "1px solid grey",
            borderRadius: "5px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            // 使用窗口高度与宽度，除以二来进行居中
            top: config.top,
            left: config.left,
            zIndex: 999,
        };
        $commonModule.setObjAllStyle.call(this, divMain, divMainStyle);

        // 弹窗标题____________↓
        let spanTitle = document.createElement("span");
        // 弹窗可编辑内容
        let inputText = document.createElement("textarea");
        let inputTextStyle = {
            margin: "10px",
            border: "0px",
            padding: "5px 5px",
            fontSize: "18px",
        };
        $commonModule.setObjAllStyle.call(this, inputText, inputTextStyle);
        // 底部Div      用于装两个按钮
        let buttomDiv = document.createElement("div");
        buttomDiv.style.width = "100%";
        buttomDiv.style.display = "flex";
        buttomDiv.style.justifyContent = "space-around";
        // 按钮
        let btn = newButton();
        let btnCV = newButton("复制");
        spanTitle.innerText = title;
        inputText.value = text;

        let classNames = document.getElementsByClassName(divMain.className);
        // 清除、关闭 弹窗
        function clearAlert (clearTime = 0) {
            setTimeout(() => {
                for (let i = 0; i < classNames.length; i++) {
                    BODY.removeChild(classNames[i]);
                }
            }, clearTime);
        }
        // 点击确认按钮 关闭alert         同时将文本框内容放入sessionStorage里面
        btn.addEventListener("click", function () {
            if (config.isSetContentToStore == true) {
                sessionStorage.setItem("DiyAlertInfos", inputText.value);
            }
            clearAlert();
        });
        btnCV.addEventListener("click", function () {
            inputText.select();
            document.execCommand("copy");
            setTimeout(() => {
                clearAlert();
            }, 500);
        });
        divMain.onkeydown = function (e) {
            if (e.code == "Escape") {
                clearAlert();
            }
        };
        function newButton (btnValue = "确认") {
            let button = document.createElement("button");
            button.style.padding = "5px 5px";
            button.innerText = btnValue;
            return button;
        }
        // 底部DIV插入按钮
        buttomDiv.appendChild(btn);
        buttomDiv.appendChild(btnCV);
        // 整个Div插入 三个部分
        divMain.appendChild(spanTitle);
        divMain.appendChild(inputText);
        divMain.appendChild(buttomDiv);
        if (classNames[0] != undefined) {
            clearAlert();
        }
        // 判断是否需diy
        if (config.isDiy == true) {
            return { divMain, spanTitle, inputText, buttomDiv };
        } else {
            BODY.appendChild(divMain);
        }
    }

    $message () { }
}

window.note = new Note();
window.commonModule = new CommonModule();
class SFAPI {
    constructor() { }
}
let message = new diyMessage();
(function () {
    "use strict";

    // Your code here...
    var DATE = new Date();
    let notePdd = new Note("拼多多");
    window.onkeydown = function (e) {
        // console.log(e)
        // console.log(e.code)
        // 备注 包裹退回优先退
        if (e.code == "KeyW" && e.altKey == true) {
            let htmlBtn = document.querySelectorAll("button");
            for (let i = 0; i < htmlBtn.length; i++) {
                if (
                    htmlBtn[i].innerText == "修改备注" ||
                    htmlBtn[i].innerText == "添加备注" ||
                    htmlBtn[i].innerText == "保存"
                ) {
                    // htmlBtn[i].click()

                    let orderNo =
                        document.getElementsByClassName("Beast__1POzs")[0].innerText;
                    notePdd
                        .update({
                            orderNo: orderNo,
                            remark: `包裹退回优先退【汉金${DATE.toLocaleDateString()}】`,
                        })
                        .then((res) => {
                            console.log(res);
                            // alert(res.data.errorMsg)
                            message.$message({ type: "成功", message: res.errorMsg });
                        });
                }
            }
        }
        // 复制服务数据等
        if (e.code == "KeyP" && e.altKey == true) {
            if (window.location.host == "fxg.jinritemai.com") {
                let douYinStoreData = new PlatformStoreData("抖音");
                douYinStoreData.then((dataArr) => {
                    // 填写数据
                    let fillInData= [];

                    let fwsjDetailTemp = ['订单配送时长','揽收及时率','仅退款自主完结时长','退货退款自主完结时长','IM三分钟平均回复率']
                    let shop_analysisArr  = dataArr[1].data.shop_analysis;
                    for (let fwsjDetailTemp_index = 0; fwsjDetailTemp_index < fwsjDetailTemp.length; fwsjDetailTemp_index++) {
                        const titleText = fwsjDetailTemp[fwsjDetailTemp_index];
                        for (let shop_analyisArr = 0; shop_analyisArr < shop_analysisArr.length; shop_analyisArr++) {
                            const element = shop_analysisArr[shop_analyisArr];
                            if(element.title == titleText){
                                fillInData.push(element.value.value_figure);
                            }
                        }
                    }


                    let fwsjArrTemp = ['goods_score','logistics_score','service_score']
                    for (let fwsjIndex = 0; fwsjIndex < fwsjArrTemp.length; fwsjIndex++) {
                        const key = fwsjArrTemp[fwsjIndex];
                        // console.log(dataArr[0].data[key])
                        fillInData.push(dataArr[0].data[key].value);
                    }

                    console.log(fillInData.join('&'));
                    alert(fillInData.join('&'))
                });
            }
            console.log(e.code);
            if (window.location.host == "s.kwaixiaodian.com") {
                console.log("xxx");
                let arr = [];
                axios
                    .get(
                        "https://s.kwaixiaodian.com/rest/app/tts/apollo/shopexp/getDetail"
                    )
                    .then((res) => {
                        console.log(res.data);
                        let data = res.data.data;
                        arr.push(data.scoreItems[4].subScore[0].subScoreValue);
                        arr.push(data.scoreItems[4].subScore[1].subScoreValue);
                        arr.push(data.cardInfo.score);
                        arr.push(data.scoreItems[2].scoreValue);
                        arr.push(data.scoreItems[3].scoreValue);
                        arr.push(data.scoreItems[4].scoreValue);
                    });
                let clearInterX2 = setInterval(function () {
                    if (arr.length >= 6) {
                        clearInterval(clearInterX2);
                        DiyAlertFn(arr.join("&", "服务数据"));
                    }
                }, 250);
            }
        }
        // 设置是否显示 常用模块
        if (e.code == "KeyB" && e.altKey == true && e.ctrlKey == true) {
            // 控制常用div是否显示           commonModuleFn()
            let commonModuleDiv =
                document.getElementsByClassName("commonModuleDiv")[0];
            // 获取当前display状态   无法通过这个进行设置隐藏或者消失
            let displayValue = commonModuleDiv.style.display;
            if (displayValue == "none" || displayValue == "") {
                commonModuleDiv.style.display = "flex";
            } else {
                commonModuleDiv.style.display = "none";
            }
        }
    };

    // 使用定时器延迟引入常用数据
    setTimeout(() => {
        importCommonDataFn();
    }, 1500);
    // 用来引入某些需多次引入的元素
    let offInter1 = setInterval(function () {
        if (window.axios == undefined || window.axios == null) {
            clearInterval(offInter1);
            importAxiosFn();
        }
    }, 1000);
})();

// 常用模块的DIV
function commonModuleDivFn () {
    let commonModuleDiv = document.createElement("div");
    commonModuleDiv.classList.add("commonModuleDiv");
    commonModuleDiv.style.padding = "10px 20px";
    commonModuleDiv.style.zIndex = 999;
    commonModuleDiv.style.position = "fixed";
    commonModuleDiv.style.top = "10px";
    commonModuleDiv.style.left = "10px";
    commonModuleDiv.style.display = "none";
    let $common = new CommonModule();

    // 获取拼多多售后订单号按钮
    let getPddSalesOrderNoBtn = $common.getAfterSalesOrderBtn('订单号');
    getPddSalesOrderNoBtn.innerText = "获取当前售后订单号";
    // 获取当前选择的快递单号
    let getPddKuaiDiDanHaoBtn = $common.getAfterSalesOrderBtn('快递单号');
    getPddKuaiDiDanHaoBtn.innerText = "获取当前快递单号";
    // 修改备注按钮
    let updateNoteBtn = $common.updateNoteBtn();
    updateNoteBtn.innerText = "修改订单备注";
    let setStoreageBtn = $common.setStoreageBtn();
    // 获取当前页面所有订单号
    let getAllOrderNoBtn = $common.getHTMLALLOderNoBtn();
    // 将需要的元素添加进Div 该数组
    let needAppendDivArr = [getPddSalesOrderNoBtn, getPddKuaiDiDanHaoBtn, updateNoteBtn, setStoreageBtn, getAllOrderNoBtn];
    for (let i = 0; i < needAppendDivArr.length; i++) {
        const element = needAppendDivArr[i];
        commonModuleDiv.appendChild(element);
    }

    document.getElementsByTagName("body")[0].appendChild(commonModuleDiv);
}
commonModuleDivFn();
let clearInterX3 = setInterval(() => {
    let commonModuleDiv = document.getElementsByClassName("commonModuleDiv");
    if (commonModuleDiv == undefined) {
        commonModuleDivFn();
        clearInterval(clearInterX3);
    }
}, 1000);

// 引入常用数据
function importCommonDataFn () {
    importAxiosFn();
}

function importAxiosFn () {
    let axiosX = document.createElement("script");
    axiosX.src = "https://unpkg.com/axios/dist/axios.min.js";
    document.getElementsByTagName("body")[0].appendChild(axiosX);
}

// 定义全局数据★★★★★★★★★★★★
var global_JSON_DATA;
var token = "7b2951b7c02c1573cp81c4d22f8c445b";

let clearInterX1 = setInterval(() => {
    if (window.axios == undefined) {
        let axiosX = document.createElement("script");
        axiosX.src = "https://unpkg.com/axios/dist/axios.min.js";
        // document.getElementsByTagName('body')[0].appendChild(axiosX)
        document.getElementsByTagName("script")[0].appendChild(axiosX);
    }

    let body = document.getElementsByTagName("body")[0];
    if (body.lastChild.nodeName != "BUTTON") {
        let hrefHeader = window.location.href.slice(
            0,
            window.location.href.indexOf("?")
        );
        let needHrefHeader = "https://mms.pinduoduo.com/aftersales-ssr/detail";
        if (hrefHeader == needHrefHeader) {
            // 点击显示全部物流信息
            let ckqb = document.getElementsByClassName("mui-steps-item-title")[1];
            if (ckqb.innerText == "查看全部") {
                ckqb.click();
                getSalesLogisticsFn("拼多多");
            }
            // 解析物流 添加样式 并且添加按钮到页面
            body.appendChild(addSetSaleseLogisticsBtn("设置物流信息样式"));
        }
        // 获取各平台退货或仅退款信息☆☆☆☆☆
        let btn = addBtn("CV售后信息");
        btn.addEventListener("click", () => {
            if (window.axios == undefined || window.axios == null) {
                importAxiosFn();
                message.$message({ message: "Axios未加载！重新刷新下", type: "error" });
                DiyAlertFn("Axios未加载，请刷新页面F5、或重新尝试点击", "Axios未加载");
            }
            let info;
            if (window.location.host == "mms.pinduoduo.com") {
                info = cvPddFn();
            } else if (window.location.host == "s.kwaixiaodian.com") {
                info = cvKuaiShouFn();
            } else if (window.location.host == "fxg.jinritemai.com") {
                info = cvDouYinFn();
            }

            let diyAlertDiv = DiyAlertFn(
                info.join("&"),
                "CV退货信息",
                window.innerWidth / 4 + "px",
                window.innerHeight / 2 + "px",
                true
            );
            diyAlertDiv.style.width = "35%";
            // 获取自定义弹窗底部按钮
            let diyAlert_Bottom_buttons =
                diyAlertDiv.lastElementChild.getElementsByTagName("button");
            for (let i = 0; i < diyAlert_Bottom_buttons.length; i++) {
                const element = diyAlert_Bottom_buttons[i];
                element.style.width = "40%";
            }
            body.appendChild(diyAlertDiv);
        });
        body.appendChild(btn);
        clearInterval(clearInterX1);
    }
}, 1000);

function cvDouYinFn () {
    let dingdanhao =
        document.getElementsByClassName("style_link__LP0u9")[0].innerText;
    let tuiKuanBianHao = "";
    let menDian = "GDD";
    let youXianTui = "";
    // 物流信息
    let wuLiuInfo = getSalesLogisticsFn("抖音");
    let wuLiuZhuangTai = "";
    let kuaiDiDanHao = "";
    let qianShouShiJian = "";
    let JiaGe = "";
    // 获取标签组，以便正确查询到订单号等信息
    let labels = document.getElementsByClassName("style_item-wrapper__3_upj");
    for (let i = 0; i < labels.length; i++) {
        // if(labels[21]){
        //   continue
        // }
        const labelTitle = labels[i].firstChild.innerText;
        const labelValue = labels[i].lastElementChild.innerText;
        // console.log(labelTitle);
        if (labelTitle == "订单编号") {
            dingdanhao = labelValue;
            console.log(labelValue);
        }
        if (labelTitle == "售后编号") {
            tuiKuanBianHao = labelValue;
        }
        if (labelTitle == "退款金额") {
            JiaGe = parseFloat(labelValue.slice(1));
        }
        if (labelTitle == "售后类型") {
            youXianTui =
                labelValue == "已发货仅退款" ? "拦截成功优先退" : "包裹退回优先退";
            wuLiuZhuangTai = labelValue == "已发货仅退款" ? "退回中" : "已签收";

            if (
                labelValue == "已发货仅退款" ||
                labelValue == "仅退款" ||
                "退货退款（原仅退款（无需退货））"
            ) {
                kuaiDiDanHao = document
                    .getElementsByClassName("style_base-info__1t5eh")[0]
                    .children[1].innerText.slice(5);
                getTuiHuo_Info(dingdanhao);
                menDian = global_JSON_DATA[0].netSales[0].logisticsMsgDto[0].sHO_ID;
                console.log(menDian);
            } else {
                document
                    .getElementsByClassName("auxo-tabs")[0]
                    .getElementsByClassName("auxo-tabs-tab")[1]
                    .click();
                // 签收时间
                const qianShouTime = document
                    .getElementsByClassName("auxo-tabs-tabpane")[1]
                    .getElementsByClassName("index_date__33Sfm")[0].innerText;
                qianShouShiJian = labelValue == "已发货仅退款" ? "" : qianShouTime;
                // 筛选正确的快递单号
                let kddhTemp = document
                    .getElementsByClassName("auxo-tabs-tabpane")[1]
                    .getElementsByClassName("style_content__2tUGJ")[1]
                    .children[1].innerText;
                let kddhIndex = kddhTemp.indexOf("：");
                kuaiDiDanHao = kddhTemp.slice(kddhIndex + 1);
                // 获取退货单信息
                getTuiHuo_Info(dingdanhao);
                menDian = global_JSON_DATA[0].netSales[0].logisticsMsgDto[0].sHO_ID;
                console.log(menDian);
            }
        }
    }

    console.log(menDian);
    // 收录信息
    let info = [
        dingdanhao,
        tuiKuanBianHao,
        menDian,
        "",
        youXianTui,
        wuLiuInfo,
        wuLiuZhuangTai,
        kuaiDiDanHao,
        qianShouShiJian,
        JiaGe,
    ];
    console.log(info);
    // alert(info)
    return info;
}

// 复制PDD售后信息
function cvPddFn () {
    // 订单号
    let dingdanhao = document
        .getElementsByClassName("Beast__1POzs")[0]
        .innerText.toString();
    // 售后编号
    let shouHouNo = document.getElementsByClassName("Beast__3ueKc")[0].innerText;
    // 获取退货物流
    //    let tuiHuoLogisstics = getTuiHuoLogistics(dingdanhao,shouHouNo);
    // 获取三福后台管理系统发货门店
    getFaHuo_Info(dingdanhao);
    // 订单号细节信息
    let ddhDetails = global_JSON_DATA;
    // 订单号中的销售详细信息
    let netSales = ddhDetails.netSales;
    // let netSales = getSForderInfo().then(res=>res.data)
    // 门店
    let menDian = "仅退款" ? netSales[0].logisticsMsgDto[0].sHO_ID : "GDD";
    // -----------
    // 售后类型，判断为仅退款还是退货退款
    let isLeiXing = document
        .getElementsByClassName("Beast__3ueKc")[1]
        .innerText.toString();
    // 优先退原因
    let youXianTui = isLeiXing == "仅退款" ? "拦截成功优先退" : "包裹退回优先退";
    // 物流信息
    let wuLiuInfo = getSalesLogisticsFn("拼多多");
    // 物流状态
    let wuLiuZhuangTai = isLeiXing == "仅退款" ? "退回中" : "已签收";
    // 签收时间
    let qianShouShiJian =
        isLeiXing == "仅退款"
            ? ""
            : document
                .getElementsByClassName("mui-steps-item-description")[0]
                .innerText.toString();
    //价格
    let JiaGe;
    // ---------------
    // 快递单号
    let kuaiDiDanHao = document
        .getElementsByClassName("logistics-order-info-tip")[1]
        .innerText.toString();
    getFaHuo_Info(dingdanhao);
    console.log(global_JSON_DATA.data);

    let labels = document.getElementsByClassName("Beast__2-PbN");
    for (let i = 0; i < labels.length; i++) {
        const element = labels[i];
        // 标签标题
        const labelTitle = element.firstChild.innerText;
        // 标签内容
        const labelValue = element.children[1].innerText;
        if (labelTitle == "退款金额：") {
            JiaGe = parseFloat(labelValue.slice(1));
        }
    }

    // 收录信息
    let info = [
        dingdanhao,
        "",
        menDian,
        "",
        youXianTui,
        wuLiuInfo,
        wuLiuZhuangTai,
        kuaiDiDanHao,
        qianShouShiJian,
        JiaGe,
    ];
    //   alert(info)
    console.log(global_JSON_DATA.data);
    return info;
}

// 添加设置售后物流信息按钮   用于添加相关样式
function addSetSaleseLogisticsBtn (innerText = "测试获取物流信息") {
    let btn = addBtn(innerText);
    btn.style.left = "10px";
    // document.getElementsByTagName('body')[0].appendChild(btn)
    btn.addEventListener("click", function () {
        console.log(getSalesLogisticsFn("拼多多"));
    });
    return btn;
}

// 获取售后物流信息
function getSalesLogisticsFn (platform = "拼多多") {
    let infoObj;
    // 物流信息模块  一般分①主要信息、②物流时间
    let logisticsModuleElement;
    switch (platform) {
        case "拼多多":
            logisticsModuleElement = document.getElementsByClassName(
                "mui-steps-item-content"
            );
            infoObj = getPDDSalesLogistics(logisticsModuleElement);
            return resolvingLogisticsChangeStrFn(infoObj);
        case "抖音":
            let douYinSalesModule = document.getElementsByClassName(
                "auxo-timeline index_traces__1HvNt"
            );
            if (douYinSalesModule.length > 1) {
                logisticsModuleElement = douYinSalesModule[1].children;
            } else {
                logisticsModuleElement = douYinSalesModule[0].children;
            }
            infoObj = getPDDSalesLogistics(logisticsModuleElement);
            console.log(infoObj);
            return resolvingLogisticsChangeStrFn(infoObj);
        default:
            break;
    }
}

// 获取PDD售后物流信息
function getPDDSalesLogistics (logisticsModuleElement) {
    let infoArrObj = [];
    for (let i = 0; i < logisticsModuleElement.length; i++) {
        // 物流信息模块元素
        const element = logisticsModuleElement[i];
        let logisticsInfo = element.firstElementChild;
        let logisticsTime = element.lastElementChild;
        let objcet = new Object();
        // 分析物流    需传入物流信息元素
        resolvingLogisticsFn(logisticsInfo);

        // 物流信息
        objcet.logisticsInfo = logisticsInfo.innerText;
        // 物流时间
        objcet.logisticsTime = logisticsTime.innerText;
        infoArrObj[i] = objcet;
    }
    return infoArrObj;
}
// 解析物流 是否有包含相对应字符 如有相对应元素边框线加粗
function resolvingLogisticsFn (logisticsInfoElement, strArr) {
    // 常用字符
    let commonStr = ["广州白云马务网点", "广州白云石马网点", "广州白云大唐路营业点", "广州均禾", "广州市均禾", "三福", "广州白云平沙", "广州白云平沙村营业点"];
    // 数字大于0，则补充字符
    if (strArr > 0) {
        commonStr = commonStr.concat(strArr);
    }
    if (
        logisticsInfoElement.innerText == null ||
        logisticsInfoElement.innerText == ""
    ) {
        console.log("物流信息为空！");
    }
    // 解析是否有相对应字符，如有相对应字符边框线加粗
    let borderWidth = 0;
    for (let i = 0; i < commonStr.length; i++) {
        const element = commonStr[i];
        if (logisticsInfoElement.innerText.indexOf(element) !== -1) {
            borderWidth++;
            logisticsInfoElement.style.border = `${borderWidth}px dashed grey`;
        }
    }

    // 判断是否有退回物流
    let tuiHuiStr = ["撤单", "拦截", "退回", "拒签", "退回"];
    // 解析是否有相对应字符，如有相对应字符 则外边框下划线红色
    for (let i = 0; i < tuiHuiStr.length; i++) {
        const element = tuiHuiStr[i];
        if (logisticsInfoElement.innerText.indexOf(element) !== -1) {
            logisticsInfoElement.style.borderBottom = `2px dashed red`;
        }
    }
}

// 解析物流信息转为字符串形式
function resolvingLogisticsChangeStrFn (obj) {
    let str = "";

    for (let i = 0; i < obj.length; i++) {
        const element = obj[i];
        str += `${element.logisticsInfo}\n${element.logisticsTime}\n`;
    }
    return str;
}

function cvKuaiShouFn () {
    let dingdanhao = "";
    let tuiKuanBianHao = "";
    let menDian = "GDD";
    let youXianTui = "";
    let wuLiuZhuangTai = "";
    let kuaiDiDanHao = "";
    let qianShouShiJian = "";
    let JiaGe = "";
    // 获取标签组，以便正确查询到订单号等信息
    let labels = document.getElementsByClassName("label__BFlU4");
    let labelValue = document.getElementsByClassName("content__Rf0s7");
    for (let i = 0; i < labels.length; i++) {
        const element = labels[i];
        const value = labelValue[i].firstChild.innerText;
        if (element.innerText == "订单编号") {
            dingdanhao = value;
        }
        if (element.innerText == "售后单号") {
            tuiKuanBianHao = value;
        }
        if (element.innerText == "退款金额") {
            JiaGe = parseFloat(value.slice(1));
        }
        if (element.innerText == "售后类型") {
            youXianTui = value == "仅退款" ? "拦截成功优先退" : "包裹退回优先退";
            wuLiuZhuangTai = value == "仅退款" ? "退回中" : "已签收";
            // 签收时间
            const qianShouTime = document.getElementsByClassName(
                "ant-steps-item-subtitle"
            )[0].innerText;
            qianShouShiJian = value == "仅退款" ? "" : qianShouTime;
        }
        // 筛选正确的快递单号
        let kddhTemp = document.getElementsByClassName("ant-tabs-extra-content")[0]
            .innerText;
        let kddhIndex = kddhTemp.indexOf("：");
        kuaiDiDanHao = kddhTemp.slice(kddhIndex + 1);
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
    ];
    // alert(info)
    return info;
}

// 复制退货单号PDD
setTimeout(() => {
    if (window.location.host == "mms.pinduoduo.com") {
        pddCVtuiHuo();
        addCommonEventListenerBtn('拼多多');
        // } else if (window.location.host == "s.kwaixiaodian.com") {
        // cvKuaiShouFn()
    } else if (window.location.host == "fxg.jinritemai.com") {
        douYinCVtuiHuo();
        addCommonEventListenerBtn('抖音');
    }

    /* setTimeout(() => {
      // 获取自己自定义的按钮，来隐藏某些暂时不需要的按钮
      let setShowBtn = addBtn('isShow')
      let diyBtn = document.getElementsByClassName('diyBtn_Class')
      let needHiddenBtn = ['设置物流信息样式', 'addEvent']
      setShowBtn.style.top = '5px'
      setShowBtn.style.left = '5px'
      let isShowBoolean = false;
      isShowDiyBtnFn(diyBtn, needHiddenBtn, isShowBoolean)
      setShowBtn.addEventListener('click', function () {
          isShowBoolean = !isShowBoolean
          isShowDiyBtnFn(diyBtn, needHiddenBtn, isShowBoolean)
      })
  
  
      document.getElementsByTagName('body')[0].appendChild(setShowBtn);
      // 是否显示按钮
      function isShowDiyBtnFn (diyBtn, needHiddenBtn, isShowBoolean = false) {
          console.log(isShowBoolean);
          for (let i = 0; i < diyBtn.length; i++) {
              const element = diyBtn[i];
              for (let j = 0; j < needHiddenBtn.length; j++) {
                  // is按钮文字与需要隐藏的按钮文字是否相同
                  console.log(element.innerText, needHiddenBtn[j]);
                  if (element.innerText == needHiddenBtn[j]) {
                      console.log(element, element.style.visibility);
                      element.style.display = isShowBoolean == false ? 'block' : 'none'
                  }
  
              }
          }
      }
  }, 500); */
}, 1500);

function douYinCVtuiHuo () {
    let btn = addBtn("CV退货单号");
    btn.style.top = "160px";
    // 销售模块
    let salesModule = document.getElementsByClassName(
        "index_tableRow__2Okoz mortise-rich-table-row"
    );
    let orderNumberArr = [];
    document.getElementsByTagName("body")[0].appendChild(btn);
    btn.addEventListener("click", function () {
        orderNumberArr = [];
        let x1 = document.getElementsByClassName("style_id__iHitI");
        console.log(x1);
        for (let i = 0; i < x1.length; i++) {
            if (i % 2 == 0) {
                orderNumberArr.push(x1[i].innerText);
            }
        }
        /*
        for (let i = 0; i < salesModule.length; i++) {
            // 抖音模块订单号
            const orderNumber = salesModule[i].firstElementChild.getElementsByClassName('style_orderId__3PcRh')[0].firstElementChild.innerText;
            // 模块主要内容
            const elementContent = salesModule[i].lastElementChild;
            // 同意售后         用于判断①同意退货②同意退款
            const tysh = elementContent.getElementsByClassName('styles_btn__34zFr')[0]
            if (tysh.innerText == '同意退货') {
                orderNumberArr.push(orderNumber)
            }
        }
        */
        // alert(orderNumberArr.join(','))
        DiyAlertFn(orderNumberArr.join(","), "退货单号");
    });
}

function pddCVtuiHuo () {
    let btn = addBtn("CV退货单号");
    btn.style.top = "160px";
    // 销售模块
    let salesModule = document.getElementsByClassName(
        "after-sales-table_order_item__3QqLW"
    );
    let orderNumberArr = [];
    document.getElementsByTagName("body")[0].appendChild(btn);
    btn.addEventListener("click", function () {
        orderNumberArr = [];
        for (let i = 0; i < salesModule.length; i++) {
            // 模块订单号
            const orderNumber = salesModule[
                i
            ].firstElementChild.getElementsByClassName(
                "table-item-header_sn__2gbGk"
            )[0].innerText;
            // 模块主要内容
            const elementContent = salesModule[i].lastElementChild;
            // 同意售后         用于判断①同意退货②同意退款
            const tysh = elementContent.getElementsByClassName(
                "BTN_outerWrapper_scftb7"
            )[0];
            if (tysh.innerText == "同意退货") {
                orderNumberArr.push(orderNumber);
            }
        }
        // alert(orderNumberArr.join(','))
        DiyAlertFn(orderNumberArr.join(","), "退货单号");
    });
}

// 添加按钮 并且返回按钮  编辑样式
function addBtn (innerText = "CV信息") {
    var btn = document.createElement("button");
    btn.className = "diyBtn_Class";
    btn.style.height = "50px";
    btn.style.width = "100px";
    btn.style.backgroundColor = "rgba(255, 255, 255, 0)";
    btn.style.position = "fixed";
    btn.style.top = "100px";
    btn.style.right = "100px";
    btn.innerText = innerText;
    return btn;
}

// diy弹窗
function DiyAlertFn (
    text = "默认无内容",
    title = "Diy弹窗",
    left = `${window.innerWidth / 2}px`,
    top = `${window.innerHeight / 2}px`,
    isDiy = false
) {
    const BODY = document.getElementsByTagName("body")[0];
    // 最外层____________↓
    let divMain = document.createElement("div");
    divMain.style.padding = "10px 10px";
    divMain.style.position = "fixed";
    divMain.style.margin = "auto auto";
    divMain.style.border = "1px solid grey";
    divMain.style.borderRadius = "5px";
    divMain.style.display = "flex";
    divMain.style.flexDirection = "column";
    divMain.style.backgroundColor = "white";
    divMain.className = "showDiyAlert";
    // 使用窗口高度与宽度，除以二来进行居中
    divMain.style.top = top;
    divMain.style.left = left;
    divMain.style.zIndex = 999;
    // 弹窗标题____________↓
    let spanTitle = document.createElement("span");
    // 弹窗可编辑内容
    let inputText = document.createElement("textarea");
    inputText.style.margin = "10px";
    inputText.style.border = "0px";
    inputText.style.padding = "5px 5px";
    inputText.style.fontSize = "18px";
    // 底部Div      用于装两个按钮
    let buttomDiv = document.createElement("div");
    buttomDiv.style.width = "100%";
    buttomDiv.style.display = "flex";
    buttomDiv.style.justifyContent = "space-around";
    // 按钮
    let btn = newButton();
    let btnCV = newButton("复制");
    spanTitle.innerText = title;
    inputText.value = text;

    let classNames = document.getElementsByClassName(divMain.className);
    // 清除、关闭 弹窗
    function clearAlert () {
        for (let i = 0; i < classNames.length; i++) {
            BODY.removeChild(classNames[i]);
        }
    }
    // 点击确认按钮 关闭alert
    btn.addEventListener("click", function () {
        clearAlert();
    });
    btnCV.addEventListener("click", function () {
        inputText.select();
        document.execCommand("copy");
        setTimeout(() => {
            clearAlert();
        }, 500);
    });
    divMain.onkeydown = function (e) {
        if (e.code == "Escape") {
            clearAlert();
        }
    };
    function newButton (btnValue = "确认") {
        let button = document.createElement("button");
        button.style.padding = "5px 5px";
        button.innerText = btnValue;
        return button;
    }
    // 底部DIV插入按钮
    buttomDiv.appendChild(btn);
    buttomDiv.appendChild(btnCV);
    // 整个Div插入 三个部分
    divMain.appendChild(spanTitle);
    divMain.appendChild(inputText);
    divMain.appendChild(buttomDiv);
    if (classNames[0] != undefined) {
        clearAlert();
    }
    // 判断是否需diy
    if (isDiy == true) {
        return divMain;
    } else {
        BODY.appendChild(divMain);
    }
}

// 查询订单号信息
function getFaHuo_Info (dingDanHao) {
    let queryStr = "ordId=" + dingDanHao;
    getSForderInfo(queryStr);
}

function getTuiHuo_Info (dingDanHao) {
    let queryStr = "tbOrdIds=" + dingDanHao;
    const url =
        "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getRefundAndSalesReturnDetail?";
    getSForderInfo(queryStr, url);
}

// 将这个添加到 延迟3000毫米后的里边  if (window.location.host == "mms.pinduoduo.com")
function addCommonEventListenerBtn (platform = '拼多多') {
    let btn = addBtn("ADDCommon事件");
    btn.style.top = "10px";
    btn.style.zIndex = 9999
    document.getElementsByTagName("body")[0].appendChild(btn);
    btn.addEventListener("click", function () {
        if (platform == '拼多多') {
            addSalseTypeEventListenerFn();
            if (location.href == 'https://mms.pinduoduo.com/aftersales/work_order/list') {
                addSalseTypeEventListenerFn(platform, '工单');
            }
        } else if (platform == '抖音') {
            addSalseTypeEventListenerFn(platform);
        }

    });
}

// 添加售后单类型
function addSalseTypeEventListenerFn (platform = '拼多多', type = '售后') {
    // 获取售后单类型按钮 并且添加点击事件
    // 默认拼多多 售后
    let salesTypeBtn = document.getElementsByClassName("TAB_capsule_scftb7")
    if (platform == '拼多多' && type == '工单') {
        salesTypeBtn = document.getElementsByClassName('Grid_col_1o9lsoy Grid_colNotFixed_1o9lsoy BeastQuickFilter___item___1_qzD')

        document.getElementsByClassName('BTN_outerWrapper_scftb7 BTN_primary_scftb7 BTN_medium_scftb7 BTN_outerWrapperBtn_scftb7')[0].addEventListener('click', () => {
            setTimeout(() => {
                showUseInfoFn('拼多多', type);
            }, 500);
        })

    } else if (platform == '抖音' && type == '售后') {
        salesTypeBtn = document.getElementsByClassName('styles_item__1mj_S')
        document.getElementsByClassName('auxo-btn auxo-btn-dashed auxo-btn-sm')[0].addEventListener('click', (res) => {
            setTimeout(() => {
                showUseInfoFn('抖音', type);
            }, 500);
        })

    }
    for (let i = 0; i < salesTypeBtn.length; i++) {
        const element = salesTypeBtn[i];
        element.style.color = "#8cdeff";
        element.addEventListener("click", function (e) {
            setTimeout(() => {
                if (platform == '拼多多') {
                    showUseInfoFn(platform, type);
                } else if (platform == '抖音') {
                    showUseInfoFn(platform, type);
                }
            }, 500);
        });
        console.dir(element);
    }
}

// 显示平台常用显示信息     如：备注
function showUseInfoFn (platform = '拼多多', type = '售后') {
    // 大的方块 classX样式
    let classX = '';
    let orderNoClass = '';
    if (platform == '拼多多') {
        if (type == '售后') {
            classX = "after-sales-table_order_item__3QqLW"
            orderNoClass = "table-item-header_sn__2gbGk"
        } else if (type == '工单') {
            classX = "listItem_itemHeader__2CBuV"
            orderNoClass = 'tableItemHeader_sn__xXp1-'
        }
    } else if (platform == '抖音') {
        if (type == '售后') {
            classX = "auxo-table-row auxo-table-row-level-0"
            orderNoClass = "style_id__iHitI"
        }
        // else if (type == '工单') {
        //     classX = "listItem_itemHeader__2CBuV"
        //     orderNoClass = 'tableItemHeader_sn__xXp1-'
        // }
    }

    let orderModules = document.getElementsByClassName(classX);
    let note = new Note("拼多多");
    let $common = new CommonModule();
    // let orderModules = document.getElementsByClassName(
    //   "after-sales-table_order_item__3QqLW"
    // );
    let $resolvingSForder = new ResolvingSFOrder();
    for (let i = 0; i < orderModules.length; i++) {
        let orderModule = orderModules[i];
        let orderNo = orderModules[i].getElementsByClassName(orderNoClass)[0].innerText;
        let div = document.createElement("div");
        div.classList.add("commonShowInfo");
        div.style.padding = "10px 20px";
        div.style.width = "100%";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        // 抖音的订单模块需要另外加高
        if (platform == '抖音') {
            div.style.top = '80px'
            div.style.zIndex = 9999
            // 将订单模块高度调高
            orderModule.style.height = '100px'
        }
        // 订单分割后的模块数组
        let orderModuleSplitArr = orderModule.innerText.split("\n");
        let leftDiv = document.createElement("div");
        let rightDiv = document.createElement("div");
        leftDiv.style.fontSize = "18px";
        rightDiv.style.fontSize = "18px";
        // if (orderModuleSplitArr[orderModuleSplitArr.length - 1] == "查看备注") {
        let noteData = note.query({ orderNo: orderNo });
        // console.log(noteData);
        noteData.then((res) => {
            // rightDiv.innerText = `备注：${res.result.note}`;
            let rightDivSpan = document.createElement('span');
            rightDivSpan.innerText = `备注：${res.result.note}`;
            rightDiv.appendChild(rightDivSpan)
        });
        // }
        let sfOrderArr = $resolvingSForder.jsonChangeObject();
        for (let j = 0; j < sfOrderArr.length; j++) {
            if (sfOrderArr[j].tb_ord_id == orderNo) {
                let netSales = sfOrderArr[j].netSales;
                for (let x = 0; x < netSales.length; x++) {
                    let logisticsMsgDto = netSales[x].logisticsMsgDto;
                    let logisticsDiv = document.createElement("div");
                    logisticsDiv.classList.add("logisticsDiv");
                    logisticsDiv.style.display = 'block'
                    for (let y = 0; y < logisticsMsgDto.length; y++) {
                        let element = logisticsMsgDto[y];
                        // 快递公司
                        let kuaiDiGongSi = element.lOGISTICCORPNAME;
                        // 门店
                        let menDian = element.sHO_ID;
                        // 是否对总
                        let isDuiZong = element.logisticDz == 1 ? "对总" : "";
                        // 快递单号
                        let kuaiDiDanHao = element.lOGISTICNO;
                        // 快递物流信息
                        let kuaiDiWuLiu = element.lOGISTICDETAILS
                        // console.log(kuaiDiWuLiu)
                        // 需要添加的元素
                        let needAddElement = [
                            kuaiDiGongSi,
                            menDian,
                            isDuiZong,
                            kuaiDiDanHao,
                            kuaiDiWuLiu
                        ];
                        for (let e = 0; e < needAddElement.length; e++) {
                            let span = document.createElement("span");
                            span.innerText = needAddElement[e].toString();
                            // 当为对总的时候改下样式
                            if (needAddElement[e].toString() == "对总") {
                                span.style.backgroundColor = "rgb(255, 52, 7)";
                                span.style.color = "rgb(255, 255, 255)";
                            }


                            // 当遍历的所需元素和快递物流变量相同则执行   并且跳到下一次循环
                            if (needAddElement[e] == kuaiDiWuLiu) {
                                let logisticInfoDiv = $common.createLogisticsDiv(needAddElement[e])
                                logisticInfoDiv.style.flexWrap = 'wrap'
                                logisticInfoDiv.style.width = '400px'
                                logisticInfoDiv.style.left = `-${logisticInfoDiv.offsetWidth + 50}px`
                                logisticsDiv.addEventListener('mouseenter', () => {
                                    // console.log('mouseenter');
                                    logisticInfoDiv.style.visibility = 'visible'
                                })
                                logisticsDiv.addEventListener('mouseover', () => {
                                    // console.log('mouseenter');
                                    logisticInfoDiv.style.visibility = 'visible'
                                    this.style.border = '3px soild grad';
                                })
                                logisticsDiv.addEventListener('mouseout', () => {
                                    // console.log('mouseout');
                                    logisticInfoDiv.style.visibility = 'hidden'
                                    this.style.border = '0px soild grad';
                                })

                                logisticsDiv.appendChild(logisticInfoDiv);
                                continue;
                            }
                            // 快递单号
                            if (needAddElement[e] == kuaiDiDanHao) {
                                span.classList.add('kuaiDiDanHao');
                                span.style.marginLeft = '3px'
                            }

                            logisticsDiv.appendChild(span);
                        }
                    }

                    leftDiv.appendChild(logisticsDiv);
                }
            }
        }

        // 复制售后信息
        let cvShouHouInfoBtn = document.createElement('button');
        cvShouHouInfoBtn.innerText = 'copyAfterSales'
        cvShouHouInfoBtn.addEventListener('click',(e)=>{
            console.log(e.path)
            console.log(orderNo);
       })

        rightDiv.appendChild(cvShouHouInfoBtn)
        div.appendChild(leftDiv);
        div.appendChild(rightDiv);
        if (
            orderModule.lastElementChild.className.indexOf("commonShowInfo") != -1
        ) {
            orderModule.lastElementChild.remove();
        }

        orderModule.appendChild(div);
    }
}

function getSForderInfo (
    queryStr = "ordId=221110-563827219310886",
    url = "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail?"
) {
    url = url + queryStr;
    let sfLoginToken = localStorage.getItem("sanFuLoginToken");
    if (sfLoginToken !== null) {
        token = sfLoginToken;
    }
    return fetch(url, {
        method: "get",
        headers: {
            authorization: token,
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            // 函数体
            global_JSON_DATA = res.data;
            console.log(global_JSON_DATA);
            if (res.code == 10001) {
                getLoginToken();
            }

            return res;
        });

    // axios({
    //   method: "get",
    //   url: url,
    //   headers: { authorization: token },
    // }).then((res) => {
    //   // 函数体
    //   global_JSON_DATA = res.data;
    //   console.log(global_JSON_DATA);
    //   setTimeout(() => {
    //     console.log("500ms");
    //     console.log(global_JSON_DATA);
    //   }, 500);
    //   if (global_JSON_DATA.code == 10001) {
    //     getLoginToken();
    //   }
    // });
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

// 获取登录的ToKen
function getLoginToken () {
    return axios({
        method: "post",
        url: "https://m.sanfu.com/ms-sanfu-mgr-mall/system/login",
        data: JSON.stringify({
            userId: "ZHJ165",
            userPassword: "sf123321",
        }),
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
    }).then((res) => {
        // 函数体
        let resToken = res.data.data.token;
        token = resToken;
        console.log(res.data);
        localStorage.setItem("sanFuLoginToken", resToken);
        return res;
    });
}

// 获取退货物流信息       应return 具体物流
function getTuiHuoLogistics (dingdanhao, shouHouNo) {
    // 获取订单售后细节        使用发货ID去获取退货物流
    return axios
        .post("https://mms.pinduoduo.com/mercury/merchant/afterSales/detail", {
            id: shouHouNo,
            orderSn: dingdanhao,
        })
        .then((res) => {
            console.log(res.data);
        });
}


















/*



<div class="clipboard-show-box">
<img class="clipboard-show-img" src="blob:https://mms.pinduoduo.com/78431dac-6df1-4a2d-8648-381594dc0bda" alt="">
<div class="clipboard-show-desc">已识别截图</div>
<div>
<div data-testid="beast-core-upload">
<input data-testid="beast-core-upload-input" type="file" style="display: none;">
<div class="clipboard-show-upload-btn">一键上传</div>
</div></div>
<i data-testid="beast-core-icon-close" class="ICN_outerWrapper_u67w5g ICN_type-close_u67w5g  clipboard-show-close-icon" style="color: rgba(0, 0, 0, 0.4);">
</i></div>


*/