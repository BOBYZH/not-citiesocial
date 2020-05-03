const db = require('../models')
const User = db.User
const bcrypt = require('bcryptjs')

const userController = {
  signInPage: (req, res) => {
    /* 因為沒有載入其他model（？），
    無法和其他有提供變數的controller一樣，直接從app.js取得res.locals.categories，
    便在這邊局部加載 */
    const Category = db.CategoryLv1
    Category.findAll().then(categories => {
      return res.render('signIn', JSON.parse(JSON.stringify(categories)))
    })
  },

  signIn: (req, res) => {
    // req.flash('success_messages', '登入成功')
    return res.redirect(`/users/${req.user.id}`)
  },

  signUpPage: (req, res) => {
    /* 因為沒有載入其他model（？），
    無法和其他有提供變數的controller一樣，直接從app.js取得res.locals.categories，
    便在這邊局部加載 */
    const Category = db.CategoryLv1
    Category.findAll().then(categories => {
      return res.render('signUp', JSON.parse(JSON.stringify(categories)))
    })
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
    // req.flash('success_messages', '登出成功')
    req.logout()
    res.redirect('/')
  },

  getUser: (req, res) => {
    if (Number(req.params.id) !== req.user.id) { // 防止進入他人資料頁面瀏覽資料
      req.flash('error_messages', '只能看自己的頁面！')
      res.redirect(`/users/${req.user.id}`)
    } else {
      return User.findByPk(req.params.id).then(user => {
        return res.render('profile', JSON.parse(JSON.stringify({ profile: user })))
      })
    }
  },

  editUser: (req, res) => {
    if (Number(req.params.id) !== req.user.id) { // 防止進入他人修改頁面偷改資料
      req.flash('error_messages', '只能改自己的頁面！')
      res.redirect(`/users/${req.user.id}/edit`)
    } else {
      return User.findByPk(req.params.id).then(user => {
        return res.render('editProfile', JSON.parse(JSON.stringify({ user })))
      })
    }
  },

  putUser: (req, res) => {
    console.log('putUser', req.body)
    if (!req.body.firstName) {
      req.flash('error_messages', '沒有填寫名字！')
      return res.redirect('back')
    }

    return User.findByPk(req.params.id).then(user => {
      if (!req.body.isAdmin) {
        user
          .update({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            defaultPhone: req.body.defaultPhone || null,
            defaultAddress: req.body.defaultAddress || null,
            isAdmin: 0,
            shopName: req.body.shopName
          })
          .then((user) => {
            req.flash(
              'success_messages',
              '你的個人資料已更新！'
            )
            res.redirect('back')
          })
          .catch((user) => {
            req.flash('error_messages', '發生錯誤，請稍後再嘗試')
          })
      } else {
        user
          .update({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            defaultPhone: req.body.defaultPhone || null,
            defaultAddress: req.body.defaultAddress || null,
            isAdmin: 1,
            shopName: req.body.shopName
          })
          .then((user) => {
            req.flash(
              'success_messages',
              '你的個人資料已更新！'
            )
            res.redirect('back')
          })
          .catch((user) => {
            req.flash('error_messages', '發生錯誤，請稍後再嘗試')
          })
      }
    })
  }
}

module.exports = userController
