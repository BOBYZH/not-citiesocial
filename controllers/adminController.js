const db = require('../models')
const Product = db.Product
// const User = db.User
// const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const inAdmin = true
const inProducts = true

const adminController = {
  // 後台管理
  getProducts: (req, res) => {
    Product.findAndCountAll({ where: { UserId: req.user.id } }).then(products => {
      return res.render('admin/products', JSON.parse(JSON.stringify({
        products, inAdmin, inProducts
      })))
    })
  },

  createProduct: (req, res) => {
    return res.render('admin/create', JSON.parse(JSON.stringify({
      inAdmin, inProducts
    })))
  },

  postProduct: (req, res) => {
    // console.log(req.body, 'body')
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
          // CategoryId: req.body.categoryId,
          UserId: req.user.id
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
        // CategoryId: req.body.categoryId,
        UserId: req.user.id
      }).then((product) => {
        req.flash('success_messages', '已成功新增商品')
        return res.redirect('/admin/products')
      }).catch((product) => {
        req.flash('error_messages', '發生錯誤，請稍後再試……')
      })
    }
  },

  editProduct: (req, res) => {
    Product.findByPk(req.params.id).then(product => {
      console.log(product.UserId, 'test')
      if (product.UserId !== req.user.id) { // 防止進入非自己店家商品頁面偷改資料
        req.flash('error_messages', '只能改自己的商品！')
        res.redirect('/admin/products')
      } else {
        return res.render('admin/create', JSON.parse(JSON.stringify({ product, inAdmin, inProducts })))
      }
    })
  },

  putProduct: (req, res) => {
    // console.log(req.body, 'body')
    Product.findByPk(req.params.id).then(product => {
      if (product.UserId !== req.user.id) { // 防止進入非自己店家商品頁面偷改資料
        req.flash('error_messages', '只能改自己的商品！')
        res.redirect('/admin/products')
      } else if (!req.body.name) {
        req.flash('error_messages', '沒填入產品名稱！')
        return res.redirect('back')
      } else {
        const { file } = req
        if (file) {
          imgur.setClientID(IMGUR_CLIENT_ID)
          imgur.upload(file.path, (_err, img) => {
            return Product.findByPk(req.params.id)
              .then((product) => {
                product.update({
                  name: req.body.name,
                  price: req.body.price,
                  description: req.body.description,
                  image: file ? img.data.link : product.image,
                  // CategoryId: req.body.categoryId,
                  UserId: req.user.id
                }).then((product) => {
                  req.flash('success_messages', '已成功修改商品')
                  return res.redirect('/admin/products')
                }).catch((product) => {
                  req.flash('error_messages', '發生錯誤，請稍後再試……')
                })
              })
          })
        } else {
          return Product.findByPk(req.params.id)
            .then((product) => {
              product.update({
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                image: product.image,
                // CategoryId: req.body.categoryId,
                UserId: req.user.id
              }).then((product) => {
                req.flash('success_messages', '已成功修改商品')
                return res.redirect('/admin/products')
              }).catch((product) => {
                req.flash('error_messages', '發生錯誤，請稍後再試……')
              })
            })
        }
      }
    })
  },

  deleteProduct: (req, res) => {
    return Product.findByPk(req.params.id)
      .then((product) => {
        if (product.UserId !== req.user.id) { // 防止偷刪非自己店家商品資料
          req.flash('error_messages', '只能刪除自己的商品！')
          res.redirect('/admin/products')
        } else {
          product.destroy()
            .then((product) => {
              req.flash('success_messages', '已成功刪除商品')
              return res.redirect('/admin/products')
            })
        }
      })
  },

  sellProduct: (req, res) => {
    return Product.findByPk(req.params.id)
      .then((product) => {
        if (product.UserId !== req.user.id) { // 防止偷刪非自己店家商品資料
          req.flash('error_messages', '只能上架自己的商品！')
          res.redirect('/admin/products')
        } else {
          product.update({
            forSale: true
          })
            .then((product) => {
              req.flash('success_messages', '已成功上架商品')
              return res.redirect('/admin/products')
            })
        }
      })
  },

  cancelProduct: (req, res) => {
    return Product.findByPk(req.params.id)
      .then((product) => {
        if (product.UserId !== req.user.id) { // 防止偷刪非自己店家商品資料
          req.flash('error_messages', '只能下架自己的商品！')
          res.redirect('/admin/products')
        } else {
          product.update({
            forSale: false
          })
            .then((product) => {
              req.flash('success_messages', '已成功下架商品')
              return res.redirect('/admin/products')
            })
        }
      })
  }
}

module.exports = adminController
