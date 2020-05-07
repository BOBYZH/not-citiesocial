const db = require('../models')
const Product = db.Product
const Order = db.Order
const OrderItem = db.OrderItem
const CategoryLv1 = db.CategoryLv1
const CategoryLv2 = db.CategoryLv2
const CategoryLv3 = db.CategoryLv3
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const inAdmin = true
const inProducts = true
const inOrders = true

const adminController = {
  // 後台管理
  getProducts: (req, res) => {
    Product.findAndCountAll({
      where: { UserId: req.user.id },
      include: [CategoryLv1, CategoryLv2, CategoryLv3]
    }).then(products => {
      return res.render('admin/products', JSON.parse(JSON.stringify({
        products, inAdmin, inProducts
      })))
    })
  },

  createProduct: (req, res) => {
    CategoryLv1.findAll().then(CategoryLv1s => {
      CategoryLv2.findAll().then(CategoryLv2s => {
        CategoryLv3.findAll().then(CategoryLv3s => {
          // console.log(inAdmin, inProducts, CategoryLv1s)
          return res.render('admin/create', JSON.parse(JSON.stringify({
            inAdmin, inProducts, CategoryLv1s, CategoryLv2s, CategoryLv3s
          })))
        })
      })
    })
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
          features: req.body.features,
          description: req.body.description,
          instruction: req.body.instruction,
          announcement: req.body.announcement,
          specification: req.body.specification,
          image: file ? img.data.link : null,
          CategoryLv1Id: req.body.categoryLv1Id,
          CategoryLv2Id: req.body.categoryLv2Id,
          CategoryLv3Id: req.body.categoryLv3Id,
          UserId: req.user.id
        }).then((product) => {
          req.flash('success_messages', `已成功新增商品：${product.name}`)
          return res.redirect('/admin/products')
        }).catch((product) => {
          req.flash('error_messages', '發生錯誤，請稍後再試……')
        })
      })
    } else {
      return Product.create({
        name: req.body.name,
        price: req.body.price,
        features: req.body.features,
        description: req.body.description,
        instruction: req.body.instruction,
        announcement: req.body.announcement,
        specification: req.body.specification,
        image: 'https://fakeimg.pl/640x480/', // 預設圖片
        CategoryLv1Id: req.body.categoryLv1Id,
        CategoryLv2Id: req.body.categoryLv2Id,
        CategoryLv3Id: req.body.categoryLv3Id,
        UserId: req.user.id
      }).then((product) => {
        req.flash('success_messages', `已成功新增商品：${product.name}`)
        return res.redirect('/admin/products')
      }).catch((product) => {
        req.flash('error_messages', '發生錯誤，請稍後再試……')
      })
    }
  },

  editProduct: (req, res) => {
    Product.findByPk(req.params.id).then(product => {
      // console.log(product.UserId, 'test')
      CategoryLv1.findAll().then(CategoryLv1s => {
        CategoryLv2.findAll().then(CategoryLv2s => {
          CategoryLv3.findAll().then(CategoryLv3s => {
            if (product.UserId !== req.user.id) { // 防止進入非自己店家商品頁面偷改資料
              req.flash('error_messages', '只能改自己的商品！')
              res.redirect('/admin/products')
            } else {
              return res.render('admin/create', JSON.parse(JSON.stringify({ product, inAdmin, inProducts, CategoryLv1s, CategoryLv2s, CategoryLv3s })))
            }
          })
        })
      })
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
                  features: req.body.features,
                  description: req.body.description,
                  instruction: req.body.instruction,
                  announcement: req.body.announcement,
                  specification: req.body.specification,
                  image: file ? img.data.link : product.image,
                  CategoryLv1Id: req.body.categoryLv1Id,
                  CategoryLv2Id: req.body.categoryLv2Id,
                  CategoryLv3Id: req.body.categoryLv3Id,
                  UserId: req.user.id
                }).then((product) => {
                  // 用order.controller的promise，做完一件事情再做另一見事情
                  setTimeout( // 避免資料庫寫入未完成時，顯示改到一半的資訊
                    () => {
                      req.flash('success_messages', `已成功修改商品：${product.name}`)
                      return res.redirect('/admin/products')
                    }, 1500
                  )
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
                features: req.body.features,
                description: req.body.description,
                instruction: req.body.instruction,
                announcement: req.body.announcement,
                specification: req.body.specification,
                image: product.image,
                CategoryLv1Id: req.body.categoryLv1Id,
                CategoryLv2Id: req.body.categoryLv2Id,
                CategoryLv3Id: req.body.categoryLv3Id,
                UserId: req.user.id
              }).then((product) => {
                // 用order.controller的promise，做完一件事情再做另一見事情
                setTimeout( // 避免資料庫寫入未完成時，顯示改到一半的資訊
                  () => {
                    req.flash('success_messages', `已成功修改商品：${product.name}`)
                    return res.redirect('/admin/products')
                  }, 1500
                )
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
              req.flash('success_messages', `已成功刪除商品：${product.name}`)
              return res.redirect('back')
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
              req.flash('success_messages', `已成功上架商品：${product.name}`)
              return res.redirect('back')
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
              req.flash('success_messages', `已成功下架商品：${product.name}`)
              return res.redirect('back')
            })
        }
      })
  },

  sellAllProducts: (req, res) => {
    return Product.findAll({ where: { UserId: req.user.id } })
      .then((products) => {
        products.forEach(product =>
          product.update({
            forSale: true
          }))
      }).then((products) => {
        req.flash('success_messages', '已成功上架所有商品')
        // 用order.controller的promise，做完一件事情再做另一見事情
        setTimeout( // 避免資料庫寫入未完成時，顯示改到一半的資訊
          () => {
            return res.redirect('back')
          }, 1500
        )
      })
  },

  cancelAllProducts: (req, res) => {
    return Product.findAll({ where: { UserId: req.user.id } })
      .then((products) => {
        products.forEach(product =>
          product.update({
            forSale: false
          }))
      }).then((products) => {
        req.flash('success_messages', '已成功下架所有商品')
        // 用order.controller的promise，做完一件事情再做另一見事情
        setTimeout( // 避免資料庫寫入未完成時，顯示改到一半的資訊
          () => {
            return res.redirect('back')
          }, 1500
        )
      })
  },

  getOrders: (req, res) => {
    OrderItem.findAll({ include: [Product, Order] }).then(orderItems => {
      orderItems = orderItems.filter(orderItem => orderItem.Product.UserId === req.user.id)
      return res.render('admin/orders', JSON.parse(JSON.stringify({
        orderItems, inAdmin, inOrders
      })))
    })
  }
}

module.exports = adminController
