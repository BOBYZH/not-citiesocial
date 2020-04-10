const express = require('express')
const router = express.Router()

const productController = require('../controllers/productController.js')
const cartController = require('../controllers/cartController.js')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/products', productController.getProducts)

router.get('/cart', cartController.getCart)

router.all('*', productController.redirectInvalidUrl) // 避免404當掉

module.exports = router
