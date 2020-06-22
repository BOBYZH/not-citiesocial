const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController.js')
const productController = require('../controllers/productController.js')
const cartController = require('../controllers/cartController.js')
const orderController = require('../controllers/orderController.js')
const subscriberController = require('../controllers/subscriberController.js')

const helpers = require('../helpers')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  const unAuthenticated = (req, res, next) => {
    if (!helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/')
    return req.flash('error_messages', '已登入')
  }

  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }

  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).isAdmin) { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  // 訪客
  // 首頁
  app.get('/', productController.getIndex)
  // 分類篩選商品頁面
  app.get('/products', productController.getProducts)
  // 個別商品頁面
  app.get('/products/:id', productController.getProduct)

  // 電子報
  // 訂閱電子報
  app.post('/subscriber', subscriberController.subscribe)
  // 退訂電子報
  app.delete('/subscriber', subscriberController.unsubscribe)

  // 購物車
  // 購物車內容
  app.get('/cart', cartController.getCart)
  // 新增商品
  app.post('/cart', cartController.postCart)
  // 增加數量
  app.post('/cartItem/:id/add', cartController.addCartItem)
  // 減少數量
  app.post('/cartItem/:id/sub', cartController.subCartItem)
  // 移除商品
  app.delete('/cartItem/:id', cartController.deleteCartItem)

  // 帳戶
  // 登入頁面
  app.get('/signin', unAuthenticated, userController.signInPage)
  // 登入
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signIn)
  // 註冊頁面
  app.get('/signup', userController.signUpPage)
  // 註冊
  app.post('/signup', userController.signUp)
  // 登出
  app.get('/logout', userController.logOut)
  // OAuth
  // Facebook
  app.get(
    '/auth/facebook',
    passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
  )
  // callback
  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/signin'
    })
  )
  // 個人資料頁面
  app.get('/users/:id', authenticated, userController.getUser)
  // 編輯頁面
  app.get('/users/:id/edit', authenticated, userController.editUser)
  // 編輯資料
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

  // 顧客

  // 訂單
  // 訂單頁面
  app.get('/orders', authenticated, orderController.getOrders)
  // 新增訂單
  app.post('/order', authenticated, orderController.postOrder)
  // 取消訂單
  app.post('/order/:id/cancel', authenticated, orderController.cancelOrder)
  // 付款頁面(交易前)
  app.get('/order/:id/payment', authenticated, orderController.getPayment)
  // 確認交易頁面(交易後)
  app.post('/orders', authenticated, orderController.checkOrder)
  // 確認交易資料(交易後)
  app.post('/newebpay/callback', orderController.newebpayCallback)

  // 店家
  // 管理首頁（指向商品管理）
  app.get('/admin', authenticatedAdmin, (req, res) => {
    res.redirect('/admin/products')
  })

  // 商品項目管理頁面
  app.get('/admin/products', authenticatedAdmin, adminController.getProducts)
  // 上架商品
  app.put('/admin/products/:id/sell', authenticatedAdmin, adminController.sellProduct)
  // 下架商品
  app.put('/admin/products/:id/cancel', authenticatedAdmin, adminController.cancelProduct)
  // 上架所有商品
  app.put('/admin/products/sellAll', authenticatedAdmin, adminController.sellAllProducts)
  // 下架所有商品
  app.put('/admin/products/cancelAll', authenticatedAdmin, adminController.cancelAllProducts)

  // 新增商品
  app.get('/admin/products/create', authenticatedAdmin, adminController.createProduct)
  app.post('/admin/products', authenticatedAdmin, upload.single('image'), adminController.postProduct)
  // 編輯商品
  app.get('/admin/products/:id/edit', authenticatedAdmin, adminController.editProduct)
  app.put('/admin/products/:id', authenticatedAdmin, upload.single('image'), adminController.putProduct)
  // 刪除商品
  app.delete('/admin/products/:id', authenticatedAdmin, adminController.deleteProduct)

  // 商品訂單管理頁面
  app.get('/admin/orderItems', authenticatedAdmin, adminController.getOrderItems)
  // 標注為已寄送
  app.post('/admin/orderItems/:id/confirm', authenticatedAdmin, adminController.confirmOrderItem)

  // 避免404當掉
  app.all('*', productController.redirectInvalidUrl)
}
