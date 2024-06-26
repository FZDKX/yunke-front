import request from "../utils/request";


export function doGetProductList(pageNum, pageSize) {
    return request.get('/api/product/list', {
        params: {
            pageNum,
            pageSize
        }
    })
}

export function doGetProduct(id) {
    return request.get('/api/product/' + `${id}`)
}

export function doEditProduct(data) {
    return request.put('/api/product',data)
}

export function doAddProduct(data) {
    return request.post('/api/product',data)
}

// 下架商品
export function doDownProduct(id) {
    return request.put('/api/product/down/' + `${id}`)
}

export function doUpProduct(id) {
    return request.put('/api/product/up/' + `${id}`)
}