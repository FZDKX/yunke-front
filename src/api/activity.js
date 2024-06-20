import request from "../utils/request"

// 带条件的分页查询  doSearch
export function doSearch(searchData) {
    return request.get('/api/activity/list', {
        params: {
            ownerId: searchData.ownerId,
            name: searchData.name,
            minCost: searchData.minCost,
            maxCost: searchData.maxCost,
            activityMinTime: searchData.activityMinTime,
            activityMaxTime: searchData.activityMaxTime,
            pageNum: searchData.pageNum,
            pageSize: searchData.pageSize,
        }
    })
}

// 根据id查询活动信息
export function doLoadActivity(id) {
    return request.get('/api/activity/' + `${id}`)
}


// 编辑
export function doEditActivity(data) {
    return request.put('/api/activity', data)
}


// 新增
export function doAddActivity(data) {
    return request.post('/api/activity', data)
}


// 单个删除
export function doDelActivity(id) {
    return request.delete('/api/activity/' + `${id}`)
}


// 批量删除
export function doDelBatchActivity(ids) {
    return request.delete('/api/activity/batch', {
        data: {
            ids
        }
    })
}