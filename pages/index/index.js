const APP = getApp()
const AUTH = require('../../utils/auth')
const WXAPI = require('apifm-wxapi')
const API = require('../../utils/api')

// fixed首次打开不显示标题的bug
APP.configLoadOK = () => {
  wx.setNavigationBarTitle({
    title: wx.getStorageSync('mallName')
  })
}

Page({
  data: {
    showCartPop: false, // 是否显示购物车列表
    showGoodsDetailPOP: false, // 是否显示商品详情
    shopIsOpened: false, // 是否营业
    shopList:[],
    showPingtuanPop: false,
    share_goods_id: undefined,
    share_pingtuan_open_id: undefined,
    lijipingtuanbuy: false,
    pingtuan_open_id: undefined,
    active:0,
    shippingCarInfo:[],
    allNumber:0,
    price:0,
    rateValue:3,
    comment_detail:[],
    curGoodsCondition:'',
    arraySize:[]

  },  
  changeTab(e){
    console.log(e.detail.index);
    if(e.detail.index==1){
      this.getCommentList()
    }
  },
  getCommentList(){
    const getCommentList = API.getCommentList();
    const _this = this;
    getCommentList.then((res) => {
      let commentList = res.data;
      if(commentList.length){
        commentList.forEach(ele => {
          ele.picture = "http://localhost:8089/"+ele.picture;
          ele.grade = parseInt(ele.grade);
        })
      }
      _this.setData({
        comment_detail:commentList
      })
      console.log("评论细节",_this.data.comment_detail);
    })
  },
  bindGetUserInfo(e){
    console.log(e.detail.userInfo)
  },
  onLoad: function (e) {
    wx.getUserProfile({
      desc:'用于完善会员资料',
      success: function (res) {
        console.log("lalala===>", res.userInfo)
      }
    })
    // wx.authorize({
    //   scope: 'scope.userInfo',
    //   success() {
    //     wx.getSetting({
    //       success(res) {
    //         if (res.authSetting['scope.userInfo']) {
    //           // 已经授权，可以直接调用 getUserInfo 获取头像昵称
             
    //         }
    //       }
    //     })
    //   }
    // })
    // 测试拼团入口
    // e = {
    //   share_goods_id: 521055,
    //   share_pingtuan_open_id: 11267
    // }

    // 测试扫码点餐
    // shopId=36,id=111,key=Y6RoIT 进行 url编码，3个值分别为 门店id，餐桌id，餐桌密钥
    // e = {
    //   scene: 'shopId%3d36%2cid%3d111%2ckey%3dY6RoIT' 
    // }

    
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene) // 处理扫码进商品详情页面的逻辑
      if (scene && scene.split(',').length == 3) {
        // 扫码点餐
        const scanDining = {}
        scene.split(',').forEach(ele => {
          scanDining[ele.split('=')[0]] = ele.split('=')[1]
        })
        wx.setStorageSync('scanDining', scanDining)
        this.setData({
          scanDining: scanDining
        })
        this.cyTableToken(scanDining.id, scanDining.key)
      } else {
        wx.removeStorageSync('scanDining')
      }
    }
    if (e.share_goods_id) {
      this.data.share_goods_id = e.share_goods_id
      this._showGoodsDetailPOP(e.share_goods_id)
    }
    if (e.share_pingtuan_open_id) {
      this.data.share_pingtuan_open_id = e.share_pingtuan_open_id
    } else {
      // this._showCouponPop()
    }
    // 设置标题
    const mallName = wx.getStorageSync('mallName')
    if (mallName) {
      wx.setNavigationBarTitle({
        title: mallName
      })
    }
    // 读取默认配送方式
    let peisongType = wx.getStorageSync('peisongType')
    if (!peisongType) {
      peisongType = 'zq'
      wx.setStorageSync('peisongType', peisongType)
    }
    this.setData({
      peisongType
    })
    // 读取最近的门店数据
    this.getshopInfo()
    this.categories()    
    this.noticeLastOne()
    this.banners()
  },
  onChangeRate(e){
    console.log(e);
  },
  // onShow: function(){
  //   this.shippingCarInfo()
  // },
  // async cyTableToken(tableId, key) {
  //   const res = await WXAPI.cyTableToken(tableId, key)
  //   if (res.code != 0) {
  //     wx.showModal({
  //       title: '桌码异常',
  //       content: res.msg,
  //       showCancel: false
  //     })
  //     return
  //   }
  //   wx.hideTabBar()
  //   wx.setStorageSync('uid', res.data.uid)
  //   wx.setStorageSync('token', res.data.token)
  // },
  getshopInfo(){
    wx.getLocation({
      type: 'wgs84', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: (res) => {
        console.log("地理位置",res)
        this.data.latitude = res.latitude
        // 纬度，范围为 -90~90，负数表示南纬
        this.data.longitude = res.longitude
        // 经度，范围为 -180~180，负数表示西经
        this.fetchShops(res.latitude, res.longitude, '')
      },      
      fail(e){
        AUTH.checkAndAuthorize('scope.userLocation')
      }
    })
  },
  fetchShops(latitude, longitude, kw){
    // 113.028325,28.066031（店铺位置，丽发新城）
    console.log("调用地图坐标函数")
    let getShopDetail = API.getShopDetail({
      latitude: latitude,
      longitude: longitude,
    });
    getShopDetail.then((res)=>{
      if(res.data.code==1){
        let distance = res.data.distance.toFixed(1)
        let shopInfo = res.data.shopDetail;
        this.setData({
          distance: distance,
          shopInfo: shopInfo,
          shopIsOpened: this.checkIsOpened(shopInfo.timeStart,shopInfo.timeEnd)
        })
        console.log("商城信息======>",shopInfo)
        wx.setStorageSync('distance', distance)
        wx.setStorageSync('shopInfo', shopInfo)
        
      }
    })

    // let getLocation = API.getLocation({
    //   latitude: latitude,
    //   longitude: longitude,
    // })
    // getLocation.then((res) => {
    //   if (res.data.code == 1) {
       
    //     let name = "香飘飘奶茶"
    //     let shopInfo = {
    //       distance:distance,
    //       name:name,
    //       openingHours:"8:30-16:30"
    //     }
    //     console.log("lalala",shopInfo.name);
        
        
    //   } 
    // })
    
  },
  // async _showCouponPop() {
  //   // 检测是否需要弹出优惠券的福袋
  //   const res = await WXAPI.coupons({
  //     token: wx.getStorageSync('token')
  //   })
  //   if (res.code == 0) {
  //     this.data.showCouponPop = true
  //   } else {
  //     this.data.showCouponPop = false
  //   }
  //   this.setData({
  //     showCouponPop: this.data.showCouponPop
  //   })
  // },
  // changePeisongType(e) {
  //   const peisongType = e.currentTarget.dataset.type
  //   this.setData({
  //     peisongType
  //   })
  //   wx.setStorage({
  //     data: peisongType,
  //     key: 'peisongType',
  //   })
  // },
  // 获取分类
  async categories() {
    const goodsCategory = API.goodsCategory()
    goodsCategory.then((res)=>{
      if (res.statusCode == 200) {
        wx.showToast({
          title: "请求成功",
          icon: 'success'
        })
      }    
      this.setData({
        categories: res.data,
        categorySelected: res.data[0]
      })
      this.getGoodsList()
    })
  },
  async getGoodsList() {
    wx.showLoading({
      title: '正在加载中',
    })
    console.log("选中的商品的id",this.data.categorySelected.id);
    const goods = API.goods({
      mid: this.data.categorySelected.id,
      page: 1,
      pageSize: 10000
    })
    goods.then((res) => {
      wx.hideLoading()
      res.data.forEach(ele => {
        ele.number = 0
        //获取商品列表时初始数量为0
      })
      this.setData({
        goods: res.data
      })
      this.processBadge()
    })
    
  },
  categoryClick(e) {
    const index = e.currentTarget.dataset.idx
    const categorySelected = this.data.categories[index]
    this.setData({
      categorySelected,
      scrolltop: 0
    })
    //获取所有订单
    this.getGoodsList()
  },
  async shippingCarInfo() {
    // const res = await WXAPI.shippingCarInfo(wx.getStorageSync('token'))
    // if (res.code == 700) {
    //   this.setData({
    //     shippingCarInfo: null,
    //     showCartPop: false
    //   })
    // } else if (res.code == 0) {
    //   this.setData({
    //     shippingCarInfo: res.data
    //   })
    // } else {
    //   this.setData({
    //     shippingCarInfo: null,
    //     showCartPop: false
    //   })
    // }
    // this.processBadge()
  },
  showCartPop() {
    if (this.data.scanDining) {
      // 扫码点餐，前往购物车页面
      wx.navigateTo({
        url: '/pages/cart/index',
      })
    } else {
      this.setData({
        showCartPop: !this.data.showCartPop
      })
    }
  },
  hideCartPop() {
    this.setData({
      showCartPop: false
    })
  },
  async addCart1(e) {
    console.log(e);
    let arr = this.data.shippingCarInfo;
    let allNumber = this.data.allNumber;
    let price;
    const index = e.currentTarget.dataset.idx
    let item = this.data.goods[index]
    item.number += 1
    allNumber +=1;
    console.log("当前选中的商品=======>", item)
    price = this.data.price+parseInt(item.price) 
    arr.push(item);
    this.setData({
      shippingCarInfo:arr,
      allNumber:allNumber,
      price:price
    })
    console.log(this.data.shippingCarInfo);
    // wx.showLoading({
    //   title: '',
    // })
    // const res = await WXAPI.shippingCarInfoAddItem(token, item.id, item.minBuyNumber, [])

    wx.hideLoading()
    // if (res.code == 2000) {
    //   AUTH.openLoginDialog()
    //   return
    // }
    // if (res.code != 0) {
    //   wx.showToast({
    //     title: res.msg,
    //     icon: 'none'
    //   })
    //   return
    // }
    // this.shippingCarInfo()
  },
  // async skuClick(e) {
  //   const index1 = e.currentTarget.dataset.idx1
  //   const index2 = e.currentTarget.dataset.idx2
  //   const curGoodsMap = this.data.curGoodsMap
  //   curGoodsMap.properties[index1].childsCurGoods.forEach(ele => {
  //     ele.selected = false
  //   })
  //   curGoodsMap.properties[index1].childsCurGoods[index2].selected = true
  //   this.setData({
  //     curGoodsMap
  //   })
  //   this.calculateGoodsPrice()
  // },
  // async calculateGoodsPrice() {
  //   const curGoodsMap = this.data.curGoodsMap
  //   // 计算最终的商品价格
  //   let price = curGoodsMap.basicInfo.minPrice
  //   let originalPrice = curGoodsMap.basicInfo.originalPrice
  //   let totalScoreToPay = curGoodsMap.basicInfo.minScore
  //   let buyNumMax = curGoodsMap.basicInfo.stores
  //   let buyNumber = curGoodsMap.basicInfo.minBuyNumber
  //   if (this.data.shopType == 'toPingtuan') {
  //     price = curGoodsMap.basicInfo.pingtuanPrice
  //   }
  //   // 计算 sku 价格
  //   const canSubmit = this.skuCanSubmit()
  //   if (canSubmit) {
  //     let propertyChildIds = "";
  //     if (curGoodsMap.properties) {
  //       curGoodsMap.properties.forEach(big => {
  //         const small = big.childsCurGoods.find(ele => {
  //           return ele.selected
  //         })
  //         propertyChildIds = propertyChildIds + big.id + ":" + small.id + ","
  //       })
  //     }
  //     const res = await WXAPI.goodsPrice(curGoodsMap.basicInfo.id, propertyChildIds)
  //     if (res.code == 0) {
  //       price = res.data.price
  //       if (this.data.shopType == 'toPingtuan') {
  //         price = res.data.pingtuanPrice
  //       }
  //       originalPrice = res.data.originalPrice
  //       totalScoreToPay = res.data.score
  //       buyNumMax = res.data.stores
  //     }
  //   }
  //   // 计算配件价格
  //   if (this.data.goodsAddition) {
  //     this.data.goodsAddition.forEach(big => {
  //       big.items.forEach(small => {
  //         if (small.active) {
  //           price = (price*100 + small.price*100) / 100
  //         }
  //       })
  //     })
  //   }
  //   curGoodsMap.price = price
  //   this.setData({
  //     curGoodsMap
  //   });
  // },
  skuClick2(e) {
    const propertyindex = e.currentTarget.dataset.idx1
    const arraySize = this.data.arraySize
    arraySize[0] = e.currentTarget.dataset.name
    this.setData({
      c_active:propertyindex,
      arraySize:arraySize
    })
    let curGoodsDetail = this.data.curGoodsDetail
    curGoodsDetail.menuSize = arraySize.toString()
    console.log(arraySize.toString())
    this.setData({
      curGoodsDetail:curGoodsDetail
    })
    console.log(curGoodsDetail);
  },
  skuClick3(e){
    const propertyindex = e.currentTarget.dataset.idx1
    const arraySize = this.data.arraySize
    arraySize[1] = e.currentTarget.dataset.name
    this.setData({
      t_active:propertyindex,
      arraySize:arraySize
    })
    let curGoodsDetail = this.data.curGoodsDetail
    curGoodsDetail.menuSize = arraySize.toString()
    console.log(arraySize.toString())
    this.setData({
      curGoodsDetail:curGoodsDetail
    })
    console.log(curGoodsDetail); 
  },
  skuClick4(e){
    const propertyindex = e.currentTarget.dataset.idx1
    const arraySize = this.data.arraySize
    arraySize[2] = e.currentTarget.dataset.name
    this.setData({
      s_active:propertyindex,
      arraySize:arraySize
    })
    let curGoodsDetail = this.data.curGoodsDetail
    curGoodsDetail.menuSize = arraySize.toString()
    console.log(arraySize.toString())
    this.setData({
      curGoodsDetail:curGoodsDetail
    })
    console.log(curGoodsDetail);
  },
  addCart2(){
    const curGoodsDetail = this.data.curGoodsDetail
    const arr = this.data.shippingCarInfo;
    const length = curGoodsDetail.number;
    let price = this.data.price;
    let allNumber = this.data.allNumber
    if(length == 0){
      wx.showToast({
        title: '请选择数量',
        icon: 'none'
      })
      return;
    }
    console.log("当前选中的商品",curGoodsDetail);
    if(curGoodsDetail.menuSize==''){
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    }else{
      // for(let i=0;i<length;i++){
      //   arr.push(curGoodsDetail)
      //   price +=parseInt(curGoodsDetail.price);
        
      // }
      price = price+length*(parseInt(curGoodsDetail.price))
      arr.push(curGoodsDetail)
      allNumber+=length
      console.log("购物车详情", arr,price,allNumber);
      this.setData({
        shippingCarInfo:arr,
        allNumber:allNumber,
        price:price,
        showGoodsDetailPOP:false
      })
    }
  },
  goodsStepChange(e) {
    const curGoodsDetail = this.data.curGoodsDetail
    console.log(e);
    curGoodsDetail.number = e.detail
    this.setData({
      curGoodsDetail
    })
  },
  clearCart() {
    // wx.showLoading({
    //   title: '',
    // })
    // this.data.good
    let goods = this.data.goods;
    goods.forEach(ele=>{
      ele.number=0
    })
    console.log("this.data.goods=====>",goods)
    this.setData({
      shippingCarInfo:[],
      showCartPop:false,
      allNumber:0,
      price:0
    })
    // const res = await WXAPI.shippingCarInfoRemoveAll(wx.getStorageSync('token'))
    wx.hideLoading()
    // if (res.code != 0) {
    //   wx.showToast({
    //     title: res.msg,
    //     icon: 'none'
    //   })
    //   return
    // }
    this.shippingCarInfo()
  },
  async showGoodsDetailPOP(e) {
    const index = e.currentTarget.dataset.idx
    const goodsId = this.data.goods[index].id
    let curGoodsDetail = this.data.goods[index]
    this.setData({
      showGoodsDetailPOP:true,
      curGoodsDetail:curGoodsDetail
    })
    // this._showGoodsDetailPOP(goodsId)
    this.goodsAddition(goodsId)
  },
  cartStepChange(e){
    let id = e.currentTarget.dataset.idx;
    let _goods= this.data.shippingCarInfo;
    let _number = _goods[id].number;
    console.log("number=====>",_goods)
    let _allPrice = this.data.price;
    let _allNumber = this.data.allNumber;
    if(e.detail>_number){
      _allPrice+=(e.detail-_number)*_goods[id].price
      _allNumber+=(e.detail-_number)
    }else{
      _allPrice-=(_number-e.detail)*_goods[id].price
      _allNumber-=(_number-e.detail);
    }
    _goods[id].number = e.detail;
    console.log("总价格",_allPrice)
    this.setData({
      shippingCarInfo:_goods,
      price:_allPrice,
      allNumber:_allNumber
    })
    console.log(e.detail)
  },
  // async _showGoodsDetailPOP(goodsId) {
  //   const token = wx.getStorageSync('token')
  //   const res = await WXAPI.goodsDetail(goodsId)
  //   if (res.code != 0) {
  //     wx.showToast({
  //       title: res.msg,
  //       icon: 'none'
  //     })
  //     return
  //   }
  //   wx.hideTabBar()
  //   res.data.price = res.data.basicInfo.minPrice
  //   res.data.number = res.data.basicInfo.minBuyNumber
  //   const _data = {
  //     curGoodsMap: res.data,
  //     pingtuan_open_id: null,
  //     lijipingtuanbuy: false
  //   }
  //   if (res.data.basicInfo.pingtuan) {
  //     _data.showPingtuanPop = true
  //     _data.showGoodsDetailPOP = false
  //     // 获取拼团设置
  //     const resPintuanSet = await WXAPI.pingtuanSet(goodsId)
  //     if (resPintuanSet.code != 0) {
  //       _data.showPingtuanPop = false
  //       _data.showGoodsDetailPOP = true
  //       wx.showToast({
  //         title: "拼团功能未开启",
  //         icon: 'none'
  //       })
  //       return
  //     } else {
  //       _data.pintuanSet = resPintuanSet.data
  //       // 是否是别人分享的团进来的
  //       if (this.data.share_goods_id && this.data.share_goods_id == goodsId && this.data.share_pingtuan_open_id) {
  //         // 分享进来的
  //         _data.pingtuan_open_id = this.data.share_pingtuan_open_id
  //       } else {
  //         // 不是通过分享进来的
  //         const resPintuanOpen = await WXAPI.pingtuanOpen(token, goodsId)
  //         if (resPintuanOpen.code == 2000) {
  //           AUTH.openLoginDialog()
  //           return
  //         }
  //         if (resPintuanOpen.code != 0) {
  //           wx.showToast({
  //             title: resPintuanOpen.msg,
  //             icon: 'none'
  //           })
  //           return
  //         }
  //         _data.pingtuan_open_id = resPintuanOpen.data.id
  //       }
  //       // 读取拼团记录
  //       const helpUsers = []
  //       for (let i = 0; i < _data.pintuanSet.numberOrder; i++) {
  //         helpUsers[i] = '/images/who.png'
  //       }
  //       _data.helpNumers = 0
  //       const resPingtuanJoinUsers = await WXAPI.pingtuanJoinUsers(_data.pingtuan_open_id)
  //       if (resPingtuanJoinUsers.code == 700 && this.data.share_pingtuan_open_id) {
  //         this.data.share_pingtuan_open_id = null
  //         this._showGoodsDetailPOP(goodsId)
  //         return
  //       }
  //       if (resPingtuanJoinUsers.code == 0) {
  //         _data.helpNumers = resPingtuanJoinUsers.data.length
  //         resPingtuanJoinUsers.data.forEach((ele, index) => {
  //           if (_data.pintuanSet.numberOrder > index) {
  //             helpUsers.splice(index, 1, ele.apiExtUserHelp.avatarUrl)
  //           }
  //         })
  //       }
  //       _data.helpUsers = helpUsers
  //     }
  //   } else {
  //     _data.showPingtuanPop = false
  //     _data.showGoodsDetailPOP = true
  //   }
  //   this.setData(_data)
  // },
  hideGoodsDetailPOP() {
    this.setData({
      showGoodsDetailPOP: false,
      showPingtuanPop: false
    })
    if (!this.data.scanDining) {
      wx.showTabBar()
    }
  },
  goPay() {
    console.log("购物车列表=========>", this.data.shippingCarInfo)
    wx.setStorageSync('shoppingCarList', this.data.shippingCarInfo)
    wx.setStorageSync('allPrice', this.data.price)
    wx.setStorageSync('allNumber', this.data.allNumber)
    if (this.data.scanDining) {
      // 扫码点餐，前往购物车
      wx.navigateTo({
        url: '/pages/cart/index',
      })
    } else {
      wx.navigateTo({
        url: '/pages/pay/index',
      })
    }
  },
  // onShareAppMessage: function() {
  //   let uid = wx.getStorageSync('uid')
  //   if (!uid) {
  //     uid = ''
  //   }
  //   let path = '/pages/index/index?inviter_id=' + uid
  //   if (this.data.pingtuan_open_id) {
  //     path = path + '&share_goods_id=' +  this.data.curGoodsMap.basicInfo.id + '&share_pingtuan_open_id=' +  this.data.pingtuan_open_id
  //   }
  //   return {
  //     title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
  //     path
  //   }
  // },
  // processLogin(e) {
  //   if (!e.detail.userInfo) {
  //     wx.showToast({
  //       title: '已取消',
  //       icon: 'none',
  //     })
  //     return;
  //   }
  //   AUTH.register(this);
  // },
  // couponOverlayClick() {
  //   this.setData({
  //     showCouponPop: false
  //   })
  // },
  // couponImageClick() {
  //   wx.navigateTo({
  //     url: '/pages/coupons/index',
  //   })
  // },
  async noticeLastOne() {
    const res = await WXAPI.noticeLastOne()
    if (res.code == 0) {
      this.setData({
        noticeLastOne: res.data
      })
    }
  },
  // goNotice(e) {
  //   const id = e.currentTarget.dataset.id
  //   wx.navigateTo({
  //     url: '/pages/notice/detail?id=' + id,
  //   })
  // },
  async banners() {
    const res = await WXAPI.banners()
    if (res.code == 0) {
      this.setData({
        banners: res.data
      })
    }
  },
  // tapBanner(e) {
  //   const url = e.currentTarget.dataset.url
  //   if (url) {
  //     wx.navigateTo({
  //       url
  //     })
  //   }
  // },
  checkIsOpened(startTime,endTime) {
    const date = new Date();
    // const startTime = openingHours.split('-')[0]
    // const endTime = openingHours.split('-')[1]
    const dangqian=date.toLocaleTimeString('chinese',{hour12:false})
    console.log("当前时间",dangqian)
    const dq=dangqian.split(":")
    const a = startTime.split(":")
    const b = endTime.split(":")

    const dqdq=date.setHours(dq[0],dq[1])
    const aa=date.setHours(a[0],a[1])
    const bb=date.setHours(b[0],b[1])

    if (a[0]*1 > b[0]*1) {
      // 说明是到第二天
      return !this.checkIsOpened(endTime + '-' + startTime)
    }
    return aa<dqdq && dqdq<bb
  },
  // yuanjiagoumai() {
  //   this.setData({
  //     showPingtuanPop: false,
  //     showGoodsDetailPOP: true
  //   })
  // },
  // _lijipingtuanbuy() {
  //   const curGoodsMap = this.data.curGoodsMap
  //   curGoodsMap.price = curGoodsMap.basicInfo.pingtuanPrice
  //   this.setData({
  //     curGoodsMap,
  //     showPingtuanPop: false,
  //     showGoodsDetailPOP: true,
  //     lijipingtuanbuy: true
  //   })
  // },
  // pingtuanbuy() {
  //   // 加入 storage 里
  //   const curGoodsMap = this.data.curGoodsMap
  //   const canSubmit = this.skuCanSubmit()
  //   const additionCanSubmit = this.additionCanSubmit()
  //   if (!canSubmit || !additionCanSubmit) {
  //     wx.showToast({
  //       title: '请选择规格',
  //       icon: 'none'
  //     })
  //     return
  //   }
  //   const sku = []
  //   if (curGoodsMap.properties) {
  //     curGoodsMap.properties.forEach(big => {
  //       const small = big.childsCurGoods.find(ele => {
  //         return ele.selected
  //       })
  //       sku.push({
  //         optionId: big.id,
  //         optionValueId: small.id,
  //         optionName: big.name,
  //         optionValueName: small.name
  //       })
  //     })
  //   }
  //   const additions = []
  //   if (curGoodsMap.basicInfo.hasAddition) {
  //     this.data.goodsAddition.forEach(ele => {
  //       ele.items.forEach(item => {
  //         if (item.active) {
  //           additions.push({
  //             id: item.id,
  //             pid: item.pid,
  //             pname: ele.name,
  //             name: item.name
  //           })
  //         }
  //       })
  //     })
  //   }
  //   const pingtuanGoodsList = []
  //   pingtuanGoodsList.push({
  //     goodsId: curGoodsMap.basicInfo.id,
  //     number: curGoodsMap.number,
  //     categoryId: curGoodsMap.basicInfo.categoryId,
  //     shopId: curGoodsMap.basicInfo.shopId,
  //     price: curGoodsMap.price,
  //     score: curGoodsMap.basicInfo.score,
  //     pic: curGoodsMap.basicInfo.pic,
  //     name: curGoodsMap.basicInfo.name,
  //     minBuyNumber: curGoodsMap.basicInfo.minBuyNumber,
  //     logisticsId: curGoodsMap.basicInfo.logisticsId,
  //     sku,
  //     additions
  //   })
  //   wx.setStorageSync('pingtuanGoodsList', pingtuanGoodsList)
  //   // 跳转
  //   wx.navigateTo({
  //     url: '/pages/pay/index?orderType=buyNow&pingtuanOpenId=' + this.data.pingtuan_open_id,
  //   })
  // },
  // _lijipingtuanbuy2() {
  //   this.data.share_pingtuan_open_id = null
  //   this._showGoodsDetailPOP(this.data.curGoodsMap.basicInfo.id)
  // },
  goodsAddition(goodsId){
    console.log(goodsId);
    let sizeArray = [];
    let sugarArray = [];
    let tempArray = [];
    const getGoodsCondition = API.getGoodsCondition(
      {'goodsId':goodsId})
    getGoodsCondition.then(res => {
      if(res.statusCode==200){
        if(res.data.length>0){
          res.data.forEach(ele => {
            if(ele.flagId==0){
              sizeArray.push(ele);
            }
            if(ele.flagId == 2){
              sugarArray.push(ele)
            }
            if(ele.flagId==1){
              tempArray.push(ele)
            }
          })
          this.setData({
            sizeArray:sizeArray,
            tempArray:tempArray,
            sugarArray:sugarArray
          })
        }else{

        }   
      }
    })
    // if (res.code == 0) {
    //   this.setData({
    //     goodsAddition: res.data
    //   })
    // } else {
    //   this.setData({
    //     goodsAddition: null
    //   })
    // }
  },
  // tabbarChange(e) {
  //   if (e.detail == 1) {
  //     wx.navigateTo({
  //       url: '/pages/cart/index',
  //     })
  //   }
  //   if (e.detail == 2) {
  //     wx.navigateTo({
  //       url: '/pages/cart/order',
  //     })
  //   }
  // },
  // 显示分类和商品数量徽章
  processBadge() {
    const categories = this.data.categories
    const goods = this.data.goods
    const shippingCarInfo = this.data.shippingCarInfo
    if (!categories) {
      return
    }
    if (!goods) {
      return
    }
    categories.forEach(ele => {
      ele.badge = 0
    })
    goods.forEach(ele => {
      ele.badge = 0
    })
    if (shippingCarInfo) {
      shippingCarInfo.forEach(ele => {
        if (ele.categoryId) {
          const category = categories.find(a => {
            return a.id == ele.categoryId
          })
          if (category) {
            category.badge += ele.number
          }
        }
        if (ele.goodsId) {
          const _goods = goods.find(a => {
            return a.id == ele.goodsId
          })
          if (_goods) {
            _goods.badge += ele.number
          }
        }
      })
    }
    this.setData({
      categories,
      goods
    })
  },
  // getPhoneNumber(e) {
  //   console.log(e.detail.errMsg)
  //   console.log(e.detail.iv)
  //   console.log(e.detail.encryptedData)
  // }
})
