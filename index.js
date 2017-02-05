const d3 = require('d3');
require('./lib/optimizedResize');

const { initTimeFrame, getYearMonthDayArr } = require('./lib/date');
const { zeroPad } = require('./lib/utils');
const { getData, currencies } = require('./lib/rates');

const { Chart, reflectDateInTitle, indicateCurrencies, initControls } = require('./lib/visuals');

const daysToDisplay = 20;
const [startOfScale, endOfScale, listOfDates] = initTimeFrame(daysToDisplay);

const listOfPaths = listOfDates.map(date => {
  const [year, month, day] = getYearMonthDayArr(date);
  const asPath = [year, month + 1, day].map(zeroPad(2)).join('-');
  return asPath
})
const listOfLabels = listOfDates.map(date =>
  date.toLocaleString('en-us', { month: 'short', day: '2-digit' })
);

const setFromToFromHash = () => {
  [possibleFrom, possibleTo] = location.hash.slice(1).split('/');
  from = currencies.includes(possibleFrom) ? possibleFrom : currencies[0];
  to = currencies.includes(possibleTo) ? possibleTo : currencies[1];
}

reflectDateInTitle(startOfScale);
setFromToFromHash();
indicateCurrencies(from, to, (base, symbol) => location.hash = `${base}/${symbol}`);

// TODO: remove selects and stuff into lib/controls
const controls = initControls('graph-container')

const chart = new Chart('graph-container', {
  margin: { top: 40, right: 20, bottom: 20, left: 20},
  yTextPadding: 10,
  minHeight: 20
});

const reflectData = (datapoints) => {
  chart.setData(datapoints);
  chart.redraw();
}

const fromSelect = controls.selectAll('[name="from"]')
  .data([from])
  .enter()
  .append('select')
  .attr('name', 'from')
  .attr('value', d => d)

controls.append('button').attr('class', 'js-swap-btn').text('/')
    .on('click', function () {
      // relying on DOM structure here
      this.parentNode.firstChild.value = to;
      this.parentNode.lastChild.value = from;
      [from, to] = [to, from];
      reflectOptions(from, to);
      indicateCurrencies(from, to);
      getData(from, to, listOfPaths, listOfLabels).then(reflectData);
    })
const toSelect = controls.selectAll('[name="to"]')
  .data([to])
  .enter()
  .append('select')
  .attr('name', 'to')
  .attr('value', d => d)

const reflectOptions = (from, to) => {
  toSelect
    .data([to])
    .attr('value', d => d)
    .selectAll('option').data(currencies.filter(i => i !== from))
    .enter()
    .append('option')
    .exit()
    .remove();
  toSelect
    .selectAll('option')
    .text(d => d)
    .each(function(d){
      if (to === d) { this.selected = true; }
    })
  fromSelect
    .data([from])
    .attr('value', d => d)
    .selectAll('option').data(currencies.filter(i => i !== to))
    .enter()
    .append('option')
    .exit()
    .remove();
  fromSelect
    .selectAll('option')
    .text(d => d)
    .each(function(d){
      if (from === d) { this.selected = true; }
    })
}

d3.select('[name="from"]').on('change', function (){
  from = this.value;
  reflectOptions(from, to);
  indicateCurrencies(from, to);
  getData(from, to, listOfPaths, listOfLabels).then(reflectData);
})
d3.select('[name="to"]').on('change', function (){
  to = this.value;;
  reflectOptions(from, to);
  indicateCurrencies(from, to);
  getData(from, to, listOfPaths, listOfLabels).then(reflectData);
});

reflectOptions(from, to)
getData(from, to, listOfPaths, listOfLabels).then(reflectData);
