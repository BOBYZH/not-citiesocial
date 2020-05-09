'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Users', 'shopId', {
      type: Sequelize.STRING
    })
    queryInterface.addColumn('Users', 'shopBirthday', {
      type: Sequelize.STRING
    })
    queryInterface.addColumn('Users', 'shopAddress', {
      type: Sequelize.STRING
    })
    queryInterface.addColumn('Users', 'shopBankName', {
      type: Sequelize.STRING
    })
    queryInterface.addColumn('Users', 'shopBankBranch', {
      type: Sequelize.STRING
    })
    queryInterface.addColumn('Users', 'shopAccountName', {
      type: Sequelize.STRING
    })
    return queryInterface.addColumn('Users', 'shopAccountNumber', {
      type: Sequelize.STRING
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Users', 'shopId')
    queryInterface.removeColumn('Users', 'shopBirthday')
    queryInterface.removeColumn('Users', 'shopAddress')
    queryInterface.removeColumn('Users', 'shopBankName')
    queryInterface.removeColumn('Users', 'shopBranch')
    queryInterface.removeColumn('Users', 'shopAccountName')
    return queryInterface.removeColumn('Users', 'shopAccountNumber')
  }
}
