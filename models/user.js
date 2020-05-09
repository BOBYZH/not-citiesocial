'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    gender: DataTypes.BOOLEAN,
    defaultPhone: DataTypes.STRING,
    defaultAddress: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    shopName: DataTypes.STRING,
    shopId: DataTypes.STRING,
    shopBirthday: DataTypes.STRING,
    shopAddress: DataTypes.STRING,
    shopBankName: DataTypes.STRING,
    shopBankBranch: DataTypes.STRING,
    shopAccountName: DataTypes.STRING,
    shopAccountNumber: DataTypes.STRING
  }, {})
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Order)
    User.hasMany(models.Product)
  }
  return User
}
