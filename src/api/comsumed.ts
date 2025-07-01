import request from '@/utils/request'

// 获取消费记录
export function getPointValid() {
  return request({
    url: '/su/point/valid',
    method: 'get',
  })
}

export function getPointComsumed() {
  return request({
    url: '/su/point/consume',
    method: 'get',
  })
}

export function getPointBill () {
  return request({
    url: '/su/point/bill',
    method: 'get',
  })
}