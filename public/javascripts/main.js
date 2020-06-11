// 下捲時隱藏上方廣告列

// 修改自：https://www.codeply.com/go/7Fab8Thufl
// document ready
(function hideSaleNavbar ($) {
  let previousScroll = 20
  // scroll functions
  $(window).scroll(function (e) {
    // add/remove classes to navbar when scrolling to hide/show
    const scroll = $(window).scrollTop()
    if (scroll >= previousScroll) {
      $('.navbar-show').addClass('navbar-hide')
      $('.navbar-show').addClass('d-none')
    } else {
      $('.navbar-show').removeClass('navbar-hide')
      $('.navbar-show').removeClass('d-none')
    }
    previousScroll = scroll
  })
})(jQuery)

// 無輸入關鍵字時禁用搜尋按鈕
const searchButton = document.querySelector('#search-button')
const searchInput = document.querySelector('#search-input')
const searchButtonMobile = document.querySelector('#search-button-mobile')
const searchInputMobile = document.querySelector('#search-input-mobile')

console.log('Reloaded')

searchInput.onchange = () => {
  if (searchInput.value !== '') {
    searchButton.disabled = false
  } else {
    searchButton.disabled = true
  }
}
searchInputMobile.onchange = () => {
  if (searchInputMobile.value !== '') {
    searchButtonMobile.disabled = false
  } else {
    searchButtonMobile.disabled = true
  }
}

// 網址有hashtag時，顯示購物車互動視窗
document.addEventListener('DOMContentLoaded', () => {
  // 因為後端有在網址加hashtag，加入購物車或登入導回頁面後會顯示購物車的modal
  if (window.location.hash === '#cart') {
    $('#cartModal').modal()
  }
})
