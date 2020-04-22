'use strict'
const bcrypt = require('bcryptjs')
// const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      // （未來設為系統管理員帳號，先當一般店家帳號）
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: true,
      shopName: 'Rookie',
      firstName: 'Root',
      lastName: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      // 店家帳號1
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: true,
      shopName: 'One',
      firstName: 'User1',
      lastName: 'Customer',
      createdAt: new Date(),
      updatedAt: new Date()
      }, {
      // 店家帳號2
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: true,
      shopName: 'Truth',
      firstName: 'User2',
      lastName: 'Customer',
      createdAt: new Date(),
      updatedAt: new Date()
      }, {
      // 顧客帳號
      email: 'test@test.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: false,
      firstName: 'User2',
      lastName: 'Customer',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
}
