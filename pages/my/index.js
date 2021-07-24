const CONFIG = require('../../config.js')
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const API = require('../../utils/api')
const APP = getApp()
APP.configLoadOK = () => {

}

Page({
  data: {
    couponStatistics: {
      canUse: 0
    },
    balance: 0.00,
    score: 0,
    userInfo:{},
  },
  onLoad() {
    const order_hx_uids = wx.getStorageSync('order_hx_uids')
    this.setData({
      myBg: wx.getStorageSync('myBg'),
      version: CONFIG.version,
      order_hx_uids
    })
  },
  onShow() {
    let isLogined = AUTH.checkHasLogined()
    let _this = this;
    if (isLogined) {
      const findPoint = API.findPointByUser({userId:wx.getStorageSync('userId')})
      findPoint.then(res=>{
        if(res.data.code==1){
          _this.setData({
            allPoint:res.data.allPoint
          })
          _this.getUserApiInfo()
        }
      })
      
      // this.getUserAmount()
      // this.couponStatistics()
      
    }
  },
  getUserProfile(){
    let _this = this;
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => {
        console.log(res);
        let userInfo = res.userInfo;
        // let encryptedData = res.encryptedData;
        // let iv = res.iv;
        wx.login({
          success: function (res) {
            console.log("res================>2",res)      
            if(res.code){
              const code = res.code
              wx.request({
              data: {
                code: code,
                // encryptedData: encryptedData,
                // iv: iv,
                username:userInfo.nickName,
                avatar:userInfo.avatarUrl
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
              },
              url: 'http://localhost:8089/user/login',
              method: 'POST',
              success: function (res) {
                //请求成功的处理
                if(res.data.code>0){
                  _this.getCouponNum()
                  wx.setStorageSync('userId', res.data.userInfo.id)
                  wx.setStorageSync('userName', res.data.userInfo.nickName)
                  wx.setStorageSync('userInfo', apiUserInfoMap)
                  let apiUserInfoMap = res.data.userInfo;
                  let allPoint = _this.data.allPoint
                  console.log("所有积分=====》",allPoint)
                  apiUserInfoMap.allPoint = allPoint
                  _this.setData({
                    apiUserInfoMap:apiUserInfoMap,
                    hasUserInfo: true
                  })
                  if(apiUserInfoMap.isMember>0){
                    let levelNameFunct = API.getLevelName({flagId:apiUserInfoMap.isMember})
                    levelNameFunct.then(res2=>{
                      if(res2.data.code == 1){
                        _this.setData({
                          levelName:res2.data.levelName
                        })
                        wx.setStorageSync('levelName', res2.data.levelName)
                      }
                    })
                  }
                  APP.globalData.isLogin = true;
                  const findPoint = API.findPointByUser({userId:wx.getStorageSync('userId')})
                  findPoint.then(res=>{
                    if(res.data.code==1){
                      _this.setData({
                        allPoint:res.data.allPoint
                      })
                      _this.getUserApiInfo()
                    }
                  })
                  console.log("是否登录===》",APP.globalData.isLogin)
                }
              }
    
            })
            }
          }
        })
      }
    })
  },
  getUserPhone(e){
    wx.authorize({
      scope: 'scope.phone',
    })
    console.log(e);
  },
  getUserApiInfo(){
    const _this = this;
    const userId = wx.getStorageSync('userId');
    _this.getCouponNum()
    let getInfoFunct = API.getInfo({userId:userId});
    getInfoFunct.then(res =>{
      if(res.data.code===1){
        let apiUserInfoMap = res.data.userApiInfos[0]
        let allPoint = _this.data.allPoint
        apiUserInfoMap.allPoint = allPoint
        _this.setData({
          apiUserInfoMap:res.data.userApiInfos[0]
        })
        if(apiUserInfoMap.isMember>0){
          let levelNameFunct = API.getLevelName({flagId:apiUserInfoMap.isMember})
          levelNameFunct.then(res2=>{
            if(res2.data.code == 1){
              _this.setData({
                levelName:res2.data.levelName
              })
              wx.setStorageSync('levelName', res2.data.levelName)
            }
          })
        }
        
        wx.setStorageSync('userInfo', apiUserInfoMap)
      }
      
    })
  },
  getCouponNum(){
    let _this = this
    const getMyCoupons = API.myCouponNum({
      userId: wx.getStorageSync('userId'),
      couponType:0
    })
    getMyCoupons.then(res=>{
      if(res.data.code == 1){
        let length = res.data.data
        console.log("优惠券数目===>",length)
        _this.setData({
          length:length
        })

      }
    })
  },
  // async getUserApiInfo() {
  //   const res = await WXAPI.userDetail(wx.getStorageSync('token'))
  //   const _data = {}
  //   _data.apiUserInfoMap = this.userInfo
  //   if (res.code == 0) {
      
  //     if (this.data.order_hx_uids && this.data.order_hx_uids.indexOf(res.data.base.id) != -1) {
  //       _data.canHX = true // 具有扫码核销的权限
  //     }
  //     const admin_uids = wx.getStorageSync('admin_uids')
  //     if (admin_uids && admin_uids.indexOf(res.data.base.id) != -1) {
  //       _data.isAdmin = true
  //     }
  //     this.setData(_data)
  //   }
  // },
  // async couponStatistics() {
  //   const res = await WXAPI.couponStatistics(wx.getStorageSync('token'))
  //   if (res.code == 0) {
  //     this.setData({
  //       couponStatistics: res.data
  //     })
  //   }
  // },
  // async getUserAmount() {
  //   const res = await WXAPI.userAmount(wx.getStorageSync('token'))
  //   if (res.code == 0) {
  //     this.setData({
  //       balance: res.data.balance,
  //       score: res.data.score
  //     })
  //   }
  // },
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
  scanOrderCode(){
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.navigateTo({
          url: '/pages/order-details/scan-result?hxNumber=' + res.result,
        })
      },
      fail(err) {
        console.error(err)
        wx.showToast({
          title: err.errMsg,
          icon: 'none'
        })
      }
    })
  },
  goCoupons() {
    wx.navigateTo({
      url: '/pages/coupons/index?tabIndex=1',
    })
  },
  goBalance() {
    wx.navigateTo({
      url: '/pages/asset/index',
    })
  },
  goScorelog() {
    wx.navigateTo({
      url: '/pages/myPoints/index',
    })
  },
  goadmin() {
    wx.navigateToMiniProgram({
      appId: 'wx5e5b0066c8d3f33d',
      path: 'pages/login/auto?token=' + wx.getStorageSync('token'),
    })
  }
})

// Page({
//   data: {
//     userInfo: {},
//     hasUserInfo: false,
//     canIUseGetUserProfile: false,
//   },
//   onLoad() {
//     if (wx.getUserProfile) {
//       this.setData({
//         canIUseGetUserProfile: true
//       })
//     }
    
//   },
//   getUserProfile(e) {
//     // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
//     // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
//    
//     })
//   },
// })
