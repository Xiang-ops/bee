const wxpay = require('../../utils/pay.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const API = require('../../utils/api')
const APP = getApp()
APP.configLoadOK = () => {

}
Page({
  data: {
    apiOk: false,
    goodsMap:{
      1:[{pic:'http://localhost:8089/menuPic/1618123741947.jpg'},{pic:'http://localhost:8089/menuPic/1618123741947.jpg'},{pic:'http://localhost:8089/menuPic/1618123741947.jpg'}]
    }
  },
  goComment:function(e){
    console.log(e)
    let index = e.target.dataset.id
    console.log("lalala==>", index);
    console.log("lalalalalalala====>",this.data.orderList)
    let menuName = this.data.orderList[index].menuName;
    let userName = this.data.orderList[index].clientName;
    let number = this.data.orderList[index].number;
    wx.navigateTo({
      url: '../comment/comment?menuName='+menuName+'&userName='+userName+'&orderNumber='+number,
    })
  },
  toPayTap: function(e) {
    // 防止连续点击--开始
    if (this.data.payButtonClicked) {
      wx.showToast({
        title: '休息一下~',
        icon: 'none'
      })
      return
    }
    this.data.payButtonClicked = true
    setTimeout(() => {
      this.data.payButtonClicked = false
    }, 3000)  // 可自行修改时间间隔（目前是3秒内只能点击一次支付按钮）
    // 防止连续点击--结束
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    let money = e.currentTarget.dataset.money;
    const needScore = e.currentTarget.dataset.score;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function(res) {
      if (res.code == 0) {
        // 增加提示框
        if (res.data.score < needScore) {
          wx.showToast({
            title: '您的积分不足，无法支付',
            icon: 'none'
          })
          return;
        }
        let _msg = '订单金额: ' + money +' 元'
        if (res.data.balance > 0) {
          _msg += ',可用余额为 ' + res.data.balance +' 元'
          if (money - res.data.balance > 0) {
            _msg += ',仍需微信支付 ' + (money - res.data.balance) + ' 元'
          }          
        }
        if (needScore > 0) {
          _msg += ',并扣除 ' + needScore + ' 积分'
        }
        money = money - res.data.balance
        wx.showModal({
          title: '请确认支付',
          content: _msg,
          confirmText: "确认支付",
          cancelText: "取消支付",
          success: function (res) {
            console.log(res);
            if (res.confirm) {
              that._toPayTap(orderId, money)
            } else {
              console.log('用户点击取消支付')
            }
          }
        });
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取用户资金信息',
          showCancel: false
        })
      }
    })
  },
  _toPayTap: function (orderId, money){
    const _this = this
    if (money <= 0) {
      // 直接使用余额支付
      WXAPI.orderPay(wx.getStorageSync('token'), orderId).then(function (res) {
        _this.onShow();
      })
    } else {
      wxpay.wxpay('order', money, orderId, "/pages/all-orders/index");
    }
  },
  onLoad: function(options) {
    
  },
  onShow: function() {
    let isLogined = AUTH.checkHasLogined()
    if (isLogined) {
      this.doneShow();
    } else {
      wx.showModal({
        content: '登陆后才能访问',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },
  doneShow() {
    wx.showLoading({
      title: '',
    })
    let getOrder = API.orderList({
      userId: wx.getStorageSync('userId')||5
    })
    getOrder.then((res) => {
      if (res.statusCode == 200) {
        let orderList = res.data
        orderList.forEach(ele => {
          if (ele.isCash == 1) {
            ele.statusStr = '待评价'
          }
          if (ele.isCash == 0) {
            ele.statusStr = '待取餐'
          }
          if (ele.isCash== 2) {
            ele.statusStr = '已完成'
          }
          // let getMenuList = API.MenuList({
          //   orderNumber:ele.number
          // })
          // getMenuList.then(res => {

          // })
        })
        wx.setStorageSync('orderList', orderList)
        console.log("订单列表======>",orderList)
        
        this.setData({
          orderList: orderList,
          // logisticsMap: res.data.logisticsMap,
          // goodsMap: res.data.goodsMap,
          // apiOk: true
        });
        
      } else {
        this.setData({
          orderList: null,
          // logisticsMap: {},
          // goodsMap: {},
          // apiOk: true
        });
      }
    })
    wx.hideLoading()
    
  },
  toIndexPage: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  // 删除订单
  deleteOrder: function(e){
    const that = this
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除该订单吗？',
      success: function (res) {
        if (res.confirm) {
          WXAPI.orderDelete(wx.getStorageSync('token'), id).then(function (res) {  
            if (res.code == 0) {
              that.onShow(); //重新获取订单列表
            }              
            
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  async callShop(e) {
    const shopId = e.currentTarget.dataset.shopid
    const res = await WXAPI.shopSubdetail(shopId)
    if (res.code != 0) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
      return
    }
    wx.makePhoneCall({
      phoneNumber: res.data.info.linkPhone,
    })
  },
})