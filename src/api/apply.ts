import request from '@/utils/request'

// 我的申请流程单
export const getMyApplies = (params: any) => {
  return request({
    url: '/sm/o/approval/my/create',
    method: 'get',
  })
}


// 我的审批
export const getMyApproves = (params: any) => {
  return request({
    url: '/sm/o/approval/my/approval',
    method: 'get',
  })
}

