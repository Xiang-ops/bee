const host_url = "http://localhost:8089/";

function get(url,params){
  return new Promise((resolve,reject)=>{
    wx.request({
      url: host_url+url,
      method: 'GET',
      data:params,
      header:{
        'content-type': 'application/json'
      },
      success: (res) => {
        // console.log("请求成功",res);
        resolve(res);
      },
      fail: (res) => {
        reject(res)
      }
    })
  })
  
}

function post(url,params){
  return new Promise((resolve,reject) => {
    wx.request({
      url: host_url+url,
      method: 'POST',
      data:params,
      header:{
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        // console.log("请求成功",res);
        resolve(res);
      },
      fail: (res) => {
        // console.log("请求失败",res);
        reject(res);
      }
    })
  })
  
}

module.exports = {
  WXGET: get,
  WXPOST:post
}