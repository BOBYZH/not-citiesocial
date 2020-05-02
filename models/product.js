'use strict'
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    features: DataTypes.TEXT,
    description: DataTypes.TEXT,
    instruction: DataTypes.TEXT,
    announcement: DataTypes.TEXT,
    specification: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    image: DataTypes.STRING,
    discount: DataTypes.FLOAT,
    deadlineOfSale: DataTypes.DATE,
    UserId: DataTypes.INTEGER,
    forSale: DataTypes.BOOLEAN
  }, {})
  Product.associate = function (models) {
    // associations can be defined here
    Product.belongsToMany(models.Cart, {
      as: 'carts',
      through: {
        model: models.CartItem, unique: false
      },
      foreignKey: 'ProductId'
    })
    Product.belongsToMany(models.Order, {
      as: 'orders',
      through: {
        model: models.OrderItem, unique: false
      },
      foreignKey: 'ProductId'
    })
    Product.belongsTo(models.User)
    Product.belongsTo(models.CategoryLv1)
    Product.belongsTo(models.CategoryLv2)
    Product.belongsTo(models.CategoryLv3)
  }
  return Product
}
