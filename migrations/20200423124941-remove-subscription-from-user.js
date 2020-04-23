'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'subscription')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'subscription', {
      type: Sequelize.STRING
    })
  }
}
