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
      return res.render('cart', JSON.parse(JSON.stringify({
        cart,
        totalPrice
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
          quantity: (cartItem.quantity || 0) + 1
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
  }
}

module.exports = cartController
