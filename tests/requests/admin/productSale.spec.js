/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))
const sinon = require('sinon')
const request = require('supertest')

const app = require('../../../app')
const helpers = require('../../../helpers')
const db = require('../../../models')

describe('# Admin Request', () => {
  context('# PUT admin/products/:id/sell, /:id/cancel, /sellAll, and /cancelAll ', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true)
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({
        id: 1,
        isAdmin: 1,
        shopName: 'Test Shop'
      })
      await db.User.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
      await db.User.create({
        id: 1,
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 1,
        shopName: 'Test Shop'
      })
      await db.CategoryLv1.create({ id: 1, name: '1-1' })
      await db.CategoryLv1.create({ id: 2, name: '1-2' })
      await db.CategoryLv2.create({ id: 1, name: '2-1' })
      await db.CategoryLv2.create({ id: 2, name: '2-2' })
      await db.CategoryLv3.create({ id: 1, name: '3-1' })
      await db.CategoryLv3.create({ id: 2, name: '3-2' })
      await db.Product.create({
        id: 1,
        name: 'Test1',
        price: 987,
        description: 'null',
        CategoryLv1Id: 1,
        CategoryLv2Id: 2,
        CategoryLv3Id: 2,
        UserId: 1,
        forSale: 0
      })
      await db.Product.create({
        id: 2,
        name: 'Test2',
        price: 321,
        description: 'none',
        CategoryLv1Id: 2,
        CategoryLv2Id: 1,
        CategoryLv3Id: 2,
        UserId: 1,
        forSale: 1
      })
      await db.Product.create({
        id: 3,
        name: 'Test3',
        price: 555,
        description: 'none',
        CategoryLv1Id: 1,
        CategoryLv2Id: 1,
        CategoryLv3Id: 1,
        UserId: 2,
        forSale: 0
      })
      await db.Product.create({
        id: 4,
        name: 'Test4',
        price: 666,
        description: 'none',
        CategoryLv1Id: 2,
        CategoryLv2Id: 1,
        CategoryLv3Id: 1,
        UserId: 2,
        forSale: 1
      })
    })

    it('Mark product Test1 as forSale', (done) => {
      request(app)
        .put('/admin/products/1/sell')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findOne({ where: { name: 'Test1' } }).then((product) => {
            product.forSale.should.be.equal(true)
            return done()
          })
        })
    })

    it("Redirect when attempting to mark other's product Test3 as forSale", (done) => {
      request(app)
        .put('/admin/products/3/sell')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findOne({ where: { name: 'Test3' } }).then((product) => {
            product.forSale.should.not.be.equal(true) // 確認沒被竄改
            return done()
          })
        })
    })

    it('Mark product Test2 as not forSale', (done) => {
      request(app)
        .put('/admin/products/2/cancel')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findOne({ where: { name: 'Test2' } }).then((product) => {
            product.forSale.should.be.equal(false)
            return done()
          })
        })
    })

    it("Redirect when attempting to mark other's product Test4 as not forSale", (done) => {
      request(app)
        .put('/admin/products/4/cancel')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findOne({ where: { name: 'Test4' } }).then((product) => {
            product.forSale.should.not.be.equal(false) // 確認沒被竄改
            return done()
          })
        })
    })

    it('Mark all products as forSale', (done) => {
      request(app)
        .put('/admin/products/sellAll')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findAll({ where: { UserId: 1 } }).then((products) => {
            for (let i = 0; i < products.length; i++) {
              products[i].forSale.should.be.equal(true)
            }
            return done()
          })
        })
    })

    it('Mark all products as not forSale', (done) => {
      request(app)
        .put('/admin/products/cancelAll')
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Product.findAll({ where: { UserId: 1 } }).then((products) => {
            for (let i = 0; i < products.length; i++) {
              products[i].forSale.should.be.equal(false)
            }
            return done()
          })
        })
    })

    after(async () => {
      this.ensureAuthenticated.restore()
      this.getUser.restore()
      await db.User.destroy({ where: {}, truncate: true })
      await db.CategoryLv1.destroy({ where: {}, truncate: true })
      await db.CategoryLv2.destroy({ where: {}, truncate: true })
      await db.CategoryLv3.destroy({ where: {}, truncate: true })
      await db.Product.destroy({ where: {}, truncate: true })
    })
  })
})
