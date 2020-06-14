const db = require('../models')
const Subscriber = db.Subscriber

// 載入寄送郵件相關設定
const emailService = require('../config/email.js')()

const subscriberController = {
  subscribe: (req, res) => {
    Subscriber.findOne({ where: { email: req.body.email } }).then(subscriber => {
      if (subscriber) {
        req.flash('error_messages', `"${req.body.email}" 此email已經註冊`)
        return res.redirect('back')
      } else {
        Subscriber.create({
          email: req.body.email
        }).then(subscriber => {
          // 使用模板發信
          res.render('emails/confirmSubscription', JSON.parse(JSON.stringify({
            layout: null,
            url: process.env.WEBSITE_URL,
            email: req.body.email
          })), function (err, html) {
            if (err) {
              console.log('Error in email template!')
            }
            emailService.send(req.body.email,
              'not citiesocial Sales: 您的訂閱已被確認',
              html)
          })

          req.flash('success_messages', '您的訂閱已被確認，謝謝您的訂閱')
          return res.redirect('back')
        })
      }
    })
  },

  unsubscribe: (req, res) => {
    Subscriber.findOne({ where: { email: req.body.email } }).then(subscriber => {
      if (!subscriber) {
        req.flash('error_messages', `"${req.body.email}"尚未訂閱！`)
        return res.redirect('/')
      } else {
        subscriber.destroy()
          .then((subscriber) => {
            req.flash('success_messages', `${subscriber.email}，您已經成功取消訂閱`)
            return res.redirect('/')
          })
      }
    })
  }
}

module.exports = subscriberController
