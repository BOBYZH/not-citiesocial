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
const UserModel = require('../../models/subscriber')

describe('# Subscriber Model', () => {
  before(done => {
    done()
  })

  const Subscriber = UserModel(sequelize, dataTypes)
  const subscriber = new Subscriber()
  checkModelName(Subscriber)('Subscriber')

  context('properties', () => {
    ;[
      'email'
    ].forEach(checkPropertyExists(subscriber))
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.Subscriber.create({
        email: 'test@example.com'
      }).then((subscriber) => {
        data = subscriber
        done()
      })
    })
    it('read', (done) => {
      db.Subscriber.findByPk(data.id).then((subscriber) => {
        expect(data.id).to.be.equal(subscriber.id)
        done()
      })
    })
    it('update', (done) => {
      db.Subscriber.update({}, { where: { id: data.id } }).then(() => {
        db.Subscriber.findByPk(data.id).then((subscriber) => {
          expect(data.updatedAt).to.be.not.equal(subscriber.updatedAt)
          done()
        })
      })
    })
    it('delete', (done) => {
      db.Subscriber.destroy({ where: { id: data.id } }).then(() => {
        db.Subscriber.findByPk(data.id).then((subscriber) => {
          expect(subscriber).to.be.equal(null)
          done()
        })
      })
    })
  })
})
