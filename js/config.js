const baseUrl = "https://livejs-api.hexschool.io";
const apiPath = "ozeu";

// 前台
const customerApi = `${baseUrl}/api/livejs/v1/customer/${apiPath}/`;

const customerInstance = axios.create({
    baseURL: customerApi,
})


// 後台
const adminApi = `${baseUrl}/api/livejs/v1/admin/${apiPath}/`;
const token = "5pgWkORbi7URwyqyhXjBFHXNvcT2";

const adminInstance = axios.create({
    baseURL: adminApi,
    headers: {
        authorization: token
    }
})