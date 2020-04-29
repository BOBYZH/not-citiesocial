'use strict'
module.exports = (sequelize, DataTypes) => {
  const CategoryLv2 = sequelize.define('CategoryLv2', {
    name: DataTypes.STRING
  }, {})
  CategoryLv2.associate = function (models) {
    CategoryLv2.hasMany(models.Product)
  }
  return CategoryLv2
}
