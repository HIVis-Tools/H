if (typeof biojs === 'undefined') {
  module.exports = biojs = {}
}
if (typeof biojs.io === 'undefined') {
  module.exports = biojs.vis = {}
}
biojs.vis.H = require('./')
