import request from '@/utils/request'

export function getPriceUnits() {
  return request({
    url: '/sm/m/price/units',
    method: 'get'
  })
}