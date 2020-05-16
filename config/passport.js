const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')
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

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName', 'name']
  },
  (_accessToken, _refreshToken, profile, cb) => {
    User.findOne({
      where: { email: profile._json.email }
    }).then(user => {
      console.log('profile:', profile)
      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8)
        bcrypt.genSalt(10, (_err, salt) =>
          bcrypt.hash(randomPassword, salt, (_err, hash) => {
            const newUser = new User({
              firstName: profile._json.first_name,
              lastName: profile._json.last_name,
              email: profile._json.email,
              password: hash,
              isAdmin: 0
            })
            newUser.save().then(user => {
              return cb(null, user)
            }).catch(err => {
              console.log(err)
            })
          })
        )
      } else {
        return cb(null, user)
      }
    })
  })
)

passport.serializeUser((user, cb) => {
  cb(null, user.id) // cb 對應到官方文件裡的 cb, callback cb
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then((user) => {
    return cb(null, user.get()) // 使物件內容能夠顯示
  })
})

module.exports = passport
