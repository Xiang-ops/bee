const WXAPI = require('apifm-wxapi')
const API = require('../../utils/api')
const AUTH = require('../../utils/auth')
const APP = getApp()
APP.configLoadOK = () => {
  
}

Page({
  data: {
    totleConsumed: 0
  },
  onLoad: function (options) {
    this.userLevelList()
    this.userAmount()
    this.getUserApiInfo()
    let levelName = wx.getStorageSync('levelName')
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      levelName:levelName,
      userInfo:userInfo
    })
    console.log("用户等级=====>",levelName)
    console.log("用户信息====>",userInfo)
  },
  onShow: function () {
    let isLogined =  AUTH.checkHasLogined()
    if (!isLogined) {
      wx.showModal({
        content: '登陆后才能访问',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
    }
  },
  userAmount() {
    const userAmountFunct = API.userAmount({userId:wx.getStorageSync('userId')||5})
    userAmountFunct.then(res=>{
      if (res.data.code == 1) {
        this.setData({
          totleConsumed: res.data.amount
        });
      }
    })    
  },
  async getUserApiInfo() {
    const res = await WXAPI.userDetail(wx.getStorageSync('token'))
    if (res.code == 0) {
      this.setData({
        apiUserInfoMap: res.data
      });
    }
  },
  userLevelList() {
    const levelListFunct = API.userLevelList()
    levelListFunct.then(res=>{
      if (res.data.code == 1) {
        this.setData({
          levelList: res.data.levelList
        });
      }
    })
    
  },
})