const db = require('../models')
const Product = db.Product
const User = db.User
// const Category = db.Category

// 設定顯示數量，來自購物車教案
let PAGE_LIMIT, PAGE_OFFSET // 前者：最多顯示幾個商品, 後者：從id幾開始顯示

const productController = {
  // 防止亂打網址出現404錯誤
  redirectInvalidUrl: (req, res) => {
    res.redirect('/')
  },

  // 前台瀏覽
  getIndex: (req, res) => {
    PAGE_LIMIT = 20 // 數值大於等於總上架商品數量即可全部顯示
    PAGE_OFFSET = 0
    Product.findAndCountAll(
      { include: User, offset: PAGE_OFFSET, limit: PAGE_LIMIT, where: { forSale: true } } // forSale限制只能看到上架的商品
    ).then(products => {
      // console.log(products.rows[1].User.isAdmin)
      const Products = products.rows
        .filter(product => product.User.isAdmin === true) // 只顯示有營業店家的商品
        .map(product => (
          {
            ...product.dataValues,
            name: product.dataValues.name !== null ? (product.dataValues.name.length > 18 ? (product.dataValues.name.substring(0, 18) + '...') : product.dataValues.name) : ''
          }
        ))
      return res.render('index', JSON.parse(JSON.stringify({
        products: Products
      })))
    })
  },

  getProduct: (req, res) => {
    Product.findByPk(req.params.id, {
      include: [
        User
        // Category
      ]
    }).then(product => {
      // console.log(product.forSale)
      if (product === null) {
        req.flash('error_messages', '無此商品！')
        res.redirect('/')
      } else if (product.forSale === false || product.forSale === null) {
        req.flash('error_messages', '該商品尚未上架！')
        res.redirect('back')
      } else if (product.User.isAdmin === false) {
        req.flash('error_messages', '商店停業中！')
        res.redirect('back')
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
