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
const ProductModel = require('../../models/product')

describe('# Product Model', () => {
  before(done => {
    done()
  })

  const Product = ProductModel(sequelize, dataTypes)
  const product = new Product()
  checkModelName(Product)('Product')

  context('properties', () => {
    ;[
      'name',
      'features',
      'description',
      'instruction',
      'announcement',
      'specification',
      'price',
      'image',
      'discount',
      'deadlineOfSale',
      'UserId',
      'forSale'
    ].forEach(checkPropertyExists(product))
  })

  context('associations', () => {
    const Cart = 'Cart'
    const Order = 'Order'
    const User = 'User'
    const CategoryLv1 = 'CategoryLv1'
    const CategoryLv2 = 'CategoryLv2'
    const CategoryLv3 = 'CategoryLv3'

    before(() => {
      Product.associate({ Cart })
      Product.associate({ Order })
      Product.associate({ User })
      Product.associate({ CategoryLv1 })
      Product.associate({ CategoryLv2 })
      Product.associate({ CategoryLv3 })
    })

    it('it should belong to many Carts', (done) => {
      expect(Product.belongsToMany).to.have.been.calledWith(Cart)
      done()
    })

    it('it should belong to many Orders', (done) => {
      expect(Product.belongsToMany).to.have.been.calledWith(Order)
      done()
    })

    it('it should belong to User', (done) => {
      expect(Product.belongsTo).to.have.been.calledWith(User)
      done()
    })

    it('it should belong to CategoryLv1', (done) => {
      expect(Product.belongsTo).to.have.been.calledWith(CategoryLv1)
      done()
    })

    it('it should belong to CategoryLv2', (done) => {
      expect(Product.belongsTo).to.have.been.calledWith(CategoryLv2)
      done()
    })

    it('it should belong to CategoryLv3', (done) => {
      expect(Product.belongsTo).to.have.been.calledWith(CategoryLv3)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Product.create({
        name: 'Test',
        price: 987,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 3,
        UserId: 1
      }).then((product) => { // migration設定CategoryLv1～3Id不能為空值
        data = product
        done()
      })
    })

    it('read', (done) => {
      db.Product.findByPk(data.id).then((product) => {
        expect(data.id).to.be.equal(product.id)
        done()
      })
    })

    it('update', (done) => {
      db.Product.update({}, { where: { id: data.id } }).then(() => {
        db.Product.findByPk(data.id).then((product) => {
          expect(data.updatedAt).to.be.not.equal(product.updatedAt)
          done()
        })
      })
    })

    it('delete', (done) => {
      db.Product.destroy({ where: { id: data.id } }).then(() => {
        db.Product.findByPk(data.id).then((product) => {
          expect(product).to.be.equal(null)
          done()
        })
      })
    })
  })
})
