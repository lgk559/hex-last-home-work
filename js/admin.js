const orderPageTable = document.querySelector(".orderPage-table");
const ordersData = [];

init();

function init(){
  orderPageTable.addEventListener("click",manageOrders);
  document.querySelector(".discardAllBtn").addEventListener("click",delAllOrder)
  getOrder();
}

// 得到訂單
function getOrder() {
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
}

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
                <td>${filtersDate(item.createdAt)}</td>
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
}

// 更新圖表
function upDataChart() {
  const categorySales = ordersData.reduce((acc, order) => {
    order.products.forEach((product) => {
      const { category, price, quantity } = product;
      const totalForProduct = price * quantity;

      // 如果 acc 中已經有這個 category，就加上這次的銷售額
      if (acc[category]) {
        acc[category] += totalForProduct;
      } else {
        // 如果沒有，就新增一個
        acc[category] = totalForProduct;
      }
    });
    return acc;
  }, {});

  // 將物件轉換成你想要的二維陣列格式
  const result = Object.entries(categorySales).map(([category, total]) => [
    category,
    total,
  ]);

  readerChart(result)
}

// 渲染圖表
function readerChart(result) {
  // C3.js
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
      ]
    },
  });
}

// 
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
}

// 刪除訂單
function delOrder(orderId){  
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
}

// 修改訂單狀態
function changeOrder(orderId,orderType){
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
}

// 刪除全部訂單
function delAllOrder(){
  axios
    .delete("orders")
    .then((res)=>{
      getOrder();
      upDataChart();
      doAlert(res.status, "刪除成功")
    })
}