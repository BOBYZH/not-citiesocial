const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Cart = db.Cart
const CartItem = db.CartItem
const Product = db.Product
const User = db.User
const helpers = require('../helpers')

// 載入寄送郵件相關設定
const emailService = require('../config/email.js')()

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
    const inProfile = true
    const sort = req.query.sort
    let orderCounts = ''

    Order.findAll({ include: [{ model: OrderItem, include: [{ model: Product, include: [User] }] }], where: { UserId: helpers.getUser(req).id } }).then(orders => {
      switch (sort) {
        case 'amountDesc':
          orders = orders.sort((a, b) => b.amount - a.amount)
          break
        case 'amountAsc':
          orders = orders.sort((a, b) => a.amount - b.amount)
          break
        case 'paymentStatusDesc':
          orders = orders.sort((a, b) => b.paymentStatus - a.paymentStatus)
          break
        case 'paymentStatusAsc':
          orders = orders.sort((a, b) => a.paymentStatus - b.paymentStatus)
          break
        case 'updatedAtAsc':
          orders = orders.sort((a, b) => a.updatedAt - b.updatedAt)
          break
        default:
          orders = orders.sort((a, b) => b.updatedAt - a.updatedAt)
      }
      orderCounts = orders.length
      return res.render('orders', JSON.parse(JSON.stringify({
        orders, inProfile, sort, orderCounts
      })))
    })
  },

  postOrder: (req, res) => {
    return Cart.findByPk(helpers.cartId(req), { include: 'items' }).then(cart => {
      return Order.create({
        UserId: helpers.getUser(req).id || null,
        name: req.body.lastName + ' ' + req.body.firstName,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
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
              quantity: cart.items[i].CartItem.quantity,
              subtotal: (cart.items[i].price) * (cart.items[i].CartItem.quantity),
              shippingStatus: 0
            })
          )
        }

        // 確認所有商品加入訂單後才轉址
        return Promise.all(results).then(() => {
          // 使用模板發信
          res.render('emails/buildOrder', JSON.parse(JSON.stringify({
            layout: null,
            url: process.env.WEBSITE_URL,
            order
          })), function (err, html) {
            if (err) {
              console.log('Error in email template!')
            }
            emailService.send(req.body.email,
              `${order.name}，您的訂單（id：${order.id}）已成立，請盡快付款`,
              html)
          })
          // 刪除已經下訂單的購物車項目與購物車本身
          CartItem.findAll({ where: { CartId: cart.id } }).then(cartItems => {
            // 包裝到陣列，以使用Promise.all
            const destroyedResults = cartItems.map(cartItem => {
              cartItem.destroy()
            })
            // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
            return Promise.all(destroyedResults).then(() => {
              cart.destroy().then(() => {
                res.redirect('/orders')
              })
            })
          })
        })
      })
    })
  },

  cancelOrder: (req, res) => {
    return Order.findByPk(req.params.id).then(order => {
      if (order.UserId !== helpers.getUser(req).id) { // 防止對他人的訂單擅自操作
        req.flash('error_messages', '只能取消自己的訂單！')
        res.redirect('/orders')
      } else {
        const canceledResults = []
        canceledResults.push(
          // 用async ... await包裝到陣列，以使用Promise.all
          (async function () {
            await order.update({
              ...req.body,
              paymentStatus: '-1'
            })
          })()
        )
        // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
        return Promise.all(canceledResults).then(order => {
          return res.redirect('back')
        })
      }
    })
  },

  // 付款前
  getPayment: (req, res) => {
    console.log('===== getPayment =====')
    console.log(helpers.paramsId(req))
    console.log('==========')

    return Order.findByPk(req.params.id, { include: 'items' }).then(order => {
      if (order.UserId !== helpers.getUser(req).id) { // 防止對他人的訂單擅自操作
        req.flash('error_messages', '只能替自己的訂單付款！')
        res.redirect('/orders')
      } else {
        const tradeInfo = getTradeInfo(order.amount, '好東西', order.email)
        order.update({
          ...req.body,
          sn: tradeInfo.MerchantOrderNo
        }).then(order => {
          res.render('payment', JSON.parse(JSON.stringify({ order, tradeInfo })))
        })
      }
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
    return Order.findOne({ where: { sn: data.Result.MerchantOrderNo }, include: [{ model: OrderItem, include: [{ model: Product, include: [User] }] }] }).then(order => {
      order.update({
        ...req.body,
        paymentStatus: 1
      }).then(order => {
        order.OrderItems.forEach(OrderItem => {
          // 使用模板發信
          res.render('emails/payOrder', JSON.parse(JSON.stringify({
            layout: null,
            url: process.env.WEBSITE_URL,
            order,
            OrderItem
          })), function (err, html) {
            if (err) {
              console.log('Error in email template!')
            }
            emailService.send(OrderItem.Product.User.email,
              `${OrderItem.Product.User.shopName}，${order.name}的訂單（id：${order.id}）已付款，請盡快配送商品`,
              html)
          })
        })
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
