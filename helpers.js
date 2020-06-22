// const db = require('./models')

function ensureAuthenticated (req) {
  return req.isAuthenticated()
}

function getUser (req) {
  return req.user
}

function cartId (req) {
  return req.body.cartId
}

function productId (req) {
  return req.body.productId
}

function paramsId (req) {
  return req.params.id
}

function setQuantity (req) {
  return req.body.quantity
}

module.exports = {
  ensureAuthenticated,
  getUser,
  cartId,
  productId,
  paramsId,
  setQuantity
}
