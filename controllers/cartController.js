const db = require('../models')
const Cart = db.Cart
const CartItem = db.CartItem
const Product = db.Product
const User = db.User
const helpers = require('../helpers')

const cartController = {
  getCart: (req, res) => {
    return Cart.findByPk(helpers.sessionCartId(req), { include: ['items', { model: CartItem, include: [{ model: Product, include: [User] }] }] }).then(cart => {
      cart = cart || { items: [] } // 找不到購物車的話，回傳空的內容
      const totalPrice = cart.items.length > 0 ? cart.items.map(d => d.price * d.CartItem.quantity).reduce((a, b) => a + b) : 0
      const inCartPage = true
      return res.render('cart', JSON.parse(JSON.stringify({
        cart, totalPrice, inCartPage
      })))
    })
  },

  postCart: (req, res) => {
    return Cart.findOrCreate({ // 找尋對應的購物車id，有的話使用，沒有的話新增一個來用
      where: {
        id: helpers.sessionCartId(req) || 0
      }
    }).spread(function (cart, created) {
      return CartItem.findOrCreate({ // 找尋對應的商品id，有的話使用，沒有的話新增一個來用
        where: {
          CartId: cart.id,
          ProductId: helpers.productId(req)
        },
        default: {
          CartId: cart.id,
          ProductId: helpers.productId(req)
        }
      }).spread(function (cartItem, created) {
        const postResults = []
        postResults.push(
        // 用async ... await包裝到陣列，以使用Promise.all
          (async function () {
            await cartItem.update({
              quantity: (cartItem.quantity || 0) + Number(helpers.setQuantity(req)) // html表單回傳的數字會被JS當字串，須轉換否則變文字相加
            })
          })()
        )
        // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
        return Promise.all(postResults).then((cartItem) => {
          req.session.cartId = cart.id
          return req.session.save(() => {
            return res.redirect(`/products/${helpers.productId(req)}#cart`)
          })
        })
      })
    })
  },

  addCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      if (Number(cartItem.CartId) !== Number(req.session.cartId)) { // 防止對其他人的購物車非法操作
        req.flash('error_messages', '只能操作目前的購物車！')
        res.redirect('/cart')
      } else {
        cartItem.update({
          quantity: cartItem.quantity + 1
        })
          .then((cartItem) => {
            return res.redirect('back')
          })
      }
    })
  },
  subCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      if (Number(cartItem.CartId) !== Number(req.session.cartId)) { // 防止對其他人的購物車非法操作
        req.flash('error_messages', '只能操作目前的購物車！')
        res.redirect('/cart')
      } else {
        cartItem.update({
          quantity: cartItem.quantity - 1 >= 1 ? cartItem.quantity - 1 : 1
        })
          .then((cartItem) => {
            return res.redirect('back')
          })
      }
    })
  },
  deleteCartItem: (req, res) => {
    CartItem.findByPk(req.params.id).then(cartItem => {
      if (Number(cartItem.CartId) !== Number(req.session.cartId)) { // 防止對其他人的購物車非法操作
        req.flash('error_messages', '只能操作目前的購物車！')
        res.redirect('/cart')
      } else {
        const destroyedResults = []
        destroyedResults.push(
        // 用async ... await包裝到陣列，以使用Promise.all
          (async function () {
            await cartItem.destroy()
          })()
        )
        // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
        return Promise.all(destroyedResults).then((cartItem) => {
        // 只在購物車頁面不顯示互動視窗
          if (req.headers.referer.includes('/cart')) {
            return res.redirect('back')
          } else {
            return res.redirect(`${req.headers.referer}#cart`)
          }
        })
          .catch((cartItem) => {
            req.flash('error_messages', '刪除項目時出現錯誤，請稍後再試......')
            return res.redirect('back')
          })
      }
    })
  }
}

module.exports = cartController
