const d3 = require('d3');
require('d3-request'); // install d3.json
const currencies = require('./currencies');

const request = (url) =>
  new Promise((resolve, reject) => {
    d3.json(url, (err, data) => {
      if (err) { return reject(err); }
      return resolve(data);
    })
  })

const host = "https://api.fixer.io";

const getData = (base, symbol, listOfPaths, listOfLabels) => {
  return Promise.all(listOfPaths.map((asPath, index) => {
    return request(`${host}/${asPath}?base=${base}&symbols=${symbol}`)
      .then(data =>
        Object.assign({}, data, { label: listOfLabels[index] }))
    })
  ).then((datapoints) => {
    return datapoints.map(datapoint => ({
      meta: { base, symbol },
      label: datapoint.label,
      value: Object.values(datapoint.rates)[0]
    }))
  }, (err) => { alert('err is ', err); throw err; })
}
module.exports = {
  currencies,
  getData
};
