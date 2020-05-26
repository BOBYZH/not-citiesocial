const db = require('../models')
const Product = db.Product
const User = db.User
const CategoryLv1 = db.CategoryLv1
const CategoryLv2 = db.CategoryLv2
const CategoryLv3 = db.CategoryLv3

// 設定顯示數量，來自購物車教案
let PAGE_LIMIT, PAGE_OFFSET // 前者：最多顯示幾個商品, 後者：從id幾開始顯示

const productController = {
  // 防止亂打網址出現404錯誤
  redirectInvalidUrl: (req, res) => {
    res.redirect('/')
  },

  // 前台瀏覽
  getIndex: (req, res) => {
    PAGE_LIMIT = 6 // 可設定只顯示id前幾個商品，數值大於等於總上架商品數量即可全部顯示
    PAGE_OFFSET = 0
    Product.findAndCountAll(
      { include: User, offset: PAGE_OFFSET, limit: PAGE_LIMIT, where: { forSale: true } } // forSale限制只能看到上架的商品
    ).then(products => {
      let Products = products.rows
      if (products) {
        Products = Products
          .filter(product => product.User.isAdmin === true) // 只顯示有營業店家的商品
          .map(product => (
            {
              ...product.dataValues,
              name: product.dataValues.name !== null ? (product.dataValues.name.length > 18 ? (product.dataValues.name.substring(0, 18) + '...') : product.dataValues.name) : ''
            }
          ))
      }
      return res.render('index', JSON.parse(JSON.stringify({
        products: Products
      })))
    })
  },

  getProducts: (req, res) => {
    const whereQuery = {}
    let categoryLv1Id = ''
    if (req.query.categoryLv1Id) {
      categoryLv1Id = Number(req.query.categoryLv1Id)
      whereQuery.categoryLv1Id = categoryLv1Id
    }
    Product.findAndCountAll(
      { include: [User, CategoryLv1, CategoryLv2, CategoryLv3], where: [{ forSale: true }, whereQuery] } // forSale限制只能看到上架的商品
    ).then(products => {
      let Products = products.rows
        .filter(product => product.User.isAdmin === true) // 只顯示有營業店家的商品
        .map(product => (
          {
            ...product.dataValues,
            name: product.dataValues.name !== null ? product.dataValues.name : ''
          }
        ))
      CategoryLv1.findAll().then(categoryLv1s => {
        const keyword = req.query.keyword || ''
        const sort = req.query.sort
        let productCounts = ''

        if (req.query) {
          console.log('req.query:', req.query)
          Products = Products.filter(product => {
            return product.name.toLowerCase().includes(keyword.toLowerCase()) ||
              product.description.toLowerCase().includes(keyword.toLowerCase()) ||
              (product.features ? product.features : '').toLowerCase().includes(keyword.toLowerCase()) || // 選填欄位可能為空值
              (product.instruction ? product.instruction : '').toLowerCase().includes(keyword.toLowerCase()) || // 選填欄位可能為空值
              (product.announcement ? product.announcement : '').toLowerCase().includes(keyword.toLowerCase()) || // 選填欄位可能為空值
              (product.specification ? product.specification : '').toLowerCase().includes(keyword.toLowerCase()) || // 選填欄位可能為空值
              product.CategoryLv1.name.toLowerCase().includes(keyword.toLowerCase()) ||
              product.CategoryLv2.name.toLowerCase().includes(keyword.toLowerCase()) ||
              product.CategoryLv3.name.toLowerCase().includes(keyword.toLowerCase()) ||
              product.User.shopName.toLowerCase().includes(keyword.toLowerCase()) ||
              product.price.toString().includes(keyword.toLowerCase())
          })
          switch (sort) {
            case 'priceDesc':
              Products = Products.sort((a, b) => b.price - a.price)
              break
            case 'priceAsc':
              Products = Products.sort((a, b) => a.price - b.price)
              break
            case 'latest':
              Products = Products.sort((a, b) => b.updatedAt - a.updatedAt)
              break
          }
        } else {
          console.log('req.categoryLv1Id:', req.categoryLv1Id)
        }
        productCounts = Products.length
        return res.render('products', JSON.parse(JSON.stringify({
          products: Products, categoryLv1s, categoryLv1Id, keyword, sort, productCounts
        })))
      })
    })
  },

  getProduct: (req, res) => {
    Product.findByPk(req.params.id, {
      include: [
        User,
        CategoryLv1, CategoryLv2, CategoryLv3
      ]
    }).then(product => {
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
