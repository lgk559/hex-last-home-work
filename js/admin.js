const orderPageTable = document.querySelector(".orderPage-table");
const ordersData = [];

init();

function init(){
  orderPageTable.addEventListener("click",manageOrders);
  document.querySelector(".discardAllBtn").addEventListener("click",delAllOrder);
  document.querySelector("#doAllChart").addEventListener("click",()=>{upDataChart("all")});
  document.querySelector("#doRankingChart").addEventListener("click",()=>{upDataChart("ranking")})
  getOrder();
};

// 得到訂單
function getOrder() {
  doLoading(true);
  adminInstance
    .get("orders")
    .then((response) => {
      ordersData.splice(0,ordersData.length);
      ordersData.push(...response.data.orders);
      renderOrder();
      upDataChart();
    })
    .catch((error)=>{
      doAlert(error.status, error.message);
    })
    .finally(()=>{
      doLoading(false);
    })
};

// 渲染訂單
function renderOrder() {
  let template_thead = `
    <thead>
        <tr>
            <th>訂單編號</th>
            <th>聯絡人</th>
            <th>聯絡地址</th>
            <th>電子郵件</th>
            <th>訂單品項</th>
            <th>訂單日期</th>
            <th>訂單狀態</th>
            <th>操作</th>
        </tr>
    </thead>`;
  let template_all = "";
  ordersData.forEach((item) => {
    let template_productList = "";
    let template_user = "";
    for (let i = 0; i < item.products.length; i++) {
      template_productList += `<p>${item.products[i].title}</p>`;
    }

    template_user = `
        <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
    `;

    template_all += `
            <tr data-id="${item.id}">
                <td>${item.id}</td>
                ${template_user}
                <td>
                    ${template_productList}
                </td>
                <td>${filtersDate(item.updatedAt)}</td>
                <td class="orderStatus">
                  ${item.paid ? '<a href="#" data-order-type=true>已處理</a>' : '<a href="#" data-order-type=false>未處理</a>'}
                    
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn" value="刪除">
                </td>
            </tr>
        `;
  });
  orderPageTable.innerHTML = template_thead + template_all;
};

// 更新圖表
function upDataChart(filter = "all") {
  const categorySales = ordersData.reduce((acc, order) => {
    order.products.forEach((product) => {
      const { category, price, quantity } = product;
      const totalForProduct = price * quantity;

      if (acc[category]) {
        acc[category] += totalForProduct;
      } else {
        acc[category] = totalForProduct;
      }
    });
    return acc;
  }, {});
  
  if(filter === "ranking"){
    const sortedSales = Object.entries(categorySales).sort((a,b)=>b[1] - a[1]);
    const restTotal = sortedSales.slice(4).reduce((total,[_,sale])=> total + sale,0)
    const result = [
      ...sortedSales.slice(0,3),
    ];
    result.push(['其他', restTotal])
    readerChart(result);
  }
  else if(filter === "all"){
    const result = [
      ...Object.entries(categorySales),
    ];
    readerChart(result);
  }
};

// 渲染圖表
function readerChart(result) {
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: result,
    },
    color: {
      pattern: [
        "#5151D3",
        "#E68618",
        "#26C0C7",
        "red",
      ]
    },
  });
};

// 管理訂單
function manageOrders(e){
  e.preventDefault();
  let nodeName = e.target.nodeName;
  let orderId = "";
  
  if(nodeName == "A"){
    orderId = e.target.closest("[data-id]").dataset.id;
    let orderType = e.target.dataset.orderType;
    changeOrder(orderId,orderType)
  }
  else if(nodeName == "INPUT"){
    orderId = e.target.closest("[data-id]").dataset.id;
    delOrder(orderId)
  }
};

// 刪除訂單
function delOrder(orderId){  
  doLoading(true);
  adminInstance
    .delete(`orders/${orderId}`)
    .then((res)=>{
      getOrder();
      upDataChart();
      doAlert(res.status, "刪除成功");
    })
    .catch((error)=>{
      doAlert(error.status, error.message)
    })
    .finally(()=>{
      doLoading(false);
    })
};

// 修改訂單狀態
function changeOrder(orderId,orderType){
  doLoading(true);
  let newOrderType = orderType === "true" ? false : true
  adminInstance
    .put("orders", 
      {
      "data":
        {
          "id": orderId,
          "paid": newOrderType
        }
      }
    )
    .then((res)=>{
      getOrder();
      doAlert(res.status, "修改成功")
    })
    .catch((error)=>{
      doAlert(error.status, error.message)
    })
    .finally(()=>{
      doLoading(false);
    })
};

// 刪除全部訂單
function delAllOrder(){
  adminInstance
    .delete("orders")
    .then((res)=>{
      getOrder();
      upDataChart();
      doAlert(res.status, "刪除成功")
    })
    .catch((error)=>{
      doAlert(error.status, error.message)
    })
    .finally(()=>{
      doLoading(false);
    })
};
