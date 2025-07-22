import request from '@/utils/request'
/**
 * @Date 25025/7/18 update 生成讲义改为生成工程方式接口修改
 */

// 获取工程列表
export function getPlanList() {
  return request({
    url: '/project',
    method: 'get',
  })
}

// 一键生成
export function generatePlan(data: any) {
  return request({
    url: '/material/generate',
    method: 'post',
    data
  })
}

export function removePlan(projectId: number|string) {
  return request({
    url: '/project',
    method: 'delete',
    params: {
      projectId
    }
  })
}

export function updatePlan(data: any) {
  return request({
    url: '/material/update',
    method: 'post',
    data
  })
}


// 根据案例id生成一个新工程
export function createProjectByCaseId(collection: any) {
  return request({
    url: '/project',
    method: 'post',
    params: {
      collection
    }
  })
}

export function getProjectDetail(projectId : any) {
  return request({
    url: '/project/detail',
    method: 'get',
    params: {
      projectId 
    }
  })
}
