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

function paramsId (req) {
  return req.params.id
}

module.exports = {
  ensureAuthenticated,
  getUser,
  cartId,
  paramsId
}
