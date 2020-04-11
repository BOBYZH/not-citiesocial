const db = require('../models')
const Product = db.Product
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
  }
}

module.exports = productController
