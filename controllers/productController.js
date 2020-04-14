const db = require('../models')
const Product = db.Product
// const Category = db.Category
// const User = db.User
const PAGE_LIMIT = 3
const PAGE_OFFSET = 0

const productController = {
  redirectInvalidUrl: (req, res) => { // 防止亂打網址出現404錯誤
    res.redirect('/')
  },

  getProducts: (req, res) => {
    Product.findAndCountAll({ offset: PAGE_OFFSET, limit: PAGE_LIMIT }).then(products => {
      return res.render('products', JSON.parse(JSON.stringify({
        products
      })))
    })
  },

  getProduct: (req, res) => {
    Product.findByPk(req.params.id, {
      include: [
        // Category
      ]
    }).then(product => {
      if (product === null) {
        req.flash('error_messages', '無此商品！')
        res.redirect('/')
      } else {
        return res.render('product', JSON.parse(JSON.stringify({
          product
        })))
      }
    })
    // .catch((product) => {
    //   req.flash('error_messages', '系統錯誤！')
    //   res.redirect('/')
    // })
  }
}

module.exports = productController
