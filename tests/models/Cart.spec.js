/* eslint-env mocha */

process.env.NODE_ENV = 'test'

const chai = require('chai')
chai.use(require('sinon-chai'))

const { expect } = require('chai')

const {
  sequelize,
  dataTypes,
  checkModelName
} = require('sequelize-test-helpers')

const db = require('../../models')
const CartModel = require('../../models/cart')

describe('# Cart Model', () => {
  before((done) => {
    done()
  })

  const Cart = CartModel(sequelize, dataTypes)
  checkModelName(Cart)('Cart')

  context('associations', () => {
    const Product = 'Product'
    const CartItem = 'CartItem'

    before(() => {
      Cart.associate({ Product })
      Cart.associate({ CartItem })
    })

    it('it should belong to many Products', (done) => {
      expect(Cart.belongsToMany).to.have.been.calledWith(Product)
      done()
    })
    it('it should have many CartItems', (done) => {
      expect(Cart.hasMany).to.have.been.calledWith(CartItem)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Cart.create({}).then((cart) => {
        data = cart
        done()
      })
    })

    it('read', (done) => {
      db.Cart.findByPk(data.id).then((cart) => {
        expect(cart.id).to.be.equal(data.id)
        done()
      })
    })

    it('update', (done) => {
      db.Cart.update({}, { where: { id: data.id } }).then(() => {
        db.Cart.findByPk(data.id).then((cart) => {
          expect(cart.updatedAt).to.be.not.equal(data.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.Cart.destroy({ where: { id: data.id } }).then(() => {
        db.Cart.findByPk(data.id).then((cart) => {
          expect(cart).to.be.equal(null)
          done()
        })
      })
    })
  })
})
