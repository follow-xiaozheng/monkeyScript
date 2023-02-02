// ==UserScript==
// @name         3F后台管理系统—便捷插件X
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://m.sanfu.com/newmgr/*
// @icon         https://www.google.com/s2/favicons?domain=sanfu.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    let axiosX = document.createElement("script");
    axiosX.src = "https://unpkg.com/axios/dist/axios.min.js";
    document.getElementsByTagName("body")[0].appendChild(axiosX);
})();

//  常用变量与全局变量
var infoModule = document.getElementsByClassName("ordersty");
var BODY = document.getElementsByTagName("body")[0];
var DATE = new Date();
var SFToken = "14d35d548273efpe1656a7bec748491e";


class SFAPI {
    getOrderDetailAPI (orderNo) {
        const baseURL = "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail?ordId=" + orderNo;
        const orderInfoApi = axios({
            method: "get",
            url: baseURL,
            headers: { authorization: SFToken },
        })
        return orderInfoApi
    }
}
let sfapi = new SFAPI();

setTimeout(() => {
    getTokenApi().then(res => {
        console.log(res, 'res');
        if (localStorage.getItem("SFloginToken") != null) {
            console.log(localStorage.getItem("SFloginToken"));
            SFToken = localStorage.getItem("SFloginToken");
        }
    })


    let btn = createBtn('获取订单号详细信息');
    btn.classList.add('setShowBtn');
    btn.style.display = 'block'
    btn.style.position = 'fixed'
    btn.style.top = '100px'
    btn.style.left = '120px'
    document.getElementsByTagName('body')[0].appendChild(btn);

    btn.addEventListener('click', function () {
        let orderNo = prompt('请输入需要查询的订单号');
        if (orderNo != null || orderNo != '') {
            let orderNoArr = orderNo.split(',');
            let orderPromiseArr = []
            for (let i = 0; i < orderNoArr.length; i++) {
                const orderNum = orderNoArr[i];
                // 使用数组去接受返回的promise
                orderPromiseArr.push(sfapi.getOrderDetailAPI(orderNum))
            }

            console.log(orderPromiseArr);

            Promise.all(orderPromiseArr).then((res) => {
                console.log(res);
                // 订单信息数组 
                let orderInfoArr = []
                let orderWLXX = []
                for (let i = 0; i < res.length; i++) {
                    const resX = res[i];
                    let netSales = resX.data.netSales
                    let resData = resX.data;
                    if (netSales == undefined || netSales == null) {
                        netSales = resX.data.data.netSales
                        resData = resX.data.data;
                    }
                    // 将每个promise值的data数据放入
                    orderInfoArr.push(resData);
                    for (let j = 0; j < netSales.length; j++) {
                        const salse = netSales[j];
                        // netSales.logisticsMsgDto
                        for (let y = 0; y < salse.logisticsMsgDto.length; y++) {
                            const wlxx = salse.logisticsMsgDto[y];
                            let obj = {
                                wuLiuDanHao: wlxx.lOGISTICNO,
                                menDian: wlxx.sHO_ID,
                                isDuiZong: wlxx.logisticDz
                            };
                            orderWLXX.push(obj)
                        }
                    }
                }

                console.log(orderWLXX);
                console.log(orderInfoArr);
                DiyAlertFn(JSON.stringify(orderInfoArr))
            })
        }
    })

    window.onkeydown = function (e) {
        if (e.code == "KeyB" && e.altKey == true && e.ctrlKey == true) {
            let displayValue = btn.style.display;
            if (displayValue == "none" || displayValue == "") {
                btn.style.display = "block";
            } else {
                btn.style.display = "none";
            }
        }
    }
}, 1500);
var DengJiTime = `【汉金${DATE.getFullYear()}年${DATE.getMonth() + 1
    }月${DATE.getDate()}日】`;
var windowObj = {
    height: window.innerHeight,
    width: window.innerWidth,
};
var infosObj = {};
// 使用定时器，来等待页面与相关组件加载完毕，在进行添加相对应的函数
// 点击按钮查询按钮
setTimeout(function () {
    document.getElementsByClassName("el-input__inner")[1].value =
        "2889264852503798337";
    let inputInnerValue =
        document.getElementsByClassName("el-input__inner")[1].value;
    // 查询按钮
    let query_btn = document.getElementsByClassName(
        "el-button el-button--primary is-plain"
    )[0];
    query_btn.addEventListener("click", function () {
        // let infoDetails = getInfosFn(inputInnerValue);
        let infoDetails = getInfosFn(
            document.getElementsByClassName("el-input__inner")[1].value
        );
        // console.log(sessionStorage.getItem('orderInfo'));
        let clearBtnInt = setInterval(() => {
            // console.log(sessionStorage.getItem('orderInfo'))
            if (sessionStorage.getItem("orderInfo") != null) {
                clearInterval(clearBtnInt);
                // console.log(sessionStorage.getItem('orderInfo'))
            }
        }, 100);

        setTimeout(() => {
            setGoodsListRowFn();
            setTimeout(() => {
                setGoodsListRowFn();
            }, 1000);
            // 添加改地址模块
            addGDZmodule();
        }, 500);

        // console.log("获取后");
        // console.log(infoDetails);
        // console.log(typeof infoDetails)
        // Your code here...
        // 添加点击后 登记信息按钮
        addClickDengJiInfoFn();
        clearUselessFn();
    });

    positionFn();
    // 计算模块
    let newCompute = createComputeFn();
    newCompute.style.position = "fixed";
    newCompute.style.top = "5px";
    newCompute.style.right = "100px";
    document.getElementsByClassName("main-container")[0].appendChild(newCompute);
}, 1500);

// 获取 快递单号等信息到最前面
// 设置销售行的各项数据
function setGoodsListRowFn () {
    //infoModule= document.getElementsByClassName("ordersty")
    // 添加按钮跳转页面
    // 每个模块的
    for (let i = 0; i < infoModule.length; i++) {
        // 定义商品一行
        let goodsListRow = infoModule[i].getElementsByClassName("el-table__row");
        for (let j = 0; j < goodsListRow.length / 2; j++) {
            // 物流单号的下标位置
            const wldhIndex = 17;
            let wuLiuDanHao = goodsListRow[j].children[wldhIndex].innerText;
            let wuLiuGongSi = goodsListRow[j].children[wldhIndex - 1].innerText;
            let menDian = goodsListRow[j].children[wldhIndex - 4].innerText;
            let newDiv = creatDiv();
            let text = "";
            // 分配门店的下标位置
            const fpmdIndex = 13;
            let fpmd = goodsListRow[j].children[fpmdIndex];
            // console.log(fpmd);
            // 点击跳转企业微信对应负责人
            fpmd.addEventListener("click", function () {
                console.log([j]);
                toWXworkPersonInCharge([j]);
            });
            if (menDian == "9955" || menDian == "GDD") {
                let spanX = document.createElement("span");
                spanX.style.color = "#409eff";
                // spanX.style.borderRadius = "5px"
                spanX.style.padding = "1px 2px";
                text += wuLiuGongSi.slice(0, 2);
                text += menDian;
                spanX.innerText = text;
                newDiv.appendChild(spanX);
            } else {
                text += wuLiuGongSi.slice(0, 2);
                text += menDian;
                newDiv.appendChild(creatSpan(text));
            }
            // 不为-1则为对总
            if (wuLiuDanHao.indexOf("对总") != -1) {
                let spanX = document.createElement("span");
                spanX.style.backgroundColor = "rgb(255, 52, 7)";
                spanX.style.color = "rgb(255, 255, 255)";
                spanX.style.borderRadius = "5px";
                spanX.style.padding = "1px 2px";
                spanX.innerText = wuLiuDanHao.slice(0, 2);
                newDiv.appendChild(spanX);
            }
            let aX = document.createElement("a");
            let inputX = document.createElement("input");
            aX.style.padding = "0px 10px";
            aX.innerText = wuLiuDanHao;
            inputX.value = wuLiuDanHao;
            aX.addEventListener("click", function () {
                inputX.select();
                document.execCommand("copy");
            });
            newDiv.appendChild(aX);

            // 判断节点类型 名字
            if (goodsListRow[j].lastChild.nodeName != "BUTTON") {
                let toHTML_btn = createBtn();
                toHTMLfn(j, toHTML_btn);
                goodsListRow[j].appendChild(newDiv);
                goodsListRow[j].appendChild(toHTML_btn);
            }
        }
    }
    // setTimeout(() => {
    //   clearInterval(clearTempInter)
    // }, 1000);
}

// 添加改地址模块
function addGDZmodule () {
    // 添加改地址模块
    let btn = createBtn("改地址", "5px 10px");
    let textare = document.createElement("textarea");
    textare.style.position = "absolute";
    textare.style.background = "rgba(0,0,0,0)";
    btn.style.marginLeft = "10px";
    document.getElementsByClassName("beizhu")[0].appendChild(btn);
    document.getElementsByClassName("beizhu")[0].appendChild(textare);
    btn.addEventListener("click", function () {
        // 输入框内容
        let inputValue = document.getElementsByClassName(
            "input-with-select el-input el-input-group el-input-group--prepend el-input--suffix"
        )[0].lastElementChild.value;
        // 改地址的输入框内容
        textare.value = inputValue + "改地址\n" + textare.value;
        textare.select();
        document.execCommand("copy");
        console.log(textare.value);
    });
}

// 清除一些无用的元素
function clearUselessFn (params) {
    // 清除无用的查询单号
    let elTag = document.getElementsByClassName("el-tag--light");
    for (let i = 0; i < elTag.length; i++) {
        const element = elTag[i];
        element.style.display = "none";
    }
}

// 添加点击后 登记信息按钮
function addClickDengJiInfoFn (params) {
    for (let i = 0; i < infoModule.length; i++) {
        // 获取订单号    已转字符串
        let orderID = infoModule[0]
            .getElementsByClassName("spaceBetween")
        [0].firstElementChild.children[1].innerText.match(/[0-9]+/g)
            .toString();
        // 获取店铺名
        let storeName = infoModule[0]
            .getElementsByClassName("spaceBetween")
        [0].firstElementChild.children[0].innerText.toString();
        // _____单独商品相关详细信息____
        // goods翻译商品  所有商品ALL
        let goodsListRow = infoModule[i].getElementsByClassName("el-table__row");
        // 循环参数   注：系统有重复数据，因此除以2
        for (let j = 0; j < goodsListRow.length / 2; j++) {
            let data_name = "data" + j;
            infosObj[data_name] = {
                dingDanHao: orderID,
                dianPuMing: storeName,
                // 色号
                seHao:
                    goodsListRow[j].children[3].innerText,
                // 门店
                menDian: goodsListRow[j].children[13].innerText,
            };
            // _______________________________

            // console.log(goodsListRow[j].children[2])
        }
    }
}

function toHTMLfn (j, button) {
    // 跳转页面
    button.addEventListener("click", function (e) {
        let data_name = "data" + j;
        window.open(`
                https://work.bytenew.com/appMobile.html#/shareWorkTable/add/1687020_1240_1016304_32520604689828?dingDanHao=${infosObj[data_name].dingDanHao}&dianPuMing=${infosObj[data_name].dianPuMing}&seHao=${infosObj[data_name].seHao}&menDian=${infosObj[data_name].menDian}
                `);
    });
}
// 新按钮
function createBtn (value = "登记", padding = "10px 20px") {
    let btn = document.createElement("button");
    btn.style.padding = padding;
    btn.style.zIndex = 999;
    btn.innerText = value;
    return btn;
}
function creatDiv (text = "") {
    let div = document.createElement("div");
    // div.style.width = "100px"
    // div.style.height = "50px"
    div.style.position = "absolute";
    div.style.left = "10px";
    div.style.zIndex = 999;

    div.innerText = text;
    return div;
}
function creatSpan (text = "") {
    let span = document.createElement("span");
    span.innerText = text;
    return span;
}
function positionFn () {
    let queryInput = document.getElementsByClassName(
        "input-with-select el-input el-input-group el-input-group--prepend el-input--suffix"
    )[0];
    let queryBtn = document.getElementsByClassName(
        "el-button el-button--primary is-plain"
    )[0];

    queryInput.style.cssText = `
                    position: fixed;
                        left:330px;
                        top:3px;
                        width:500px;
                    `;
    queryBtn.style.cssText = `
                    position: fixed;
                        left:850px;
                        top:3px;
                    `;

    queryInput.onkeydown = function (e) {
        // console.log(e);
        if (e.code == "KeyQ" && e.altKey == true) {
            document.execCommand("Overwrite"); // 谷歌内核无效
            queryBtn.click();
        }
        if (e.code == "KeyV" && e.ctrlKey == true) {
            setTimeout(() => {
                queryBtn.click();
            }, 100);
        }
    };
    window.onkeydown = function (e) {
        // console.log(e);
        if (e.code == "KeyQ" && e.altKey == true) {
            // console.log(e);
            queryInput.children[1].select();
            queryInput.lastElementChild.focus();
        }

    };
}

function createComputeFn () {
    let div = document.createElement("div");
    let huoHaoInput = createInputX();
    let input1 = createInputX();
    let input2 = createInputX();
    input1.className = "computeCLass_input";
    input2.className = "computeCLass_input";
    huoHaoInput.className = "huoHaoClass_input";
    // 用input来当做span装内容
    let span = document.createElement("input");
    let btnJJBCJ = createBtn("降价");
    let btnCPBCJ = createBtn("重拍");
    let btnWZBC = createBtn("污渍");
    let btnPSBC = createBtn("破损");
    let btnTXBC = createBtn("脱线");
    let btnDLBC = createBtn("掉落");
    let sum = 0;
    div.className = "computeCLass";
    div.style.height = "40px";
    span.style.fontSize = "18px";
    span.style.border = "0px";
    span.style.width = "130px";

    // 补偿   以防页面混乱 默认设置display none隐藏
    let bcArr = [
        huoHaoInput,
        btnDLBC,
        btnWZBC,
        btnPSBC,
        btnTXBC,
        btnJJBCJ,
        btnCPBCJ,
    ];
    for (let i = 0; i < bcArr.length; i++) {
        const element = bcArr[i];
        element.style.visibility = "hidden";
        element.addEventListener("click", function () {
            DiyAlertFn(
                `${element.innerText}补偿${input1.value}元或承担退${DengJiTime}`,
                element.innerText + "补偿",
                `${windowObj.width - 300}px`
            );
        });
    }
    div.addEventListener("mouseover", function () {
        for (let i = 0; i < bcArr.length; i++) {
            const element = bcArr[i];
            // element.style.display = "inline-block"
            element.style.visibility = "visible ";
            setTimeout(() => {
                // element.style.display = "none"
                element.style.visibility = "hidden";
            }, 10000);
        }
    });
    input1.addEventListener("change", function () {
        sumFn();
    });
    input1.addEventListener("mouseover", function () {
        let inputUlStyle = document.getElementById("inputUlStyle");
        inputUlStyle.style.visibility = "visible";
    });
    input2.addEventListener("change", function () {
        sumFn();
    });
    btnJJBCJ.addEventListener("click", function () {
        DiyAlertFn(
            `降价补差价${sum}元线上退${DengJiTime}`,
            "降价补差价",
            `${windowObj.width - 300}px`
        );
    });
    btnCPBCJ.addEventListener("click", function (e) {
        console.log(e);
        let orderInfos = JSON.parse(sessionStorage.getItem("orderInfo")).data;
        DiyAlertFn(
            `原订单号${orderInfos.tb_ord_id}货号${huoHaoInput.value}重拍补差价${sum}元线上退${DengJiTime}`,
            // `${orderInfos.tb_ord_id}重拍补差价${sum}元线上退${DengJiTime}`,
            "重拍补差价",
            `${windowObj.width - 300}px`
        );
    });
    function sumFn () {
        sum = parseFloat(input1.value - input2.value).toFixed(2);
        span.value = `${input1.value}-${input2.value}=${sum}`;
    }
    function createInputX () {
        let input = document.createElement("input");
        input.style.width = "50px";
        input.style.height = "30px";
        input.style.fontSize = "18px";
        input.style.margin = "2px 4px";
        input.style.borderRadius = "5px";
        return input;
    }
    function createBtn (btnValue = "按钮") {
        let btn = document.createElement("button");
        btn.style.padding = "7px 13px";
        btn.style.backgroundColor = "rgba(0,0,0,0)";
        btn.style.fontSize = "18px";
        btn.style.borderRadius = "5px";
        btn.style.margin = "0px 3px";
        btn.innerText = btnValue;
        return btn;
    }
    // 添加子节点
    let addChildArr = [
        huoHaoInput,
        btnDLBC,
        btnWZBC,
        btnPSBC,
        btnTXBC,
        input1,
        input2,
        span,
        btnJJBCJ,
        btnCPBCJ,
    ];
    for (let i = 0; i < addChildArr.length; i++) {
        const element = addChildArr[i];
        div.appendChild(element);
    }
    return div;
}
// diy弹窗
function DiyAlertFn (
    text = "默认无内容",
    title = "Diy弹窗",
    left = `${windowObj.width / 2}px`,
    top = `${windowObj.height / 2}px`
) {
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
    BODY.appendChild(divMain);
}
// 创建批量化的事件，默认的点击事件弹窗
function createBtnEventFn (element) {
    element.addEventListener("click", function () {
        // alert(`降价补差价${sum}元线上退${dengJiRen}`)
        DiyAlertFn(
            `降价补差价${sum}元线上退${dengJiRen}`,
            "降价补差价",
            `${windowObj.width - 300}px`
        );
    });
}
// 获取登录token
function getToken () {
    // 点击页面左边的 订单查询工具
    let tempClick = document.getElementsByClassName(
        "router-link-exact-active router-link-active"
    )[0];
    tempClick.addEventListener("click", function () {
        console.log('click');
        getTokenApi().then(res => {
            SFToken = res.data.token;
            alert(res.data.token);
        })
    });
}

function getTokenApi () {
    return $.ajax({
        type: "post",
        url: "https://m.sanfu.com/ms-sanfu-mgr-mall/system/login",
        data: JSON.stringify({
            userId: "ZHJ165",
            userPassword: "sf123321",
        }),
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
        dataType: "json",
        // authorization:"3b614401e6cpa95f2697ccf7f379a007"
        success: function (response) {
            //   console.log(response.responseText)
            // console.log(response);
            SFToken = response.data.token;
            localStorage.setItem("SFloginToken", response.data.token);
            console.log(response);
            return response;
        },
        error: function (error) {
            //   console.log(error)
            return error;
        },
    });
}

// 添加常用网站到某个位置     位置、网站对象(包含 url与name)
function createAddWebsiteDiv (webArr_obj) {
    let div = document.createElement("div");
    div.style.width = "100%";
    div.style.zIndex = 999;
    for (let i = 0; i < webArr_obj.length; i++) {
        // 设置默认与触发后的样式
        const fontColor = "rgb(191,203,217)";
        const fontColorAction = "rgb(64, 158, 255)";
        const bgColor = "rgba(0,0,0,0)";
        const bgColorAction = "lightblue";
        let a = document.createElement("a");
        a.style.fontSize = "16px";
        a.style.color = fontColor;
        a.style.padding = "3px 7px";
        a.style.textAlign = "center";
        const element = webArr_obj[i];
        a.innerText = element.name;
        div.appendChild(a);
        a.addEventListener("click", function () {
            // 获取订单号
            const ddhValue =
                document.getElementsByClassName("el-input__inner")[1].value;
            // window.open(element.url + "?ddhValue")
            window.open(`${element.url}?dingDanHao=${ddhValue}`);
        });
        a.addEventListener("mouseover", function () {
            a.style.color = fontColorAction;
            a.style.backgroundColor = bgColorAction;
        });
        a.addEventListener("mouseout", function () {
            a.style.color = fontColor;
            a.style.backgroundColor = bgColor;
        });
    }

    return div;
}

// 使用延迟等页面加载在添加元素
setTimeout(() => {
    getToken();

    let webArrObj = [
        {
            name: "登记红包",
            url: "https://work.bytenew.com/appMobile.html#/shareWorkTable/add/1687020_1240_1016304_32520604689828",
        },
        {
            name: "登记支付宝",
            url: "https://work.bytenew.com/appMobile.html#/shareWorkTable/add/1723104_13144_1145512_32520604689828",
        },
        {
            name: "登记发票",
            url: "https://work.bytenew.com/appMobile.html#/shareWorkTable/add/1935888_198400_1075452_32520604689828",
        },
        {
            name: "快递100停发查询",
            url: "https://www.kuaidi100.com/stop/stop.jsp",
        },
        {
            name: "千牛售后工作台",
            url: "https://myseller.taobao.com/home.htm/trade-platform/tp/sold",
        },
    ];
    let locationX = document.getElementsByClassName("sidebar-container")[0].getElementsByClassName('el-scrollbar__view')[0].firstElementChild;
    let webSiteModuleDiv = createAddWebsiteDiv(webArrObj);
    // webSiteModule.style.bottom = webSiteModule.offsetHeight + 20 + "px";
    // webSiteModule.style.position = "relative";
    locationX.appendChild(webSiteModuleDiv)


    document.getElementsByClassName('hamburger-container')[0].addEventListener('click', (e) => {
        console.log(e);
        setTimeout(() => {
            console.log('卧槽');
            console.log(createAddWebsiteDiv(webArrObj));
            document.getElementsByClassName('menu-wrapper')[0].appendChild(createAddWebsiteDiv(webArrObj))

        }, 500);
    })


}, 1000);

function addListBtnsFn (res) {
    // 添加列表按钮 用于放入快捷计算
    let data = res.data.data;
    console.log(data);
    // 计算模块的第一个input框
    let input1 = document.getElementsByClassName("computeCLass_input")[0];
    let input2 = document.getElementsByClassName("computeCLass_input")[1];
    let huoHaoInput = document.getElementsByClassName("huoHaoClass_input")[0];
    let ul = document.createElement("ul");
    ul.style.display = "inline-block";
    ul.style.position = "absolute";
    ul.style.top = "45px";
    ul.style.marginLeft = "-65px";
    ul.id = "inputUlStyle";
    let elementID = document.getElementById(ul.id);
    if (elementID != null || elementID != undefined) {
        // 删除节点 包括父节点
        elementID.remove();
    }
    for (let i = 0; i < data.netSales.length; i++) {
        const element = data.netSales[i];
        let li = document.createElement("li");
        // 将实付价格设为按钮文字
        let btn = createBtn(element.rEALPRICE);
        btn.style.borderRadius = '7px'
        btn.addEventListener("click", function () {
            ul.style.visibility = "hidden";
            huoHaoInput.value = element.gOODSID;
            input1.value = element.rEALPRICE;
        });
        li.appendChild(btn);
        ul.appendChild(li);
        // console.log(ul);
    }

    // input2.parentNode.insertBefore(null, input2)
    //  insertBefore父节点之前插入
    ul.style.visibility = "hidden";
    // 当获取ID元素为空的时候 添加ul
    input2.parentNode.insertBefore(ul, input2);
}

/*
function getInfosFn(
  queryStr = "ordId=221110-563827219310886",
  url = "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail?"
) {
  let xhr = new XMLHttpRequest()
  let returnX
  url = url + queryStr
  xhr.open("get", url, true)
  xhr.onreadystatechange = function () {
    if ((xhr.readyState = 4 && xhr.status == 200)) {
      let info = xhr.responseText
      returnX = xhr.responseText
      return JSON.parse(info)
    }
  }
  // 设置请求头   将授权字段发送服务器
  xhr.setRequestHeader("authorization", "3b614401e6cpa95f2697ccf7f379a007")
  xhr.send()
  return returnX
  //   console.log(xhr)
}
*/
// ---------------------------------------  修改后
// API------------------------------------------------API↓

function getInfosFn (ordId = "221110-563827219310886") {
    // return JQajax(ordId);
    return axiosGetInfoAPI(ordId);
}
// 跳转企业微信负责人
function toWXworkPersonInCharge (row) {
    let orderInfo = JSON.parse(sessionStorage.getItem("orderInfo")).data;
    //    门店负责人工号          netSales产品销售行
    let mdPersonWXworkNo = orderInfo.netSales[row].logisticsMsgDto[0].workNo;
    setTimeout(() => {
        return axiosToWXworkPersonAPI(mdPersonWXworkNo);
    }, 100);
}

//  jQuery写法
/*
function JQajax(ordId) {
  return $.ajax({
    async:false,
    type: "get",
    url: "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail",
    data: {
      ordId:ordId,
    },
    dataType: "dataType",
    beforeSend: function (request) {
      request.setRequestHeader(
        "authorization",
        SFToken
      );
    },
    // authorization:"3b614401e6cpa95f2697ccf7f379a007"
    success: function (response) {
      sessionStorage.setItem('infoData',response)
      console.log('success');
      console.log(response.responseText)
      return response.responseText;
    },
    error: function (error) {
      console.log('error')
      console.log(error)
      return error;
    },
  });
}
*/
function axiosGetInfoAPI (ordId = "221110-563827219310886") {
    console.log(ordId);
    const baseURL = "https://m.sanfu.com/ms-sanfu-mgr-mall/search/getOrderDetail";
    const orderInfoApi = axios({
        method: "get",
        url: baseURL,
        headers: { authorization: SFToken },
        params: {
            ordId,
        },
    })
        .then((res) => {
            // 函数体
            sessionStorage.setItem("orderInfo", JSON.stringify(res.data));
            if (res.data.code == 10001) {
                alert(res.data.msg);
                // getToken ()
                SFloginTokenAPI();
            }

            setTimeout(() => {
                addListBtnsFn(res);
            }, 250);
        })
        .catch((err) => {
            console.log("axios失败");

            console.error(err);
        });

    return orderInfoApi;
}

function axiosToWXworkPersonAPI (mdPersonWXworkNo) {
    let url = "https://m.sanfu.com/ms-sanfu-mgr-mall/search/skipQiweiChatWindow?";
    let toWXworkAxios = axios.create({
        // baseURL: 'https://m.sanfu.com/ms-sanfu-mgr-mall/search/skipQiweiChatWindow?',
        timeout: 500,
        headers: { authorization: SFToken },
        params: {
            operator: "ZHJ165",
            receiver: mdPersonWXworkNo,
        },
    });
    toWXworkAxios
        .get(url)
        .then((res) => {
            console.log(res);
            window.open(res.data.data);
        })
        .catch((err) => {
            console.error(err);
        });
    return toWXworkAxios;
}

function SFloginTokenAPI () {
    $.ajax({
        type: "post",
        url: "https://m.sanfu.com/ms-sanfu-mgr-mall/system/login",
        data: JSON.stringify({
            userId: "ZHJ165",
            userPassword: "sf123321",
        }),
        headers: {
            "content-type": "application/json;charset=UTF-8",
        },
        dataType: "json",
        // authorization:"3b614401e6cpa95f2697ccf7f379a007"
        success: function (response) {
            //   console.log(response.responseText)
            // console.log(response);
            SFToken = response.data.token;
            localStorage.setItem("SFloginToken", response.data.token);
            alert(response.data.token);
            return response;
        },
        error: function (error) {
            //   console.log(error)
            return error;
        },
    });
}

// let data_name = "data" + j
// //   设置色号为可点击事件，可跳转到登记红包页面
//     document
//       .getElementsByClassName("ordersty")[i]
//       .getElementsByClassName("el-table__row")[j]
//       .lastElementChild.addEventListener("click", function (e) {
//         alert("JS文件点击")
//         top.location.href = `
//           https://work.bytenew.com/appMobile.html#/shareWorkTable/add/1687020_1240_1016304_32520604689828?
//           dingDanHao=${infosObj[data_name].dingDanHao}&
//           dianPuMing=${infosObj[data_name].dianPuMing}&
//           seHao=${infosObj[data_name].seHao}&
//           menDian=${infosObj[data_name].menDian}
//           `
//         })
