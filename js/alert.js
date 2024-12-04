const loadingBox = document.querySelector(".loadingBox");

// 訊息提示
function doAlert(status,message){
    const icon = String(status).slice(0, 1) == "2" ? 'success' : 'error'
    Swal.fire({
        title: status,
        text: message,
        icon: icon,
        confirmButtonText: '關閉'
      })
};

// 頁面載入提示
function doLoading(isLoading){
  if(isLoading){
    loadingBox.classList.add("isLoading");
  }
  else{
    loadingBox.classList.remove("isLoading");
  }
};