export function downLoadFile(res) {
    // 从响应头里面拿取加密后的文件名code
    const fileNameEnde = res.headers['content-disposition'].split('=')[1]
    // 将获取到的文件名code进行解码
    const fileName = decodeURIComponent(fileNameEnde)
    const blob = new Blob([res.data]);  // 把得到的结果用流对象转一下
    var a = document.createElement("a"); //创建一个<a></a>标签
    a.href = URL.createObjectURL(blob); // 将流文件写入a标签的href属性值
    a.download = `${fileName}`; //设置文件名
    a.style.display = "none";  // 障眼法藏起来a标签
    document.body.appendChild(a); // 将a标签追加到文档对象中
    a.click(); // 模拟点击了a标签，会触发a标签的href的读取，浏览器就会自动下载了
    a.remove(); // 一次性的，用完就删除a标签
}
