const WXAPI = require('apifm-wxapi')

// const Dialog = require('@vant/weapp/dialog/dialog')
import Dialog from '@vant/weapp/dialog/dialog'

async function checkSession(){
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success() {
        return resolve(true)
      },
      fail() {
        return resolve(false)
      }
    })
  })
}

function openLoginDialog() {
  wx.showModal({
    cancelColor: 'cancelColor',
    title: '提示',
    content: '请先登录',
    success (res) {
      if (res.confirm) {
        wx.switchTab({
          url: '/pages/my/index',
        })
      } else if (res.cancel) {
        wx.switchTab({
          url: '/pages/my/index',
        })
      }
    }
  })
  // Dialog.confirm({
  //   selector: '#van-dialog-auth-login',
  //   message: '需要登陆后才能继续操作',
  //   confirmButtonText: '登陆',
  //   cancelButtonText: '取消',
  //   confirmButtonOpenType: 'getUserInfo',
  //   lang: 'zh_CN'
  // }).then(() => {
  //   // Dialog.close()
  // }).catch(() => {
  //   // Dialog.close()
  // })
}

// 检测登录状态，返回 true / false
function checkHasLogined() {
  const APP = getApp();
  // const token = wx.getStorageSync('token')
//   console.log("token=========>",token)
//   if (!token) {
//     console.log(1);
//     return false
//   }
//   const loggined = await checkSession()
//   if (!loggined) {
//     console.log(2);
//     wx.removeStorageSync('token')
//     return false
//   }
//   const checkTokenRes = await WXAPI.checkToken(token)
//   if (checkTokenRes.code != 0) {
//     console.log(3);
//     wx.removeStorageSync('token')
//     return false
//   }
//   return true
console.log(APP.globalData)
return APP.globalData.isLogin;
}

async function wxaCode(){
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        console.log("res==============>",res);
        return resolve(res.code)
      },
      fail() {
        wx.showToast({
          title: '获取code失败',
          icon: 'none'
        })
        return resolve('获取code失败')
      }
    })
  })
}

function getUserInfo() {
  wx.navigateTo({
    url: 'pages/my/index',
  })
  return true
  // return new Promise((resolve, reject) => {
  //   wx.getUserProfile({
  //     desc:'用于完善会员资料',
  //     success: res => {
  //       return resolve(res)
  //     },
  //     fail: err => {
  //       console.error(err)
  //       return resolve()
  //     }
  //   })
  // })


}

async function login(page){
  const _this = this

        
        // wx.authorize({
        //   scope: 'scope.userInfo',
        //   success() {
        //     wx.getSetting({
        //       success(res) {
        //         if (res.authSetting['scope.userInfo']) {
        //           // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        //           wx.getUserProfile({
          // desc:'用于完善会员资料',
        //             success: function (res) {
        //               console.log({ encryptedData: res.encryptedData, iv: res.iv})     
        //             }
        //           })
        //         }
        //       }
        //     })
        //   }
        // })
    

      // WXAPI.login_wx(res.code).then(function (res) {        
      //   if (res.code == 10000) {
      //     // 去注册
      //     //_this.register(page)
      //     return;
      //   }
      //   if (res.code != 0) {
      //     // 登录错误
      //     wx.showModal({
      //       title: '无法登录',
      //       content: res.msg,
      //       showCancel: false
      //     })
      //     return;
      //   }
      //   wx.setStorageSync('token', res.data.token)
      //   wx.setStorageSync('uid', res.data.uid)
      //   if ( page ) {
      //     page.onShow()
      //   }
      // })
    
}

async function register(page) {
  let _this = this;
  wx.login({
    success: function (res) {
      let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
      console.log("res==================>3",res);
      wx.getUserProfile({
        desc:'用于完善会员资料',
        success: function (res) {
          let iv = res.iv;
          let encryptedData = res.encryptedData;
          let referrer = '' // 推荐人
          let referrer_storge = wx.getStorageSync('referrer');
          if (referrer_storge) {
            referrer = referrer_storge;
          }
          // 下面开始调用注册接口
          WXAPI.register_complex({
            code: code,
            encryptedData: encryptedData,
            iv: iv,
            referrer: referrer
          }).then(function (res) {
            _this.login(page);
          })
        }
      })
    }
  })
}

function loginOut(){
  wx.removeStorageSync('token')
  wx.removeStorageSync('uid')
}

async function checkAndAuthorize (scope) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (!res.authSetting[scope]) {
          wx.authorize({
            scope: scope,
            success() {
              resolve() // 无返回参数
            },
            fail(e){
              console.error(e)
              // if (e.errMsg.indexof('auth deny') != -1) {
              //   wx.showToast({
              //     title: e.errMsg,
              //     icon: 'none'
              //   })
              // }
              wx.showModal({
                title: '无权操作',
                content: '需要获得您的授权',
                showCancel: false,
                confirmText: '立即授权',
                confirmColor: '#e64340',
                success(res) {
                  wx.openSetting();
                },
                fail(e){
                  console.error(e)
                  reject(e)
                },
              })
            }
          })
        } else {
          resolve() // 无返回参数
        }
      },
      fail(e){
        console.error(e)
        reject(e)
      }
    })
  })  
}


module.exports = {
  checkHasLogined: checkHasLogined,
  wxaCode: wxaCode,
  getUserInfo: getUserInfo,
  login: login,
  register: register,
  loginOut: loginOut,
  checkAndAuthorize: checkAndAuthorize,
  openLoginDialog: openLoginDialog
}