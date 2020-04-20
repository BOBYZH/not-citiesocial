const db = require('../models')
const Product = db.Product
// const Category = db.Category
// const User = db.User

// 設定顯示數量
let PAGE_LIMIT, PAGE_OFFSET

const productController = {
  // 防止亂打網址出現404錯誤
  redirectInvalidUrl: (req, res) => {
    res.redirect('/')
  },

  // 前台瀏覽
  getIndex: (req, res) => {
    PAGE_LIMIT = 5
    PAGE_OFFSET = 0
    Product.findAndCountAll({ offset: PAGE_OFFSET, limit: PAGE_LIMIT }).then(products => {
      const Products = products.rows
        .map(product => (
          {
            ...product.dataValues,
            name: product.dataValues.name !== null ? (product.dataValues.name.length > 18 ? (product.dataValues.name.substring(0, 18) + '...') : product.dataValues.name) : ''
          }
        ))
      console.log(products.rows[0].name)
      return res.render('index', JSON.parse(JSON.stringify({
        products: Products
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
      .catch((product) => {
        req.flash('error_messages', '系統錯誤！')
        res.redirect('/')
      })
  }
}

module.exports = productController
