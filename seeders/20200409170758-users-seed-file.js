'use strict'
const bcrypt = require('bcryptjs')
const faker = require('faker')

// 修改自：https://stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object

Date.prototype.standard = function () {
  let mm = this.getMonth() + 1; // getMonth() is zero-based
  let dd = this.getDate();

  return [this.getFullYear(),
  '-' + (mm > 9 ? '' : '0') + mm,
  '-' + (dd > 9 ? '' : '0') + dd
  ].join('');
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      // （未來若有建立系統管理員操作所有項目的界面與功能，將設為系統管理員帳號，在此先充當一般店家帳號）
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: true,
      shopName: 'Rookie',
      shopId: faker.random.number(),
      shopBirthday: new Date(2020, 0, 5).standard(),
      shopAddress: faker.address.streetAddress(),
      shopBankName: faker.company.companyName(),
      shopBankBranch: faker.address.city(),
      shopAccountName: 'Root',
      shopAccountNumber: faker.random.number(),
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
      shopId: faker.random.number(),
      shopBirthday: new Date(2019, 1, 6).standard(),
      shopAddress: faker.address.streetAddress(),
      shopBankName: faker.company.companyName(),
      shopBankBranch: faker.address.city(),
      shopAccountName: 'User1',
      shopAccountNumber: faker.random.number(),
      firstName: 'User1',
      lastName: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      // 店家帳號2
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: true,
      shopName: 'Truth',
      shopId: faker.random.number(),
      shopBirthday: new Date(2018, 3, 15).standard(),
      shopAddress: faker.address.streetAddress(),
      shopBankName: faker.company.companyName(),
      shopBankBranch: faker.address.city(),
      shopAccountName: 'User2',
      shopAccountNumber: faker.random.number(),
      firstName: 'User2',
      lastName: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      // 顧客帳號
      email: 'test@test.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      isAdmin: false,
      firstName: 'Test',
      lastName: 'Customer',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
