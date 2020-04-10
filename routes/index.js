const express = require('express')
const router = express.Router()
const passport = require('passport')
// const helpers = require('../_helpers')

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
//   if (helpers.ensureAuthenticated(req)) {
//     return next()
//   }
//   res.redirect('/signin')
// }
// const authenticatedAdmin = (req, res, next) => {
//   if (helpers.ensureAuthenticated(req)) {
//     if (req.user.role === 'admin') { return next() }
//     return res.redirect('/')
//   }
//   res.redirect('/signin')
// }

// 首頁
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

// 登入頁面
router.get('/signin', unAuthenticated, userController.signInPage)
// 登入
router.post('/signin', unAuthenticated, passport.authenticate('local', {
  failureRedirect: '/signin',
  failureFlash: true
}), userController.signIn)
// 註冊頁面
router.get('/signup', userController.signUpPage)
// 註冊
router.post('/signup', userController.signUp)
// 登出
router.get('/logout', userController.logOut)

// 所有商品（測試）
router.get('/products', productController.getProducts)
// 購物車（測試）
router.get('/cart', cartController.getCart)

// 避免404當掉
router.all('*', productController.redirectInvalidUrl) 

module.exports = router
