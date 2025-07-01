import request from '@/utils/request'

export function getPriceUnits() {
  return request({
    url: '/sm/m/price/units',
    method: 'get'
  })
}


export function getExpireDays() {
  return request({
    url: '/sm/m/point/expire/days',
    method: 'get',
  })
}

export function updateConfig(data: any) {
  return request({
    url: '/sm/o/price/change',
    method: 'post',
    data
  })
}