// pages/myPoints/index.js
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let isLogined =  AUTH.checkHasLogined()
    let _this = this
    if (isLogined) {
      this.getMyPointData()
      let userInfo = wx.getStorageSync('userInfo')
      let allPoint = userInfo.allPoint
      _this.setData({
        allPoint:allPoint
      })
    }
  },
  getMyPointData(){
    let pointData = API.getPoint({
      userId:wx.getStorageSync('userId')||5
    })
    pointData.then(res=>{
      console.log(res)
      let map = res.data.pointsDetail
      for(let i in map){
        let value = map[i];
        if(value instanceof Array){
          value.forEach((item,index)=>{
            if(item.stepFlag == 0){
              item.stepDetail = "签到送积分"
            }
            if(item.stepFlag == 1){
              item.stepDetail = "消费送积分"
            }
            if(item.stepFlag == 2){
              item.stepDetail = "积分兑换优惠券"
            }
          })
        }
      }
      this.setData({
        pointData:map
      })
      console.log("test", this.data.pointData)
    })
  },
  goPointShop(){
    wx.navigateTo({
      url: '/pages/pointsMall/index',
    })
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})