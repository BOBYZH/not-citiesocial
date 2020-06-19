/* eslint-env mocha */

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
const CategoryLv2Model = require('../../models/categorylv2')

describe('# CategoryLv2 Model', () => {
  before((done) => {
    done()
  })

  const CategoryLv2 = CategoryLv2Model(sequelize, dataTypes)
  const categoryLv2 = new CategoryLv2()
  checkModelName(CategoryLv2)('CategoryLv2')

  context('properties', () => {
    ['name'].forEach(checkPropertyExists(categoryLv2))
  })

  context('associations', () => {
    const Product = 'Product'

    before(() => {
      CategoryLv2.associate({ Product })
    })

    it('should have many products', (done) => {
      expect(CategoryLv2.hasMany).to.have.been.calledWith(Product)
      done()
    })
  })

  context('action', () => {
    let data = null

    it('create', (done) => {
      db.CategoryLv2.create({
        name: '測試Lv2'
      }).then((categoryLv2) => {
        data = categoryLv2
        done()
      })
    })
    it('read', (done) => {
      db.CategoryLv2.findByPk(data.id).then((categoryLv2) => {
        expect(data.id).to.be.equal(categoryLv2.id)
        done()
      })
    })
    it('update', (done) => {
      db.CategoryLv2.update({}, { where: { id: data.id } }).then(() => {
        db.CategoryLv2.findByPk(data.id).then((categoryLv2) => {
          expect(data.updatedAt).to.be.not.equal(categoryLv2.updatedAt)
          done()
        })
      })
    })
    it('delete', (done) => {
      db.CategoryLv2.destroy({ where: { id: data.id } }).then(() => {
        db.CategoryLv2.findByPk(data.id).then((categoryLv2) => {
          expect(categoryLv2).to.be.equal(null)
          done()
        })
      })
    })
  })
})
