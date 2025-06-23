import request from '@/utils/request'

export const rmb2point = (rmb: any) => {
  return request({
    url: '/sm/o/points/compute',
    method: 'get',
    params: {
      rmb
    }
  })
}

export const inChange = (data: any) => {
  return request({
    url: '/sm/o/points/recharge/org',
    method: 'post',
    data
  })
}