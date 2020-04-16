const db = require('../models')
const User = db.User
const bcrypt = require('bcryptjs')

const userController = {
  signInPage: (req, res) => {
    return res.render('signIn')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '登入成功')
    return res.redirect('/')
  },

  signUpPage: (req, res) => {
    return res.render('signUp')
  },

  signUp: (req, res) => {
    if (req.body.password !== req.body.password2) {
      req.flash('error_messages', '密碼輸入不相同')
      return res.redirect('back')
    }
    User.findOne({ where: { email: req.body.email } }).then(user => {
      if (user) {
        req.flash('error_messages', '信箱已註冊帳號')
        return res.redirect('back')
      } else {
        User.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10),
          isAdmin: 0
        }).then(user => {
          req.flash('success_messages', '成功註冊')
          return res.redirect('/signin')
        })
      }
    })
  },

  logOut: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logout()
    res.redirect('/')
  }
}

module.exports = userController
