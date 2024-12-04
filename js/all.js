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
};

// 回複初始狀態
function initType() {
  const DOM_allAlertMessage = document.querySelectorAll(".orderInfo-message");
  DOM_allAlertMessage.forEach((domItem) => {
    domItem.style.display = "none";
  });
}

// 取得產品清單
function getProducts() {
  doLoading(true);
  customerInstance.get("products")
  .then((response) => {
    productsData = response.data.products;
    areaFliterData("全部");
  })
  .catch(function (error) {
    doAlert(error.status, error.message);
  })
  .finally(()=>{
    doLoading(false);
  })
};

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
};

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
};

// 取得購物車
function getCart() {
  doLoading(true);
  customerInstance.get("carts")
  .then((response) => {
    cartData = response.data;
    renderCart();
  })
  .catch((error)=>{
    doAlert(error.status, error.message);
  })
  .finally(()=>{
    doLoading(false);
  })
};

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
};

// 檢查是否有重複的品項
function mergeRepeatCartItem(productId, newAddQty = 1) {
  const cartJSNO = cartData.carts;
  cartJSNO.forEach((item) => {
    if (item.product.id === productId) {
      newAddQty = item.quantity + newAddQty;
    }
  });
  addCart(productId, newAddQty);
};

// 購物車-新增
function addCart(productId, newAddQty) {
  doLoading(true);
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
    .finally(()=>{
      doLoading(false);
    })
};

// 購物車-刪除
function delCart(cartId = null) {
  doLoading(true);
  const api_delCart = cartId ? `carts/${cartId}` : `carts`;
  customerInstance.delete(api_delCart).then((res) => {
    doAlert(res.status, "刪除成功");
    getCart();
  })
  .catch((error)=>{
    doAlert(error.status, error.message);
  })
  .finally(()=>{
    doLoading(false);
  })
};

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
};

// 送出訂單
function sendOrdeForm(user) {
  const data = {
    data: { user: user },
  };
  doLoading(true);
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
    })
    .finally(()=>{
      doLoading(false);
    })
};
