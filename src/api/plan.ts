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

// departed
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

// 跟新html内容
export function editorProjectHtml(data: any){
  return request({
    url: '/project/edit',
    method: 'post',
    data
  })
}


// TODO 先看大纲接口
export function genOutlineWebsocketId(data: any) {
  return request({
    url: '/outline',
    method: 'post',
    data
  })
}

// 更新新大纲
export function updateOutline(data: any) {
  return request({
    url: '/outline/update',
    method: 'post',
    data
  })
}

// 根据大纲生成讲义
export function genPlanFromOutline(mOutlineId: string ){
  return request({
    url: `/outline/materials/${mOutlineId}`,
    method: 'post',
  })
}