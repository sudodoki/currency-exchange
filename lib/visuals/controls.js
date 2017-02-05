const d3 = require('d3');
const initControls = (containerId) =>
  d3.select(`#${containerId}`).append('div').attr('class', 'controls');

module.exports = { initControls };
