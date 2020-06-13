// 參考：https://cythilya.github.io/2015/08/19/node-nodemailer/

// 設定nodemailer，與寄件者服務、帳密
const nodemailer = require('nodemailer')
module.exports = function () {
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

  return {
    send: function (to, subj, body, bcc) { // bcc即密件副本，無需要可不填
      transporter.sendMail({
        // 信件資訊
        from: process.env.ADDRESS,
        to: to,
        bcc: bcc,
        subject: subj,
        html: body
      }, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Mail, from ', process.env.ADDRESS, ' to ', to)
          if (bcc) {
            console.log('bcc:', bcc)
          }
          console.log('Email sent: ' + info.response)
        }
      })
    }
  }
}
