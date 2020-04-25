const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Cart = db.Cart

const orderController = {
  getOrders: (req, res) => {
    Order.findAll({ include: 'items' }).then(orders => {
      return res.render('orders', JSON.parse(JSON.stringify({
        orders
      })))
    })
  },

  postOrder: (req, res) => {
    return Cart.findByPk(req.body.cartId, { include: 'items' }).then(cart => {
      return Order.create({
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        shippingStatus: req.body.shippingStatus,
        paymentStatus: req.body.paymentStatus,
        amount: req.body.amount
      }).then(order => {
        // 插入購買商品清單
        const results = []
        for (let i = 0; i < cart.items.length; i++) {
          results.push(
            OrderItem.create({
              OrderId: order.id,
              ProductId: cart.items[i].id,
              price: cart.items[i].price,
              quantity: cart.items[i].CartItem.quantity
            })
          )
        }
        // 確認所有商品加入訂單後才轉址
        return Promise.all(results).then(() =>

        // 待優化：刪除已經下訂單的購物車

          res.redirect('/orders')
        )
      })
    })
  },

  cancelOrder: (req, res) => {
    return Order.findByPk(req.params.id, {}).then(order => {
      order.update({
        ...req.body,
        shippingStatus: '-1',
        paymentStatus: '-1'
      }).then(order => {
        return res.redirect('back')
      })
    })
  }
}

module.exports = orderController
