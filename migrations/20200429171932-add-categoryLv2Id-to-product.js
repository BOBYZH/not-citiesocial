'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Products', 'CategoryLv2Id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'CategoryLv2s',
        key: 'id'
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Products', 'CategoryLv2Id')
  }
}
