module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  ifNotCond: function (a, b, options) {
    if (a !== b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  ifTrue: function (a, options) {
    if (a === true) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}
