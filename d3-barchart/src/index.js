import * as d3 from 'd3';
import './style.css';

const DATA_URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const root =  d3.select('body')
                .append('div')
                .attr('id', 'root');

const tipNode = root.append('div').attr('id', 'tip');
tipNode.append('div').classed('value', true);
tipNode.append('div').classed('date', true);

const WIDTH = 800;
const HEIGHT = 600;
const MARGIN = 40;

const svg = 
    root
    .append('svg')
    .attr('viewBox', `0 0 ${WIDTH + 2*MARGIN} ${HEIGHT + 2*MARGIN}`)
    .style('flex', '1')
    .append('g')
        .attr('transform', `translate(${MARGIN}, ${MARGIN})`)

const x = d3.scaleTime()
            .rangeRound([0, WIDTH]);

const y = d3.scaleLinear()
            .rangeRound([0, HEIGHT]);

const parseDate = d3.timeParse("%Y-%m-%d");
const formatValue = d3.format("$,.2f");
const formatDate = d3.timeFormat("%B %Y");
const tip = root.select('#tip');

d3.json(DATA_URL, (error, rawData) => {
    const data = rawData.data.map(d => ({date: parseDate(d[0]), value: d[1]})); 

    const extentDate = d3.extent(data, d => d.date);
    const maxValue = d3.max(data, d => d.value);
    
    x.domain(extentDate);
    y.domain([maxValue, 0]);

    svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${HEIGHT})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y))
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', '1.2em')
          .attr('fill', '#000')
          .text('GDP');

    const barWidth = Math.ceil(WIDTH / data.length);
    const bar = svg.selectAll('rect.bar')
        .data(data)
        .enter().append('rect')
            .classed('bar', true)
            .attr('x', d => x(d.date))
            .attr('y', d => y(d.value))
            .attr('height', d => HEIGHT - y(d.value))
            .attr('width', barWidth + 1)
            .attr('fill', 'steelblue')
            .on('mouseenter', function(d) {
              tip.select('.value').text(`${formatValue(d.value)} Billions`);
              tip.select('.date').text(formatDate(d.date));
              tip.style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 50) + "px")
                 .classed('visible', true);
            })
            .on('mouseleave', function(d) {
              tip.classed('visible', false);
            })
});