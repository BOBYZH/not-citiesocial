const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy(
  // 客製化選項
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // 登入認證，cb = 官方文件的done
  (req, username, password, cb) => {
    User.findOne({ where: { email: username } }).then(user => {
      if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
      if (!bcrypt.compareSync(password, user.password)) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
      return cb(null, user)
    })
  }
))

passport.serializeUser((user, cb) => {
  cb(null, user.id) // cb 對應到官方文件裡的 done, callback done
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then((user) => {
    return cb(null, user.get()) // 使物件內容能夠顯示
  })
})

module.exports = passport
