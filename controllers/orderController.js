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

// 設定交易資料的加密與雜湊
const crypto = require('crypto')
// 本地測試時使用ngork產生的domain，並用來替換瀏覽器網址列的'http://localhost:3000'
const URL = 'https://23c49a92.ngrok.io'
const MerchantID = process.env.MERCHANT_ID
const HashKey = process.env.HASHKEY
const HashIV = process.env.HASHIV
const PayGateWay = 'https://ccore.newebpay.com/MPG/mpg_gateway'
const ReturnURL = URL + '/newebpay/callback?from=ReturnURL'
const NotifyURL = URL + '/newebpay/callback?from=NotifyURL'
const ClientBackURL = URL + '/orders'

function genDataChain (TradeInfo) {
  const results = []
  for (const kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`)
  }
  return results.join('&')
}

function createMpgAesEncrypt (TradeInfo) {
  const encrypt = crypto.createCipheriv('aes256', HashKey, HashIV)
  const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex')
  return enc + encrypt.final('hex')
}

function createMpgShaEncrypt (TradeInfo) {
  const sha = crypto.createHash('sha256')
  const plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`

  return sha.update(plainText).digest('hex').toUpperCase()
}

function getTradeInfo (Amt, Desc, email) {
  console.log('===== getTradeInfo =====')
  console.log(Amt, Desc, email)
  console.log('==========')

  const data = {
    MerchantID: MerchantID, // 商店代號
    RespondType: 'JSON', // 回傳格式
    TimeStamp: Date.now(), // 時間戳記
    Version: 1.5, // 串接程式版本
    MerchantOrderNo: Date.now(), // 商店訂單編號
    LoginType: 0, // 智付通會員
    OrderComment: 'OrderComment', // 商店備註
    Amt: Amt, // 訂單金額
    ItemDesc: Desc, // 產品名稱
    Email: email, // 付款人電子信箱
    ReturnURL: ReturnURL, // 支付完成返回商店網址
    NotifyURL: NotifyURL, // 支付通知網址/每期授權結果通知
    ClientBackURL: ClientBackURL // 支付取消返回商店網址
  }

  console.log('===== getTradeInfo: data =====')
  console.log(data)

  const mpgAesEncrypt = createMpgAesEncrypt(data)
  const mpgShaEncrypt = createMpgShaEncrypt(mpgAesEncrypt)

  console.log('===== getTradeInfo: mpgAesEncrypt, mpgShaEncrypt =====')
  console.log(mpgAesEncrypt)
  console.log(mpgShaEncrypt)

  const tradeInfo = {
    MerchantID: MerchantID, // 商店代號
    TradeInfo: mpgAesEncrypt, // 加密後參數
    TradeSha: mpgShaEncrypt,
    Version: 1.5, // 串接程式版本
    PayGateWay: PayGateWay,
    MerchantOrderNo: data.MerchantOrderNo
  }

  console.log('===== getTradeInfo: tradeInfo =====')
  console.log(tradeInfo)

  return tradeInfo
}

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
        console.log('Mail, from ', process.env.ADDRESS, ' to ', order.email)

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
  },

  getPayment: (req, res) => {
    console.log('===== getPayment =====')
    console.log(req.params.id)
    console.log('==========')

    return Order.findByPk(req.params.id, {}).then(order => {
      const tradeInfo = getTradeInfo(order.amount, '產品名稱', order.email)
      return res.render('payment', JSON.parse(JSON.stringify({ order, tradeInfo })))
    })
  },

  newebpayCallback: (req, res) => {
    console.log('===== newebpayCallback =====')
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    console.log('==========')

    return res.redirect('/orders')
  }
}

module.exports = orderController
