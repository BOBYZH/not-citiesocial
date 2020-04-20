const db = require('../models')
const Product = db.Product

const adminController = {
  // 後台管理
  getProducts: (req, res) => {
    Product.findAndCountAll().then(products => {
      const inAdmin = true
      const inProducts = true
      return res.render('admin/products', JSON.parse(JSON.stringify({
        products, inAdmin, inProducts
      })))
    })
  }
}

module.exports = adminController
