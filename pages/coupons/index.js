const APP = getApp()
const AUTH = require('../../utils/auth')
const WXAPI = require('apifm-wxapi')
const API = require('../../utils/api')

// fixed首次打开不显示标题的bug
APP.configLoadOK = () => {
  
}
Page({
  data: {
    tabIndex: 0
  },
  onLoad: function (options) {
    // if (options.tabIndex) {
    //   this.setData({
    //     tabIndex: options.tabIndex*1
    //   })
    // }
    // this.zsswss()
  },
  tabChange(event) {
    this.setData({
      tabIndex: event.detail.name
    })
    this.fetchData()
  },
  fetchData() {
    if (this.data.tabIndex == 0) {
      this.coupons()
    } else {
      this.mycoupons()
    }
  },
  onShow: function () {
    this.fetchData()
  },
  coupons() {
    let _this = this
    wx.showLoading({
      title: '',
    })
    const freeCouponfunct = API.getFreeCoupon()
    freeCouponfunct.then(res=>{
      wx.hideLoading()
      console.log("优惠券=====>",res)
      if(res.data.code==1){
        _this.setData({
          coupons:res.data.couponFree
        })
      }
    })
  },
  async fetchCounpon(e) {
    const idx = e.currentTarget.dataset.idx
    const coupon = this.data.coupons[idx]
    const fetchCouponsFunct = API.fetchCoupons({
      id: coupon.id,
      userId: wx.getStorageSync('userId')||5
    })
    fetchCouponsFunct.then(res=>{
      if (res.code == 20001 || res.code == 20002) {
        wx.showToast({
          title: '来晚了',
          icon: 'none'
        })
        return;
      }
      if (res.data.code == -1) {
        wx.showToast({
          title: '你领过了，别贪心哦',
          icon: 'none'
        })
        return;
      }
      if (res.code == 30001) {
        wx.showToast({
          title: '您的积分不足',
          icon: 'none'
        })
        return;
      }
      if (res.code == 20004) {
        wx.showToast({
          title: '已过期',
          icon: 'none'
        })
        return;
      }
      if (res.code == 0) {
        wx.showToast({
          title: '领取成功',
          icon: 'success'
        })
        setTimeout(() => {
          this.coupons()
        }, 1000);
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    })
   
  },
  mycoupons() {
    wx.showLoading({
      title: '',
    })
    let couponType = -1
    if(this.data.tabIndex == 1){
      couponType = 0
    }
    const getMyCoupons = API.myCoupons({
      userId: wx.getStorageSync('userId')||5,
      couponType:couponType
    })
    getMyCoupons.then(res=>{
      wx.hideLoading()
      if (res.data.code == 1) {
        this.setData({
          mycoupons: res.data.userCoupon
        })
      } else {
        this.setData({
          mycoupons: null
        })
      }
    })
    
  },
})