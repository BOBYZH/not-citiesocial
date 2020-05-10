const moment = require('moment')
moment.locale('zh-tw')

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
  },
  momentLLLL: function (a) {
    return moment(a).format('LLLL')
  },
  momentFromNow: function (a) {
    return moment(a).fromNow()
  }
}
