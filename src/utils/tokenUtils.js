export function getTokenName() {
    return "yk_token"
}
export function removeToken() {
    window.localStorage.removeItem(getTokenName());
    window.sessionStorage.removeItem(getTokenName());
}

// 查看缓存中是否存在token
export function hasToken() {
    if (window.localStorage.getItem(getTokenName())) {
        return true;
    }
    if (window.sessionStorage.getItem(getTokenName())) {
        return true;
    }
    return false;
}