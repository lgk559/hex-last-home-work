let productsData = [];
let cartData = [];

const producUl = document.querySelector(".productWrap");
const shoppingCartTable = document.querySelector(".shoppingCart-table");
const newOrderForm = document.querySelector(".orderInfo-form");
const newOrderForm_inputs = document.querySelectorAll(".orderInfo-input");
const newOrderForm_erroMessage =
  document.querySelectorAll(".orderInfo-message");
init();

// 初始
function init() {
  document
    .querySelector(".productSelect")
    .addEventListener("change", areaFliterData);
  producUl.addEventListener("click", clickAddCartBtn);
  shoppingCartTable.addEventListener("click", clickDelCartBtn);
  document
    .querySelector(".orderInfo-btn")
    .addEventListener("click", checkOrdeForm);
  newOrderForm.addEventListener("submit", checkOrdeForm, true);
  initType();
  getProducts();
  getCart();
}

// 回複初始狀態
function initType() {
  const DOM_allAlertMessage = document.querySelectorAll(".orderInfo-message");
  DOM_allAlertMessage.forEach((domItem) => {
    domItem.style.display = "none";
  });
}

// 取得產品清單
function getProducts() {
  customerInstance.get("products")
  .then((response) => {
    productsData = response.data.products;
    areaFliterData("全部");
  })
  .catch(function (error) {
    doAlert(error.status, error.message);
  })
}

// 篩選符合類別的產品
function areaFliterData(areaVlue = "全部") {
  let selectArea = this.value || areaVlue;
  let filteredData =
    selectArea === "全部"
      ? productsData
      : productsData.filter(
          (productItem) => productItem.category == selectArea
        );
  renderAreaFilter(filteredData);
}

// 渲染產品清單
function renderAreaFilter(filteredData) {
  let template = "";
  filteredData.forEach((productItem) => {
    template += `<li class="productCard">
                <h4 class="productType">${productItem.category}</h4>
                <img src="${productItem.images}" alt="">
                <a href="#" class="addCardBtn" data-product-id="${
                  productItem.id
                }">加入購物車</a>
                <h3>${productItem.title}</h3>
                <del class="originPrice">
                  ${filtersCurrencyUSD(productItem.origin_price)}
                </del>
                <p class="nowPrice">${filtersCurrencyUSD(productItem.price)}</p>
            </li>`;
  });
  producUl.innerHTML = template;
}



// 取得購物車
function getCart() {
  const api_getCarts = customerApi + "carts";
  customerInstance.get("carts")
  .then((response) => {
    cartData = response.data;
    renderCart();
  })
  .catch((error)=>{
    doAlert(error.status, error.message);
  })
}

// 購物車-觸發加入購物車按鈕
function clickAddCartBtn(e) {
  e.preventDefault();
  const triggeringNodeName = e.target.nodeName;
  const newAddQty = 1;
  if (triggeringNodeName === "A") {
    const productId = e.target.dataset.productId;
    mergeRepeatCartItem(productId, newAddQty);
  }
}
// 購物車-觸發刪除按鈕
function clickDelCartBtn(e) {
  e.preventDefault();
  if (e.target.className === "material-icons") {
    const cartId = e.target.dataset.cartItemId;
    delCart(cartId);
  } else if (e.target.className === "discardAllBtn") {
    delCart();
  }
}

// 檢查是否有重複的品項
function mergeRepeatCartItem(productId, newAddQty = 1) {
  const cartJSNO = cartData.carts;
  cartJSNO.forEach((item) => {
    if (item.product.id === productId) {
      newAddQty = item.quantity + newAddQty;
    }
  });
  addCart(productId, newAddQty);
}

// 購物車-新增
function addCart(productId, newAddQty) {
  customerInstance
    .post("carts", { data: { productId: productId, quantity: newAddQty } })
    .then((res) => {
      cartData = res.data;
      renderCart();
      doAlert(res.status, "已加入購物車");
    })
    .catch((error)=>{
      doAlert(error.status, error.message);
    })
}

// 購物車-刪除
function delCart(cartId = null) {
  const api_delCart = cartId ? `carts/${cartId}` : `carts`;
  customerInstance.delete(api_delCart).then((res) => {
    doAlert(res.status, "刪除成功");
    getCart();
  })
  .catch((error)=>{
    doAlert(error.status, error.message);
  })
}

// 印出購物車清單
function renderCart() {
  const cartJSNO = cartData.carts;
  const cartTotalPrice = cartData.total;
  const cartFinalTotalPrice = cartData.finalTotal;
  let template = `<tr>
                    <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>`;

  if (cartJSNO.length > 0) {
    cartJSNO.forEach((item, index) => {
      template += `
            <tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>${item.product.price}</td>
                <td>${item.quantity}</td>
                <td>${item.product.price * item.quantity} </td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-cart-item-id=${
                      item.id
                    }>clear</a>
                </td>
            </tr>`;
      if (index == cartJSNO.length - 1) {
        template += `
                <tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>${filtersCurrencyUSD(cartFinalTotalPrice)}</td>
                </tr>`;
      }
    });
  }else{
    template += `
            <tr>
                <td colspan="4" style="text-align: center;">空</td>
            </tr>`;
  }

  shoppingCartTable.innerHTML = template;
}

// 初始表單
function initOrdeForm() {
  
}
const container = document.getElementById("customerPhone");
container.addEventListener("change", function (e) {
  const firstTwoDigits = this.value.substring(0, 2);
  if (firstTwoDigits === "09") {
    // 假設09開頭為手機號碼
    this.value = this.value.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
  } else {
    // 假設其他開頭為市話號碼
    this.value = this.value.replace(/(\d{2,3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  }
});
// 客戶訂單資料驗證
const constraints = {
  姓名: {
    presence: {
      message: "^必填",
    },
    length: {
      minimum: 2,
      maximum: 20,
    },
  },
  電話: {
    presence: {
      message: "^必填",
    },
    format: {
      pattern: "09[0-9]{2}-[0-9]{3}-[0-9]{3}|[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}",
      message: "^請填入正確格式",
    },
  },
  Email: {
    presence: {
      message: "^必填",
    },
    email: {
      message: "^請填寫正確",
    },
  },
  寄送地址: {
    presence: {
      message: "^必填",
    },
  },
  交易方式: {
    presence: {
      message: "^必填",
    },
  },
}; 
function checkOrdeForm(e) {
  e.preventDefault();
  let errors = validate(e.target.form, constraints);
  const form = e.target.form;
  initType();

  if (errors) {
    Object.keys(errors).forEach(function (keys, index) {
      let alertMessage = document.querySelector(`[data-message=${keys}]`);
      alertMessage.style.display = "flex";
      alertMessage.textContent = errors[keys];
    });
  } else {
    const user = {
      name: "",
      tel: "",
      email: "",
      address: "",
      payment: "",
    };
    Object.keys(user).forEach(function (keys, index) {
      user[keys] = form[index].value;
    });
    sendOrdeForm(user);
    initType();
  }
}

// 送出訂單
function sendOrdeForm(user) {
  const data = {
    data: { user: user },
  };
  const api_addOrder = customerApi + "orders";
  customerInstance
    .post("orders", data)
    .then((res) => {
      newOrderForm.reset();
      doAlert(res.status, "訂單成立");
      getCart();
    })
    .catch((error) => {
      // 請求失敗時
      doAlert(error.status, error.message);
    });
}
