// 格式化貨幣(加上當地貨幣代碼、三位一撇)
function filtersCurrencyUSD(price) {
    const currencyCode = "NT$";
    price = Number(price).toFixed(0);
    if (!isNaN(price)) {
      const regex = /\B(?=(?:\d{3})+(?!\d))/g;
      return `${currencyCode}${price.replace(regex, ",")}`;
    } else {
      return `${currencyCode}0`;
    }
}

// 格式化時間格式
function filtersDate(timestamp){
    let time = new Date(timestamp*1000);
    const formatTime = time.toLocaleString("zh-TW", {
        hour12: false, // 使用 24 小時制
    });
    return formatTime;
}