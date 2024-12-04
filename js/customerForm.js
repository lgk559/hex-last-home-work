const customerPhone = document.getElementById("customerPhone");

customerPhone.addEventListener("change", function (e) {
  const firstTwoDigits = this.value.substring(0, 2);
  if (firstTwoDigits === "09") {
    // 假設09開頭為手機號碼
    this.value = this.value.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3");
  } else {
    // 假設其他開頭為市話號碼
    this.value = this.value.replace(/(\d{2}|\d{3}|)(\d{3,4})(\d{4})/, "$1-$2-$3");
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

// 驗證表格
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
  };