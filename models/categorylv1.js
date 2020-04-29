'use strict'
module.exports = (sequelize, DataTypes) => {
  const CategoryLv1 = sequelize.define('CategoryLv1', {
    name: DataTypes.STRING
  }, {})
  CategoryLv1.associate = function (models) {
    CategoryLv1.hasMany(models.Product)
  }
  return CategoryLv1
}
