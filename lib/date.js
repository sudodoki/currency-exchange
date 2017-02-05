const d3 = require('d3');

const { times } = require('./utils');

const dayInMs = 24*60*60*1000;

const getYearMonthDayArr = (date = new Date) => (
  [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ]
)

const initTimeFrame = (daysToDisplay) => {
  const [year, month, day] = getYearMonthDayArr();
  const endOfScale = new Date(year, month, day);
  const startOfScale = new Date;
  startOfScale.setTime(endOfScale.getTime() - dayInMs * daysToDisplay)

  const dateEnumerator = d3.scaleTime()
    .domain([startOfScale, endOfScale ])
    .range([0, daysToDisplay - 1])

  const listOfDates = times(daysToDisplay, (period) => dateEnumerator.invert(period))
  return [startOfScale, endOfScale, listOfDates]
}
module.exports = {initTimeFrame, getYearMonthDayArr};
