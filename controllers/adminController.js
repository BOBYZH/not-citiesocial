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
const superAdminEmail = process.env.ADDRESS
const helpers = require('../helpers')

// 載入寄送郵件相關設定
const emailService = require('../config/email.js')()

const adminController = {
  // 後台管理
  getProducts: (req, res) => {
    const sort = req.query.sort
    let productCounts = ''
    Product.findAndCountAll({
      where: { UserId: helpers.getUser(req).id },
      include: [CategoryLv1, CategoryLv2, CategoryLv3]
    }).then(products => {
      switch (sort) {
        case 'priceDesc':
          products.rows = products.rows.sort((a, b) => b.price - a.price)
          break
        case 'priceAsc':
          products.rows = products.rows.sort((a, b) => a.price - b.price)
          break
        case 'latest':
          products.rows = products.rows.sort((a, b) => b.updatedAt - a.updatedAt)
          break
        case 'notForSale':
          products.rows = products.rows.sort((a, b) => a.forSale - b.forSale)
          break
        case 'categoryLv1':
          products.rows = products.rows.sort((a, b) => a.CategoryLv1Id - b.CategoryLv1Id)
          break
        default:
          products.rows = products.rows.sort((a, b) => b.forSale - a.forSale)
      }
      productCounts = products.rows.length
      return res.render('admin/products', JSON.parse(JSON.stringify({
        products, inAdmin, inProducts, superAdminEmail, sort, productCounts
      })))
    })
  },

  createProduct: (req, res) => {
    CategoryLv1.findAll().then(CategoryLv1s => {
      CategoryLv2.findAll().then(CategoryLv2s => {
        CategoryLv3.findAll().then(CategoryLv3s => {
          return res.render('admin/create', JSON.parse(JSON.stringify({
            inAdmin, inProducts, CategoryLv1s, CategoryLv2s, CategoryLv3s, superAdminEmail
          })))
        })
      })
    })
  },

  postProduct: (req, res) => {
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
          UserId: helpers.getUser(req).id
        }).then((product) => {
          req.flash('success_messages', `已成功新增商品：${product.name}`)
          return res.redirect('/admin/products')
        }).catch((product) => {
          req.flash('error_messages', '發生錯誤，請稍後再試……')
          return res.redirect('back')
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
        UserId: helpers.getUser(req).id
      }).then((product) => {
        req.flash('success_messages', `已成功新增商品：${product.name}`)
        return res.redirect('/admin/products')
      }).catch((product) => {
        req.flash('error_messages', '發生錯誤，請稍後再試……')
        return res.redirect('back')
      })
    }
  },

  editProduct: (req, res) => {
    Product.findByPk(req.params.id).then(product => {
      CategoryLv1.findAll().then(CategoryLv1s => {
        CategoryLv2.findAll().then(CategoryLv2s => {
          CategoryLv3.findAll().then(CategoryLv3s => {
            if (product.UserId !== helpers.getUser(req).id) { // 防止進入非自己店家商品頁面偷改資料
              req.flash('error_messages', '只能改自己的商品！')
              res.redirect('/admin/products')
            } else {
              return res.render('admin/create', JSON.parse(JSON.stringify({ product, inAdmin, inProducts, CategoryLv1s, CategoryLv2s, CategoryLv3s, superAdminEmail })))
            }
          })
        })
      })
    })
  },

  putProduct: (req, res) => {
    Product.findByPk(req.params.id).then(product => {
      if (product.UserId !== helpers.getUser(req).id) { // 防止進入非自己店家商品頁面偷改資料
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
                const putResults = []
                putResults.push(
                  // 用async ... await包裝到陣列，以使用Promise.all
                  (async function () {
                    await product.update({
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
                      UserId: helpers.getUser(req).id
                    })
                  })()
                )
                const productName = product.name // 將變數傳到Promise.all後使用
                // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
                return Promise.all(putResults).then((product) => {
                  req.flash('success_messages', `已成功修改商品：${productName}`)
                  return res.redirect('/admin/products')
                }).catch((product) => {
                  req.flash('error_messages', '發生錯誤，請稍後再試……')
                  return res.redirect('back')
                })
              })
          })
        } else {
          return Product.findByPk(req.params.id)
            .then((product) => {
              const putResults = []
              putResults.push(
                // 用async ... await包裝到陣列，以使用Promise.all
                (async function () {
                  await product.update({
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
                    UserId: helpers.getUser(req).id
                  })
                })()
              )
              const productName = product.name
              // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
              return Promise.all(putResults).then((product) => {
                req.flash('success_messages', `已成功修改商品：${productName}`)
                return res.redirect('/admin/products')
              }).catch((product) => {
                req.flash('error_messages', '發生錯誤，請稍後再試……')
                return res.redirect('back')
              })
            })
        }
      }
    })
  },

  deleteProduct: (req, res) => {
    return Product.findByPk(req.params.id)
      .then((product) => {
        if (product.UserId !== helpers.getUser(req).id) { // 防止偷刪非自己店家商品資料
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
        if (product.UserId !== helpers.getUser(req).id) { // 防止偷刪非自己店家商品資料
          req.flash('error_messages', '只能上架自己的商品！')
          res.redirect('/admin/products')
        } else {
          const sellResult = []
          sellResult.push(
            // 用async ... await包裝到陣列，以使用Promise.all
            (async function () {
              await product.update({
                forSale: true
              })
            })()
          )
          const productName = product.name // 將變數傳到Promise.all後使用
          // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
          return Promise.all(sellResult).then((product) => {
            req.flash('success_messages', `已成功上架商品：${productName}`)
            return res.redirect('back')
          })
        }
      })
  },

  cancelProduct: (req, res) => {
    return Product.findByPk(req.params.id)
      .then((product) => {
        if (product.UserId !== helpers.getUser(req).id) { // 防止偷刪非自己店家商品資料
          req.flash('error_messages', '只能下架自己的商品！')
          res.redirect('/admin/products')
        } else {
          const sellResult = []
          sellResult.push(
            // 用async ... await包裝到陣列，以使用Promise.all
            (async function () {
              await product.update({
                forSale: false
              })
            })()
          )
          const productName = product.name // 將變數傳到Promise.all後使用
          // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
          return Promise.all(sellResult).then((product) => {
            req.flash('success_messages', `已成功下架商品：${productName}`)
            return res.redirect('back')
          })
        }
      })
  },

  sellAllProducts: (req, res) => {
    Product.findAll({ where: { UserId: helpers.getUser(req).id } })
      .then((products) => {
        // 包裝到陣列，以使用Promise.all
        const sellResult = []
        products.map(product => {
          sellResult.push(
            // 用async ... await包裝到陣列，以使用Promise.all
            (async function () {
              await product.update({
                forSale: true
              })
            })()
          )
        })
        // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
        return Promise.all(sellResult).then((products) => {
          req.flash('success_messages', '已成功上架所有商品')
          return res.redirect('/admin/products') // 用'back'容易顯示寫入未完成的資訊
        })
      })
  },

  cancelAllProducts: (req, res) => {
    Product.findAll({ where: { UserId: helpers.getUser(req).id } })
      .then((products) => {
        // 包裝到陣列，以使用Promise.all
        const sellResult = []
        products.map(product => {
          sellResult.push(
            // 用async ... await包裝到陣列，以使用Promise.all
            (async function () {
              await product.update({
                forSale: false
              })
            })()
          )
        })
        // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
        return Promise.all(sellResult).then((products) => {
          req.flash('success_messages', '已成功下架所有商品')
          return res.redirect('/admin/products') // 用'back'容易顯示寫入未完成的資訊
        })
      })
  },

  getOrderItems: (req, res) => {
    const sort = req.query.sort
    let orderItemsCounts = ''

    OrderItem.findAll({ include: [Product, Order] }).then(orderItems => {
      orderItems = orderItems.filter(orderItem => orderItem.Product.UserId === helpers.getUser(req).id)

      switch (sort) {
        case 'priceDesc':
          orderItems = orderItems.sort((a, b) => b.price - a.price)
          break
        case 'priceAsc':
          orderItems = orderItems.sort((a, b) => a.price - b.price)
          break
        case 'subtotalDesc':
          orderItems = orderItems.sort((a, b) => b.subtotal - a.subtotal)
          break
        case 'subtotalAsc':
          orderItems = orderItems.sort((a, b) => a.subtotal - b.subtotal)
          break
        case 'quantityDesc':
          orderItems = orderItems.sort((a, b) => b.quantity - a.quantity)
          break
        case 'quantityAsc':
          orderItems = orderItems.sort((a, b) => a.quantity - b.quantity)
          break
        case 'shippingStatusDesc':
          orderItems = orderItems.sort((a, b) => b.shippingStatus - a.shippingStatus)
          break
        case 'shippingStatusAsc':
          orderItems = orderItems.sort((a, b) => a.shippingStatus - b.shippingStatus)
          break
        case 'updatedAtAsc':
          orderItems = orderItems.sort((a, b) => a.updatedAt - b.updatedAt)
          break
        default:
          orderItems = orderItems.sort((a, b) => b.updatedAt - a.updatedAt)
      }
      orderItemsCounts = orderItems.length

      return res.render('admin/orderItems', JSON.parse(JSON.stringify({
        orderItems, inAdmin, inOrders, superAdminEmail, sort, orderItemsCounts
      })))
    })
  },

  confirmOrderItem: (req, res) => {
    return OrderItem.findByPk(helpers.paramsId(req), { include: [Order, Product] }).then(orderItem => {
      if (orderItem.Product.UserId !== helpers.getUser(req).id) { // 防止對非自家店面訂單項目擅自確認
        req.flash('error_messages', '只能確認自家店面的訂單項目！')
        res.redirect('/admin/orderItems')
      } else {
        const confirmedResults = []
        confirmedResults.push(
          // 用async ... await包裝到陣列，以使用Promise.all
          (async function () {
            await orderItem.update({
              ...req.body,
              shippingStatus: 1
            })
          })()
        )
        const OrderItem = orderItem // 將變數傳到Promise.all後使用
        // 用Promise.all避免資料庫寫入未完成時，顯示改到一半的資訊
        return Promise.all(confirmedResults).then(orderItem => {
          // 使用模板發信
          res.render('emails/shipOrderItem', JSON.parse(JSON.stringify({
            layout: null,
            url: process.env.WEBSITE_URL,
            OrderItem
          })), function (err, html) {
            if (err) {
              console.log('Error in email template!')
            }
            emailService.send(OrderItem.Order.email, // 提醒購買該筆orderItem的顧客
              `${OrderItem.Order.name}，您訂單（id：${OrderItem.Order.id}）中的${OrderItem.Product.name}已寄送`,
              html,
              process.env.ADDRESS // 提醒負責撥款給店家的管理人員，在店家配送後將代收的金錢轉給店家，密件副本
            )
          })

          return res.redirect('back')
        })
      }
    })
  }
}

module.exports = adminController
