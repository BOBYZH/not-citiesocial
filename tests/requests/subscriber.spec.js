/* eslint-env mocha */

const chai = require('chai')
chai.use(require('sinon-chai'))

const request = require('supertest')

const app = require('../../app')
const db = require('../../models')

describe('# Cart Request', () => {
  context('# POST /subscriber', () => {
    before(async () => {
      await db.Subscriber.destroy({ where: {}, truncate: true })
      await db.Subscriber.create({
        email: 'tested@test.com'
      })

      it('Submit email to subscribe', (done) => {
        request(app)
          .post('/subscriber')
          .send({
            email: 'testing@test.com'
          })
          .set('Accept', 'application/json')
          .expect(302)
          .end((err, res) => {
            if (err) return done(err)
            db.Subscriber.findAll().then((subscribers) => {
              subscribers[0].email.should.be.equal('testing@test.com')
            })
            done()
          })
      })

      it('Redirect when email subscribed', (done) => {
        request(app)
          .post('/subscriber')
          .send({
            email: 'tested@test.com'
          })
          .set('Accept', 'application/json')
          .expect(302)
          .end((err, res) => {
            if (err) return done(err)
            db.Subscriber.findAll().then((subscribers) => {
              for (let i = 0; i < subscribers.length; i++) {
                subscribers[i].email.should.not.be.equal('tested@test.com')
              }
            })
            done()
          })
      })

      after(async () => {
        await db.Subscriber.destroy({ where: {}, truncate: true })
      })
    })
  })

  context('# DELETE /subscriber', () => {
    before(async () => {
      await db.Subscriber.destroy({ where: {}, truncate: true })
      await db.Subscriber.create({
        email: 'tested@test.com'
      })
    })

    it('Redirect when attempting to delete nonexistent subscriber', (done) => {
      request(app)
        .delete('/subscriber')
        .send({
          email: 'testing@test.com'
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          done()
        })
    })

    it('Delete specific subscriber', (done) => {
      request(app)
        .delete('/subscriber')
        .send({
          email: 'tested@test.com'
        })
        .set('Accept', 'application/json')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err)
          db.Subscriber.findAll().then((subscribers) => {
            // subscribers因subscriber被刪除內容為空，新插入的內容必然在陣列的第一個
            subscribers.push('none')
            subscribers[0].should.be.equal('none')
          })
          done()
        })
    })

    after(async () => {
      await db.Subscriber.destroy({ where: {}, truncate: true })
    })
  })
})
