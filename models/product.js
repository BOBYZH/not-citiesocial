'use strict'
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    image: DataTypes.STRING,
    discount: DataTypes.FLOAT,
    sale_deadline: DataTypes.DATE
  }, {})
  Product.associate = function (models) {
    // associations can be defined here
  }
  return Product
}
