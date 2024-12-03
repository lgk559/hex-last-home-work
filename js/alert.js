function doAlert(status,message){
    const icon = String(status).slice(0, 1) == "2" ? 'success' : 'error'
    Swal.fire({
        title: status,
        text: message,
        icon: icon,
        confirmButtonText: '關閉'
      })
}