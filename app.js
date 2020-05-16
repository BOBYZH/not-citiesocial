// const createError = require('http-errors')
const express = require('express')
// 判別開發環境，這行放最前面才能運作
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')
const app = express()

// 設定 view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('.hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// 設定 session
app.use(session({
  secret: 'secret',
  cookie: { maxAge: 86400000 }, // 延長到一天， 以免用到一半被登出
  resave: false,
  saveUninitialized: false
}))
app.use(flash())

// 設定 passport
app.use(passport.initialize())
app.use(passport.session())

// 使用完整RESTful 動詞
app.use(methodOverride('_method'))

// 把資料放到res.locals裡面，在所有連結都可以使用
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user

  next()
})

app.use((req, res, next) => {
  const db = require('./models')
  const Category = db.CategoryLv1

  // 後台管理頁面不載入Category資料以節省資源
  if (req.url.includes('admin')) {
    return next()
  }

  Category.findAll().then(categories => {
    res.locals.categories = JSON.parse(JSON.stringify(categories))
    next()
  })
})

app.use((req, res, next) => {
  const db = require('./models')
  const Cart = db.Cart
  const CartItem = db.CartItem
  const Product = db.Product
  const User = db.User

  Cart.findByPk(req.session.cartId, { include: [{ model: CartItem, include: [{ model: Product, include: [User] }] }] }).then(cart => {
    cart = cart || { CartItems: [] } // 找不到購物車的話，回傳空的內容
    const totalPrice = cart.CartItems.length > 0 ? cart.CartItems.map(d => d.Product.price * d.quantity).reduce((a, b) => a + b) : 0
    const totalQuantity = cart.CartItems.length > 0 ? cart.CartItems.map(d => d.quantity).reduce((a, b) => a + b) : 0
    const CartItems = cart.CartItems.map(CartItem => (
      {
        ...CartItem.dataValues,
        name: CartItem.dataValues.Product.name !== null ? (CartItem.dataValues.Product.name.length > 11 ? (CartItem.dataValues.Product.name.substring(0, 11) + '...') : CartItem.dataValues.Product.name) : ''
      }
    ))
    res.locals.cart = JSON.parse(JSON.stringify(cart))
    res.locals.totalPrice = JSON.parse(JSON.stringify(totalPrice))
    res.locals.totalQuantity = JSON.parse(JSON.stringify(totalQuantity))
    res.locals.CartItems = JSON.parse(JSON.stringify(CartItems))
    next()
  })
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

require('./routes')(app, passport) // 把 passport 傳入 routes

module.exports = app
