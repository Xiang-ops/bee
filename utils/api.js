const HTTP = require("./http.js")

//获取地理位置距离

function getLocation (params) {
  return HTTP.WXGET('user/distance',params);
}
function goodsCategory(){
  return HTTP.WXGET('menutype');
}
function goods(params){
  return HTTP.WXGET('goodsById',params);
}
function orderList(params){
  return HTTP.WXGET('order/list',params);
}
function getCommentList(){
  return HTTP.WXGET('comment');
}
function getGoodsCondition(params){
  return HTTP.WXGET('goods/conditions',params);
}
function addOrderMenu(params){
  return HTTP.WXPOST('order/menu/add',params);
}
function addOrder(params){
  return HTTP.WXPOST('order/add',params)
}
function MenuList(params){
  return HTTP.WXGET('order/menu/list',params);
}
function addComment(params){
  return HTTP.WXPOST('comment/add',params);
}
function scoreSign(params){
  return HTTP.WXGET('score/sign',params);
}
function scoreSignLogs(params){
  return HTTP.WXGET('sign/log',params);
}
function getShopDetail(params){
  return HTTP.WXGET('shop/detail',params);
}
function getInfo(params){
  return HTTP.WXGET('get/user/info',params);
}
function getPoint(params){
  return HTTP.WXGET('get/user/point',params);
}
function addPoint(params){
  return HTTP.WXGET('add/point',params);
}
function findPointByUser(params){
  return HTTP.WXGET('all/user/point',params);
}
function getAllCoupon(){
  return HTTP.WXGET('get/all/coupon')
}
function getFreeCoupon(){
  return HTTP.WXGET('get/free/coupon')
}
function fetchCoupons(params){
  return HTTP.WXGET('fetch/coupon',params)
}
function myCoupons(params){
  return HTTP.WXGET('get/user/coupon',params)
}
function changeCoupon(params){
  return HTTP.WXGET('change/user/coupon',params)
}
function getUseCoupons(params){
  return HTTP.WXGET('get/use/coupon',params)
}
function updateAmount(params){
  return HTTP.WXGET('update/amount',params)
}
function userLevelList(params){
  return HTTP.WXGET('get/level/list',params)
}
function userAmount(params){
  return HTTP.WXGET('get/user/amount',params)
}
function getUserLevel(params){
  return HTTP.WXGET('get/user/level',params)
}
function updateUserLevel(params){
  return HTTP.WXGET("update/user/level",params)
}
function getLevelName(params){
  return HTTP.WXGET("get/level/name",params)
}
function selectDiscount(params){
  return HTTP.WXGET("get/member/discount",params)
}
function myCouponNum(params){
  return HTTP.WXGET("get/user/coupon/num",params)
}
module.exports = {
  getLocation: getLocation,
  goodsCategory:goodsCategory,
  goods:goods,
  orderList:orderList,
  getCommentList:getCommentList,
  getGoodsCondition:getGoodsCondition,
  addOrderMenu:addOrderMenu,
  addOrder:addOrder,
  MenuList:MenuList,
  addComment:addComment,
  scoreSign:scoreSign,
  scoreSignLogs:scoreSignLogs,
  getShopDetail:getShopDetail,
  getInfo:getInfo,
  getPoint:getPoint,
  addPoint:addPoint,
  findPointByUser:findPointByUser,
  getAllCoupon:getAllCoupon,
  getFreeCoupon:getFreeCoupon,
  fetchCoupons:fetchCoupons,
  myCoupons:myCoupons,
  changeCoupon:changeCoupon,
  getUseCoupons:getUseCoupons,
  updateAmount:updateAmount,
  userLevelList:userLevelList,
  userAmount:userAmount,
  getUserLevel:getUserLevel,
  updateUserLevel:updateUserLevel,
  getLevelName:getLevelName,
  selectDiscount:selectDiscount,
  myCouponNum:myCouponNum
}