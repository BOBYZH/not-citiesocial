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
      /* 因為Cart.findByPk的查詢條件包含req.session的值（？），
    無法和其他有提供變數的controller一樣，直接從app.js取得res.locals.categories，
    便在這邊局部加載 */
      const Category = db.CategoryLv1
      Category.findAll().then(categories => {
        return res.render('cart', JSON.parse(JSON.stringify({
          cart, totalPrice, categories
        })))
      })
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
          .then((cartItem) => {
            req.session.cartId = cart.id
            return req.session.save(() => {
              req.flash('success_messages', '已加入購物車！')
              return res.redirect('back')
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
    CartItem.findByPk(req.params.id).then(cartItem => {
      cartItem.destroy()
        .then((cartItem) => {
          req.flash('success_messages', '已刪除項目！')
          return res.redirect('back')
        })
        .catch((cartItem) => {
          req.flash('error_messages', '刪除項目時出現錯誤，請稍後再試......')
          return res.redirect('back')
        })
    })
  }
}

module.exports = cartController
