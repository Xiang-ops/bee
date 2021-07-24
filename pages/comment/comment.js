// pages/comment/comment.js
const API = require('../../utils/api')



Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList:[],
    value:0
  },
  changeRadio(e) {
    let isShow = e.detail.value;
    // 判断是否匿名
    console.log("改变的事件=======>",e)
  },
  onChange(e){
    console.log(e)
    this.setData({
      value: e.detail,
    })
  },
  afterRead(event) {
    const _this = this;
    const { file } = event.detail;
    console.log("函数执行")
    // console.log(HTTP.host_url);
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: 'http://localhost:8089/menu/picture/update', // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      formData: { user: 'test' },
      success(res) {
        // 上传完成需要更新 fileList
        let objRes = JSON.parse(res.data);
        let fileList = [];
        console.log(objRes.url)
        _this.setData({
          url:objRes.url
        })
        let url = 'http://localhost:8089'+objRes.url;
        fileList.push({url: url});
        _this.setData({ fileList });
      },
    });
  },
  upLoadFile(e){
    wx.chooseImage({
      count: 3,
      success(res){
        console.log("文件=====>",res)
        wx.uploadFile({
          filePath: res.tempFilePaths,
          name: 'file',
          url: 'http://localhost:8089/menu/picture/update',
          formData: {
            'user': 'test'
          },
          success (res){
            const data = res.data
            //do something
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options=======>",options);
    let userName = options.userName;
    let menuName = options.menuName;
    let orderNumber = options.orderNumber;
    this.setData({
      menuName,
      userName,
      orderNumber
    })
  },
  inputComment(e){
    console.log(e)
    let comment = e.detail.value;
    this.setData({
      comment
    })
  },
  submitComment(){
    let evaluation = this.data.comment;
    let _this = this;
    let picUrl = this.data.url;
    console.log("文件",picUrl);
    let grade = this.data.value;
    console.log("分数",grade);
    if(evaluation){
      console.log("评论",evaluation);
      let addComment = API.addComment({
        evaluation:evaluation,
        picture:picUrl,
        grade:grade,
        userName:_this.data.userName,
        menuName:_this.data.menuName,
        orderNumber:_this.data.orderNumber
      })
      addComment.then(res => {
        wx.navigateBack({
          delta: -1,
        })
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '请填写评论'
      })
    }
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