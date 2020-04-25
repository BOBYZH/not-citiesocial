const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController.js')
const productController = require('../controllers/productController.js')
const cartController = require('../controllers/cartController.js')
// const passport = require('passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const unAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
  return req.flash('error_messages', '已登入')
}
// const authenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next()
//   }
//   res.redirect('/signin')
// }

const authenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) { return next() }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

module.exports = (app, passport) => {
  // 訪客
  // 首頁
  app.get('/', productController.getIndex)
  // 個別商品
  app.get('/products/:id', productController.getProduct)
  // 購物車
  app.get('/cart', cartController.getCart)
  app.post('/cart', cartController.postCart)

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

  // 顧客

  // 店家
  // 管理首頁（指向商品管理）
  app.get('/admin', (req, res) => {
    res.redirect('/admin/products')
  })
  // 商品管理
  app.get('/admin/products', authenticatedAdmin, adminController.getProducts)
  // 新增商品
  app.get('/admin/products/create', authenticatedAdmin, adminController.createProduct)
  app.post('/admin/products', authenticatedAdmin, upload.single('image'), adminController.postProduct)
  // 編輯商品
  app.get('/admin/products/:id/edit', authenticatedAdmin, adminController.editProduct)
  app.put('/admin/products/:id', authenticatedAdmin, upload.single('image'), adminController.putProduct)
  // 刪除商品
  app.delete('/admin/products/:id', authenticatedAdmin, adminController.deleteProduct)
  // 上架商品
  app.put('/admin/products/:id/sell', authenticatedAdmin, adminController.sellProduct)
  // 下架商品
  app.put('/admin/products/:id/cancel', authenticatedAdmin, adminController.cancelProduct)
  // 避免404當掉
  app.all('*', productController.redirectInvalidUrl)
}
