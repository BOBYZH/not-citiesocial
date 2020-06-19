/* eslint-env mocha */

process.env.NODE_ENV = 'test'

const chai = require('chai')
chai.use(require('sinon-chai'))

const { expect } = require('chai')
const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists
} = require('sequelize-test-helpers')

const db = require('../../models')
const CartItemModel = require('../../models/cartitem')

describe('# CartItem Model', () => {
  before(done => {
    done()
  })

  const CartItem = CartItemModel(sequelize, dataTypes)
  const cartItem = new CartItem()
  checkModelName(CartItem)('CartItem')

  context('properties', () => {
    ;[
      'id',
      'CartId',
      'ProductId',
      'quantity'
    ].forEach(checkPropertyExists(cartItem))
  })

  context('associations', () => {
    const Cart = 'Cart'
    const Product = 'Product'
    before(() => {
      CartItem.associate({ Cart })
      CartItem.associate({ Product })
    })

    it('should belong to Cart', (done) => {
      expect(CartItem.belongsTo).to.have.been.calledWith(Cart)
      done()
    })

    it('should belong to Product', (done) => {
      expect(CartItem.belongsTo).to.have.been.calledWith(Product)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.CartItem.create({
        CartId: 1,
        ProductId: 2,
        quantity: 4
      }).then((cartItem) => {
        data = cartItem
        done()
      })
    })

    it('read', (done) => {
      db.CartItem.findByPk(data.id).then((cartItem) => {
        expect(data.id).to.be.equal(cartItem.id)
        done()
      })
    })

    it('update', (done) => {
      db.CartItem.update({}, { where: { id: data.id } }).then(() => {
        db.CartItem.findByPk(data.id).then((cartItem) => {
          expect(data.updatedAt).to.be.not.equal(cartItem.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.CartItem.destroy({ where: { id: data.id } }).then(() => {
        db.CartItem.findByPk(data.id).then((cartItem) => {
          expect(cartItem).to.be.equal(null)
          done()
        })
      })
    })
  })
})
