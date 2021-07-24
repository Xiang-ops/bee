const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const API = require('../../utils/api')

Page({
  data: {
    minDate: new Date().getTime(),
    maxDate: new Date().getTime(),
    formatter(day) {
      return day;
    },
  },
  onLoad: function(options) {
    this.scoreSignLogs()
  },
  onShow: function() {
    let isLogined = AUTH.checkHasLogined()
    if (!isLogined) {
      AUTH.openLoginDialog()
    }
  },
   scoreSignLogs() {
    let signLogsfunct = API.scoreSignLogs({
      userId: wx.getStorageSync('userId')||5
    })
    signLogsfunct.then(res => {
      if (res.data.code == 1) {
        this.setData({
          formatter(day) {  
            const _log = res.data.signDates.find(ele => {
              const year = day.date.getYear() + 1900
              let month = day.date.getMonth() + 1
              month = month + ''
              if (month.length == 1) {
                month = '0' + month
              }
              let date = day.date.getDate() + ''
              if (date.length == 1) {
                date = '0' + date
              }
              return ele.indexOf(`${year}-${month}-${date}`) == 0
            })
            if (_log) {
              day.bottomInfo = '已签到'
            }
            return day;
          }
        })
      }
    })
    
  },
  sign() {
    const addScore = API.scoreSign({userId:wx.getStorageSync('userId')||5})
    addScore.then(res=>{
      if (res.data.code == 100) {
        const addPoint = API.addPoint(
          {
            addPoint:5,
            userId:wx.getStorageSync('userId')||5,
            stepFlag:0
          })
          addPoint.then(res1=>{
            wx.showToast({
              title: '签到成功',
              icon: 'success'
            })     
          })        
        this.scoreSignLogs()
        return
      }
      if (res.data.code == 1) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })





    
    
    
    
    //  else {
    //   wx.showToast({
    //     title: '签到成功',
    //     icon: 'success'
    //   })
    //   this.scoreSignLogs()
    // }
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