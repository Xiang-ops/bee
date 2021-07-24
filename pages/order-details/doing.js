const WXAPI = require('apifm-wxapi')
const wxbarcode = require('wxbarcode')
const AUTH = require('../../utils/auth')
const APP = getApp()
const API = require('../../utils/api')
APP.configLoadOK = () => {

}
Page({
  data: {
    apiOk: false,
    isLogined: true
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    let isLogined =  AUTH.checkHasLogined()
    this.setData({
      isLogined
    })
    if (isLogined) {
      this.orderList();
    }
  },
  toIndexPage: function() {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  orderList() {
    wx.showLoading({
      title: '',
    })
    let getList = API.orderList({
      userId:wx.getStorageSync('userId')||5
    })
    getList.then(res =>{
      wx.hideLoading()
      let array = res.data
      let orderList = [];
      array.forEach(ele =>{
        if(ele.isCash==0){
          ele.dateAdd = ele.date.slice(0,10)
          orderList.push(ele);
        }
      })
      console.log(orderList);
      this.setData({
        orderList
      })
      // if (res.data.code == 0) {
      //   this.setData({
      //     orderList: res.data.orderList,
      //     logisticsMap: res.data.logisticsMap,
      //     goodsMap: res.data.goodsMap,
      //     apiOk: true
      //   })
      //   wxbarcode.qrcode('qrcode_0', res.data.orderList[0].hxNumber, 400, 400);
      // } else {
      //   this.setData({
      //     orderList: null,
      //     logisticsMap: null,
      //     goodsMap: null,
      //     apiOk: true
      //   })
      // }
    })
   
  },
  bindchange(e) {
    const index = e.detail.current
    const hxNumber = this.data.orderList[index].hxNumber
    if (!hxNumber) {
      return
    }    
    wxbarcode.qrcode('qrcode_' + index, hxNumber, 400, 400);
  },
  processLogin(e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: '已取消',
        icon: 'none',
      })
      return;
    }
    AUTH.register(this);
  },
})