// pages/pointsMall/index.js
const AUTH = require('../../utils/auth')
const API = require('../../utils/api')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let isLogined = AUTH.checkHasLogined()
    let _this = this;
    if(isLogined){
      _this.getAllCoupon()
    }
    

  },
  getAllCoupon(){
    let _this = this;
    let allCouponfunct = API.getAllCoupon();
    allCouponfunct.then(res=>{
      _this.setData({
        allCoupon:res.data.allCoupon
      })
    })
  },
  exchangeCoupon(e){
    console.log(e)
    let index = e.currentTarget.dataset.idx
    let userInfo = wx.getStorageSync("userInfo")
    let allPoint = userInfo.allPoint
    let coupon = this.data.allCoupon[index]
    let point = coupon.point
    let _this = this
    console.log("总积分===》", allPoint)
    console.log("当前优惠券所需积分",this.data.allCoupon[index])
    if(allPoint<point){
      wx.showToast({
        title: '积分不够哦',
        icon:'none'
      })
    }else{
      const fetchCouponsFunct = API.fetchCoupons({
        id: coupon.id,
        userId: wx.getStorageSync('userId')||5
      })
      fetchCouponsFunct.then(res=>{
        if(res.data.code == 1){
          let exchangeCouponFunct = API.addPoint({
            userId:wx.getStorageSync('userId')||5,
            addPoint:-point,
            stepFlag:2
          })
          exchangeCouponFunct.then(res2=>{
            if(res.data.code == 1)
            wx.showToast({
              title: '兑换成功',
            })
            console.log("兑换成功",res2)
          })
        }
        if(res.data.code == -1){
          wx.showToast({
            title: '每人只能领取一次，您已经领取过了哦！',
          })
        }
      })
      
    }
  }
})