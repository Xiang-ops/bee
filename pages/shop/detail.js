const WXAPI = require('apifm-wxapi')
const APP = getApp()
APP.configLoadOK = () => {

}

Page({
  data: {
    markers: [{"longitude": "113.028325","latitude": "28.066031","iconPath":"../../images/coupon.png","height": 30,
    "width": 30}],
  },
  onLoad: function (options) {
    let shopInfo = wx.getStorageSync('shopInfo');
    this.setData({shopInfo});
    console.log(this.data.shopInfo)
  },
  async shopSubdetail() {
    const res = await WXAPI.shopSubdetail(this.data.id)
    if (res.code != 0) {
      wx.showModal({
        title: '出错了',
        content: res.msg,
        showCancel: false
      })
      wx.navigateBack()
    } else {
      wx.setNavigationBarTitle({
        title: res.data.info.name,
      })
      const marker = {
        latitude: res.data.info.latitude,
        longitude: res.data.info.longitude,
        iconPath: wx.getStorageSync('mapPos'),
        height: 30,
        width: 30,
      }
      const markers = [marker]
      this.setData({
        shopSubdetailData: res.data,
        shopInfo: res.data.info,
        markers
      })
    }
  },
  // 
  phoneCall:function(){
    var phoneNumber = this.data.shopInfo.linkPhone
    wx.makePhoneCall({
      phoneNumber,
    })
  },
  // 
  guideNow: function(){
    var name = this.data.shopInfo.name
    var address = this.data.shopInfo.address
    var latitude = this.data.shopInfo.latitude
    var longitude = this.data.shopInfo.longitude
    wx.openLocation({
      name: name,
      address: address,
      latitude: latitude,
      longitude: longitude,
    })
  },
})