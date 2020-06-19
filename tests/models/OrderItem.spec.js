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
const OrderItemModel = require('../../models/orderitem')

describe('# OrderItem Model', () => {
  before(done => {
    done()
  })

  const OrderItem = OrderItemModel(sequelize, dataTypes)
  const orderItem = new OrderItem()
  checkModelName(OrderItem)('OrderItem')

  context('properties', () => {
    ;[
      'id',
      'OrderId',
      'ProductId',
      'price',
      'quantity',
      'subtotal',
      'shippingStatus'
    ].forEach(checkPropertyExists(orderItem))
  })

  context('associations', () => {
    const Order = 'Order'
    const Product = 'Product'
    before(() => {
      OrderItem.associate({ Order })
      OrderItem.associate({ Product })
    })

    it('should belong to Order', (done) => {
      expect(OrderItem.belongsTo).to.have.been.calledWith(Order)
      done()
    })

    it('should belong to Product', (done) => {
      expect(OrderItem.belongsTo).to.have.been.calledWith(Product)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.OrderItem.create({
        OrderId: 1,
        ProductId: 2,
        price: 123,
        quantity: 4,
        subtotal: 492,
        shippingStatus: 0
      }).then((orderItem) => {
        data = orderItem
        done()
      })
    })

    it('read', (done) => {
      db.OrderItem.findByPk(data.id).then((orderItem) => {
        expect(data.id).to.be.equal(orderItem.id)
        done()
      })
    })

    it('update', (done) => {
      db.OrderItem.update({}, { where: { id: data.id } }).then(() => {
        db.OrderItem.findByPk(data.id).then((orderItem) => {
          expect(data.updatedAt).to.be.not.equal(orderItem.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.OrderItem.destroy({ where: { id: data.id } }).then(() => {
        db.OrderItem.findByPk(data.id).then((orderItem) => {
          expect(orderItem).to.be.equal(null)
          done()
        })
      })
    })
  })
})
