'use strict'
module.exports = (sequelize, DataTypes) => {
  const CategoryLv3 = sequelize.define('CategoryLv3', {
    name: DataTypes.STRING
  }, {})
  CategoryLv3.associate = function (models) {
    CategoryLv3.hasMany(models.Product)
  }
  return CategoryLv3
}
