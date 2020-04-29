'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Products', 'CategoryLv3Id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'CategoryLv3s',
        key: 'id'
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Products', 'CategoryLv3Id')
  }
}
