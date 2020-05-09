const db = require('../models')
const Cart = db.Cart
const CartItem = db.CartItem
// const PAGE_LIMIT = 10
// const PAGE_OFFSET = 0

const cartController = {
  getCart: (req, res) => {
    return Cart.findByPk(req.session.cartId, { include: 'items' }).then(cart => {
      cart = cart || { items: [] } // 找不到購物車的話，回傳空的內容
      const totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0
      const inCartPage = true
      const Category = db.CategoryLv1
        return res.render('cart', JSON.parse(JSON.stringify({
          cart, totalPrice, inCartPage
        })))
    })
  },

  postCart: (req, res) => {
    return Cart.findOrCreate({ // 找尋對應的購物車id，有的話使用，沒有的話新增一個來用
      where: {
        id: req.session.cartId || 0
      }
    }).spread(function (cart, created) {
      return CartItem.findOrCreate({ // 找尋對應的商品id，有的話使用，沒有的話新增一個來用
        where: {
          CartId: cart.id,
          ProductId: req.body.productId
        },
        default: {
          CartId: cart.id,
          ProductId: req.body.productId
        }
      }).spread(function (cartItem, created) {
        return cartItem.update({
          quantity: (cartItem.quantity || 0) + Number(req.body.quantity) // html表單回傳的數字會被js當文字，須轉換否則變文字相加
        })
          .then((cartItem) => { // 應該要用Promise，讓項目處理完後才顯示頁面
            req.session.cartId = cart.id
            return req.session.save(() => {
              setTimeout( // 避免資料庫寫入未完成時，顯示改到一半的資訊？
                () => {
                  return res.redirect(`/products/${req.body.productId}#cart`)
                }, 1500
              )
            })
          })
      })
    })
  },

  addCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.update({
        quantity: cartItem.quantity + 1
      })
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  },
  subCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.update({
        quantity: cartItem.quantity - 1 >= 1 ? cartItem.quantity - 1 : 1
      })
        .then((cartItem) => {
          return res.redirect('back')
        })
    })
  },
  deleteCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => { // 應該要用Promise，讓項目處理完後才顯示頁面
      cartItem.destroy()
        .then((cartItem) => {
          setTimeout( // 避免資料庫寫入未完成時，顯示改到一半的資訊？
            () => {
              return res.redirect('back')
            }, 1500
          )
        })
        .catch((cartItem) => {
          req.flash('error_messages', '刪除項目時出現錯誤，請稍後再試......')
          return res.redirect('back')
        })
    })
  }
}

module.exports = cartController
