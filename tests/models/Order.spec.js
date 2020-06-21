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
const OrderModel = require('../../models/order')

describe('# Order Model', () => {
  before((done) => {
    done()
  })

  const Order = OrderModel(sequelize, dataTypes)
  const order = new Order()
  checkModelName(Order)('Order')

  context('properties', () => {
    [
      'UserId',
      'name',
      'address',
      'phone',
      'email',
      'paymentStatus',
      'sn',
      'amount'
    ].forEach(checkPropertyExists(order))
  })

  context('associations', () => {
    const User = 'User'
    const Product = 'Product'
    const OrderItem = 'OrderItem'

    before(() => {
      Order.associate({ Product })
      Order.associate({ User })
      Order.associate({ OrderItem })
    })

    it('it should belong to many Products', (done) => {
      expect(Order.belongsToMany).to.have.been.calledWith(Product)
      done()
    })
    it('it should belong to User', (done) => {
      expect(Order.belongsTo).to.have.been.calledWith(User)
      done()
    })
    it('it should have many OrderItems', (done) => {
      expect(Order.hasMany).to.have.been.calledWith(OrderItem)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Order.create({
        UserId: 1,
        name: 'Test',
        address: 'test address',
        phone: '0987654321',
        email: 'test@example.com',
        paymentStatus: 0,
        amount: 9876,
        sn: '0123456789012'
      }).then((order) => {
        data = order
        done()
      })
    })

    it('read', (done) => {
      db.Order.findByPk(data.id).then((order) => {
        expect(order.id).to.be.equal(data.id)
        done()
      })
    })

    it('update', (done) => {
      db.Order.update({}, { where: { id: data.id } }).then(() => {
        db.Order.findByPk(data.id).then((order) => {
          expect(order.updatedAt).to.be.not.equal(data.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.Order.destroy({ where: { id: data.id } }).then(() => {
        db.Order.findByPk(data.id).then((order) => {
          expect(order).to.be.equal(null)
          done()
        })
      })
    })
  })
})
