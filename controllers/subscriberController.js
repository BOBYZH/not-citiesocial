const db = require('../models')
const Subscriber = db.Subscriber

// 設定nodemailer，與寄件者服務、帳密
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.ACCOUNT,
    clientId: process.env.CLINENTID,
    clientSecret: process.env.CLINENTSECRET,
    refreshToken: process.env.REFRESHTOKEN
  }
})

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
          // 信件資訊
          const mailOptions = {
            from: process.env.GMAIL_ADDRESS,
            to: req.body.email,
            subject: 'not citiesocial Sales: 您的訂閱已被確認',
            html: `                
                  <div>
                    <h5>
                      您的訂閱需求已被確認，以下註冊資訊供您留存：
                    </h5>
                    <h6>Email: ${req.body.email}</h6>
                    <p>
                      註：因為本站只是示範專案，未來並不會真的寄送電子報！
                    </p>
                    <br/>
                    <p>若您希望停止接收我們的電子郵件，您可以:</p>                    
                    <a href="${process.env.WEBSITE_URL}/unsubscribe?email=${req.body.email}">請按這裡取消訂閱</a>
                  </div>
                `
          }
          console.log('Mail, from ', process.env.ADDRESS, ' to ', req.body.email)
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error)
            } else {
              console.log('Email sent: ' + info.response)
            }
          })

          req.flash('success_messages', '您的訂閱已被確認，謝謝您的訂閱')
          return res.redirect('back')
        })
      }
    })
  },

  unsubscribePage: (req, res) => {
    const inUnsubscribePage = true
    return res.render('unsubscribe', JSON.parse(JSON.stringify({ inUnsubscribePage })))
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
