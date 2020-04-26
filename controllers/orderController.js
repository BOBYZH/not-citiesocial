const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Cart = db.Cart

// 設定nodemailer，與寄件者服務、帳密
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.ACCOUNT,
    clientId: process.env.CLINENTID,
    clientSecret: process.env.CLINENTSECRET,
    refreshToken: process.env.REFRESHTOKEN
  }
})
// console.log('processTest', process.env.GMAIL_ACCOUNT, process.env.GMAIL_PASSWORD)

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
        email: req.body.email,
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

        // 信件資訊
        const mailOptions = {
          from: process.env.GMAIL_ADDRESS,
          to: req.body.email,
          subject: `${order.name}，您的訂單（編號：${order.id}）已成立`,
          html: `    
                <div style="display: inline-block; min-width: 300px; background-color: white;">
                  <h1 style="margin-left: 30px;">您的訂單</h1>
                  <a href="${process.env.WEBSITE_URL}orders" 
                  style="margin-top: 5px;">
                    <h3>編號：${order.id}，請至訂單頁面確認並付款</h3>
                  </a>
                  <h3>交易時間：${new Date()}</h3>
                  <h3>總金額：${order.amount}</h3>
                </div>
                `
        }
        console.log('Mail, from ', process.env.ADDRESS, ' to ', req.body.email)

        // 確認所有商品加入訂單後才轉址
        return Promise.all(results).then(() => {
          // 待優化：刪除已經下訂單的購物車

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error)
            } else {
              console.log('Email sent: ' + info.response)
            }
          })

          res.redirect('/orders')
        })
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
