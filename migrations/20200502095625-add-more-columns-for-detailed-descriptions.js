'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Products', 'features', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    queryInterface.addColumn('Products', 'instruction', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    queryInterface.addColumn('Products', 'announcement', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    return queryInterface.addColumn('Products', 'specification', {
      type: Sequelize.TEXT,
      allowNull: true
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Products', 'features')
    queryInterface.removeColumn('Products', 'instruction')
    queryInterface.removeColumn('Products', 'announcement')
    return queryInterface.removeColumn('Products', 'specification')
  }
}
