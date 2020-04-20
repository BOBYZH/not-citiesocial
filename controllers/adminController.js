const db = require('../models')
const Product = db.Product
// const User = db.User
// const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const inAdmin = true

const adminController = {
  // 後台管理
  getProducts: (req, res) => {
    Product.findAndCountAll().then(products => {
      const inProducts = true
      return res.render('admin/products', JSON.parse(JSON.stringify({
        products, inAdmin, inProducts
      })))
    })
  },

  createProduct: (req, res) => {
    const inProducts = true
    return res.render('admin/create', JSON.parse(JSON.stringify({
      inAdmin, inProducts
    })))
  },

  postProduct: (req, res) => {
    console.log(req.body, 'body')
    if (!req.body.name) {
      req.flash('error_messages', '沒填入產品名稱！')
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (_err, img) => {
        return Product.create({
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((product) => {
          req.flash('success_messages', '已成功新增商品')
          return res.redirect('/admin/products')
        }).catch((product) => {
          req.flash('error_messages', '發生錯誤，請稍後再試……')
        })
      })
    } else {
      return Product.create({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((product) => {
        req.flash('success_messages', '已成功新增商品')
        return res.redirect('/admin/products')
      }).catch((product) => {
        req.flash('error_messages', '發生錯誤，請稍後再試……')
      })
    }
  }
}

module.exports = adminController
