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
const UserModel = require('../../models/user')

describe('# User Model', () => {
  before(done => {
    done()
  })

  const User = UserModel(sequelize, dataTypes)
  const user = new User()
  checkModelName(User)('User')

  context('properties', () => {
    ;[
      'firstName',
      'lastName',
      'email',
      'password',
      'defaultPhone',
      'defaultAddress',
      'isAdmin',
      'shopName',
      'shopId',
      'shopBirthday',
      'shopAddress',
      'shopBankName',
      'shopBankBranch',
      'shopAccountName',
      'shopAccountNumber'
    ].forEach(checkPropertyExists(user))
  })

  context('associations', () => {
    const Order = 'Order'
    const Product = 'Product'
    before(() => {
      User.associate({ Order })
      User.associate({ Product })
    })

    it('should have many Orders', (done) => {
      expect(User.hasMany).to.have.been.calledWith(Order)
      done()
    })

    it('should have many Products', (done) => {
      expect(User.hasMany).to.have.been.calledWith(Product)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: '123456',
        isAdmin: 0
      }).then((user) => {
        data = user
        done()
      })
    })
    it('read', (done) => {
      db.User.findByPk(data.id).then((user) => {
        expect(data.id).to.be.equal(user.id)
        done()
      })
    })
    it('update', (done) => {
      db.User.update({}, { where: { id: data.id } }).then(() => {
        db.User.findByPk(data.id).then((user) => {
          expect(data.updatedAt).to.be.not.equal(user.updatedAt)
          done()
        })
      })
    })
    it('delete', (done) => {
      db.User.destroy({ where: { id: data.id } }).then(() => {
        db.User.findByPk(data.id).then((user) => {
          expect(user).to.be.equal(null)
          done()
        })
      })
    })
  })
})
