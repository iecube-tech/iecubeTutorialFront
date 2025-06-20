  export const getRemark = row => {
    let text = ''
    let l = row.approvalLogs.length
    let lastItem = row.approvalLogs[l - 1]
    if(lastItem.action === 'APPROVE' || lastItem.action === 'REJECT'){
      text = lastItem.remark
    }
    return text
  }
  
  export const remarkVisible = row => {
    let visible = false
    // let rawRow = toRaw(row)
    visible = ["APPROVED","REJECTED"].includes(row.status)
    return visible
  }