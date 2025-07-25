import request from '@/utils/request'


// 标签管理接口

// 导出一个函数，用于获取标签列表
export const getTagList = () => {
  return request({
    url: '/sm/o/tag',
    method: 'get',
  })
}

// 导出一个名为addTag的函数，接收一个参数data
export const addTag = (data: any) => {
  return request({
    url: '/sm/o/tag',
    method: 'post',
    data
  })
}

// 导出一个函数deleteTag，用于删除标签
export const deleteTag = (data: any) => {
  return request({
    url: `/sm/o/tag`,
    method: 'delete',
    data
  })
}


// 上传文件接口

// 导出一个名为uploadFile的函数，用于上传文件
export const uploadFile = (data: any) => {
  return request({
    url: '/file',
    method: 'post',
    // 设置上传 文件的 请求头
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  })
}


// 案例管理接口

export const uploadCase = (data: any) => {
  return request({
    url: '/collection/upload',
    method: 'post',
    data
  })
}

export const getCaseList = () => {
  return request({
    url: '/collection',
    method: 'get',
  })
}

export const deleteCase = (id: string|number) => {
  return request({
    url: `/collection/del/${id}`,
    method: 'delete',
  })
}


export const findCase = (data : any) => {
  return request({
    url: '/collection/find',
    method: 'get',
    params: data
  })
}


export const getCaseDetail = (id: any) => {
  return request({
    url: `/collection/${id}`,
    method: 'get',
  })
}


  
  