const d3 = require('d3');
const controls = require('./controls');
// even though I would prefer FP-ish, we need to 'init' chart
// and set some listeners and either update data or update sizes
// so it makes sense to have it as class
class Chart {
  constructor(containerId, options) {
    this.container = document.getElementById(containerId);
    Object.assign(this, options);

    this.svg = d3.select(`#${containerId}`).append('svg')
    this.canvas = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left} ${this.margin.top})`);
    this.axis = this.canvas.append('g').attr('class', 'x-axis')
    this.info = d3.select(`#${containerId}`).append('div').attr('class', 'info-bar');
    this.resetDimensions()
    window.addEventListener("optimizedResize", () => {
      this.resetDimensions();
      this.redraw();
    });
  }
  resetDimensions() {
    const { width: containerWidth, height: containerHeight } = this.container.getBoundingClientRect();
    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = containerHeight - this.margin.top - this.margin.bottom;
    this.svg
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)

  }
  setData(datapoints) {
    this.datapoints = datapoints;
  }
  redraw() {
    const values = this.datapoints.map(d => d.value);
    const labels = this.datapoints.map(d => d.label);

    const xScale = d3.scaleBand()
      .domain(labels)
      .range([0, this.width])
      .paddingInner(0.1)
      .paddingOuter(0.1)

    const yScale = d3.scaleLog()
      .domain([Math.min(...values), Math.max(...values)])
      .range([this.minHeight, this.height])

    const median = d3.median(values);
    const deviation = d3.deviation(values);
    this.drawMedianLine(median, yScale);
    this.displayInfo(median, deviation);
    const bars = this.drawLabeledBars(xScale, yScale, median);
    this.drawLabelAxis(labels, bars);
  }

  drawMedianLine(median, yScale) {
    const medianSelection = this.canvas.selectAll('g.median')
    medianSelection
      .data([median])
      .enter()
      .append('g')
      .attr('class', 'median')
      .append('path')
      .attr('d', `M0,0H${this.width}`)
      .attr('transform', `translate(0, ${this.height - yScale(median)})`)
    medianSelection.select('path')
      .transition()
      .attr('transform', `translate(0, ${this.height - yScale(median)})`)
  }

  displayInfo(median, deviation) {
    this.info.selectAll('.median-info')
      .data([median])
      .enter()
      .append('span')
      .attr('class', 'median-info')
      .text((d) => `Median: ${d3.format('.2f')(d)}`);

    this.info.selectAll('.median-info')
      .text((d) => `Median: ${d3.format('.2f')(d)}`);
    this.info.selectAll('.deviation-info')
      .data([deviation])
      .enter()
      .append('span')
      .attr('class', 'deviation-info')

    this.info.selectAll('.deviation-info')
      .text((d) => `Standard deviation: ${d3.format('.2f')(d)}`);
  }

  drawLabeledBars(xScale, yScale, median) {
    this.canvas.selectAll('rect')
      .data(this.datapoints)
      .enter()
      .append('rect')
      .attr('class', 'bar')

    this.canvas.selectAll('rect')
      .attr('x', d => xScale(d.label))
      .attr('width', xScale.bandwidth())
      .classed('up', d => d.value > median)
      .classed('down', d => d.value < median)
      .transition()
      .attr('y', d => this.height - yScale(d.value))
      .attr('height', d => yScale(d.value));

    this.canvas.selectAll('.bartext')
      .data(this.datapoints)
      .enter()
      .append('text')
      .attr('class', 'bartext')

    this.canvas.selectAll('.bartext')
      .transition()
      .attr('x', d => xScale(d.label) + xScale.bandwidth()/2)
      .attr('y', d => this.height - yScale(d.value) - this.yTextPadding)
      .text(d => {
        // TODO: can be memoized
        return d3.format('.2f')(d.value);
      });
    hideOverlapping(this.canvas.selectAll('.bartext'))
    return this.canvas.selectAll('rect');
  }

  drawLabelAxis(labels, bars) {
    const labelScale = d3.scaleBand()
      .domain(labels)
      .range([0, this.width]);

    const axis = d3.axisBottom(labelScale).tickSize(0)
    this.axis
      .attr('transform', `translate(0, ${this.height})`)
      .call(axis);

     const ticks = this.canvas.selectAll('.tick')
     hideOverlapping(ticks);

     ticks
       .on('mouserover', null)
       .on('mouseout', null)
       .on('mouseover', (_val, index) => {
         bars.filter((_d, i) => i === index)
          .classed('hover', true)
        })
       .on('mouseout', (_val, index) => {
         bars.filter((_d, i) => i === index)
          .classed('hover', false)
        })
  }

}

const hideOverlapping = (d3TextNodesSelection) => {
  let all;
  d3TextNodesSelection.each(function (_val, index, all) {
    all = all || Array.from(all);
    if (index < all.length - 1) {
      const next = all[index + 1]
      // TODO: can avoid getBoundingClientRect extra call
      const isOverlapping = this.getBoundingClientRect().right > next.getBoundingClientRect().left && !this.classList.contains('hidden');
      if (isOverlapping) {
        next.classList.add('hidden');
      }
    }
  })
}


// not handling possibility user is browsing over midnight
const reflectDateInTitle = (date) =>
  d3.select('.js-exchange-date').text(
    date.toLocaleString('en-us', { month: 'short', day: '2-digit', year: 'numeric' })
  )
const indicateCurrencies = (base, symbol, cb) => {
  d3.select('.js-exchange-pair').text(`${base}/${symbol}`);
}
module.exports = Object.assign({
  Chart,
  reflectDateInTitle,
  indicateCurrencies,
}, controls)
