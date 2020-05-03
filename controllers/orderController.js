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
// 需在環境變數設置網址
const URL = process.env.WEBSITE_URL
const MerchantID = process.env.MERCHANT_ID
const HashKey = process.env.HASH_KEY
const HashIV = process.env.HASH_IV
const PayGateWay = 'https://ccore.newebpay.com/MPG/mpg_gateway' // 使用的是藍新金流測試平台

// 付款結束後，藍新會向ReturnURL的連結發post，讓顧客回到商店網站頁面
const ReturnURL = URL + '/orders'
// 付款結束後，藍新會向NotifyURL的連結發post，以告知商店伺服器交易結果
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

function createMpgAesDecrypt (TradeInfo) {
  const decrypt = crypto.createDecipheriv('aes256', HashKey, HashIV)
  decrypt.setAutoPadding(false)
  const text = decrypt.update(TradeInfo, 'hex', 'utf8')
  const plainText = text + decrypt.final('utf8')
  const result = plainText.replace(/[\x00-\x20]+/g, '')
  return result
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
    OrderComment: '無', // 商店備註
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
    Order.findAll({ include: 'items', where: { UserId: req.user.id } }).then(orders => {
      return res.render('orders', JSON.parse(JSON.stringify({
        orders
      })))
    })
  },

  postOrder: (req, res) => {
    return Cart.findByPk(req.body.cartId, { include: 'items' }).then(cart => {
      return Order.create({
        UserId: req.user.id || null,
        name: req.body.lastName + ' ' + req.body.firstName,
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
                  <h1>您在Not citiesocial的訂單</h1>
                  <a href="${process.env.WEBSITE_URL}/orders" 
                  style="margin-top: 5px;">
                    <h3>編號：${order.id}，請至訂單頁面確認</h3>
                  </a>
                  <h3>交易時間：${new Date()}</h3>
                  <h3>總金額：${order.amount}</h3>
                </div>
                `
        }
        console.log('Mail, from ', process.env.ADDRESS, ' to ', order.email)

        // 確認所有商品加入訂單後才轉址
        return Promise.all(results).then(() => {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error)
            } else {
              console.log('Email sent: ' + info.response)
            }
          })
          // 刪除已經下訂單的購物車
          cart.destroy()
            .then(() => {
              setTimeout( // 避免資料庫寫入未完成時，顯示改到一半的資訊
                () => {
                  res.redirect('/orders')
                }, 3000
              )
            })
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

  // 付款前
  getPayment: (req, res) => {
    console.log('===== getPayment =====')
    console.log(req.params.id)
    console.log('==========')

    return Order.findByPk(req.params.id, {}).then(order => {
      const tradeInfo = getTradeInfo(order.amount, '好東西', order.email)
      order.update({
        ...req.body,
        sn: tradeInfo.MerchantOrderNo
      }).then(order => {
        res.render('payment', JSON.parse(JSON.stringify({ order, tradeInfo })))
      })
    })
  },

  // 付款後
  // 藍新向NotifyURL的連結發post後執行的動作
  newebpayCallback: (req, res) => {
    // 會收到三次回傳結果，才能夠驗證交易有效
    console.log('===== newebpayCallback =====')
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    console.log('==========')

    console.log('===== newebpayCallback: TradeInfo =====')
    console.log(req.body.TradeInfo)

    const data = JSON.parse(createMpgAesDecrypt(req.body.TradeInfo))

    console.log('===== newebpayCallback: createMpgAesDecrypt, data =====')
    console.log(data)

    // 交易成功後更新訂單為已付款
    return Order.findAll({ where: { sn: data.Result.MerchantOrderNo } }).then(orders => {
      // console.log('test', data.Result.MerchantOrderNo)
      // console.log('test', orders)
      orders[0].update({
        ...req.body,
        paymentStatus: 1
      }).then(order => {
        res.sendStatus(200) // 向藍新回報已經確認交易，否則商家會收到「API 串接 Notify URL 觸發失敗通知信」
      })
    })
  },
  // 藍新向ReturnURL的連結發post後執行的動作
  checkOrder: (req, res) => {
    req.flash('success_messages', '已成功付款！')
    return res.redirect('/orders')
  }
}

module.exports = orderController
