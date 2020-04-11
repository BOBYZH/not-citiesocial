const userController = require('../controllers/userController')
const productController = require('../controllers/productController.js')
const cartController = require('../controllers/cartController.js')

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
  // 首頁
  app.get('/', function (req, res, next) {
    res.render('index', { title: 'Not citiesocial' })
  })

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

  // 所有商品（測試）
  app.get('/products', authenticatedAdmin, productController.getProducts)
  // 購物車（測試）
  app.get('/cart', cartController.getCart)

  // 避免404當掉
  app.all('*', productController.redirectInvalidUrl)
}
