const DATA_URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const WIDTH = 800;
const HEIGHT = 600;
const margin = {
    left: 40,
    right: 90,
    bottom: 40,
    top: 40
};

const x = d3.scaleLinear().range([0, WIDTH]);
const y = d3.scaleLinear().range([0, HEIGHT]);
const color = d3.scaleOrdinal(d3.schemeCategory10);
const formatTime = v => d3.timeFormat("%M:%S")(new Date(v*1000));

const xAxis = d3.axisBottom().scale(x).tickFormat(formatTime);
const yAxis = d3.axisLeft().scale(y);

const svg = d3.select('#root').append('svg')
    .attr('viewBox', `0 0 ${WIDTH + margin.left + margin.right} ${HEIGHT + margin.top + margin.bottom}`)
    .style('flex', '1')
    .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

const tip = d3.select('#tip');

d3.json(DATA_URL, function(error, data) {
    const [minSeconds, maxSeconds] = d3.extent(data, d => +d.Seconds);
    data.forEach(d => d.diff = d.Seconds - minSeconds);
    
    const maxPlace =d3.max(data, d => +d.Place); 
    x.domain([5 + maxSeconds - minSeconds, 0]);
    y.domain([1, maxPlace + 1])
    
    yAxis.tickValues(d3.range(1, maxPlace + 1));


    svg.append('g')
        .classed('axis axis--x', true)
        .attr('transform', `translate(0, ${HEIGHT})`)
        .call(xAxis)
    .append('text')
        .classed('label', true)
        .attr('x', WIDTH)
        .attr('y', -6)
        .style('text-anchor', 'end')
        .text('minutes behind the leader');
    
    svg.append('g')
        .classed('axis axis--y', true)
        .call(yAxis)
    .append('text')
        .classed('label', true)
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('place');
    
    var item = svg.selectAll('.dot')
        .data(data)
    .enter().append('g')
        .attr('class', 'item')
        .attr('transform', d => 
              `translate(${x(d.diff)}, ${y(d.Place)})`)
        .on('mouseenter', function(d) {
            tip.html(`
                <div class="name">${d.Name}</div>
                <div class="info">Year: ${d.Year}, time: ${d.Time}</div>
                <div class="doping">${d.Doping}</div>
               `)
               .classed('visible', true)
               .style('left', `${d3.event.pageX - 20}px`)
               .style('top', `${d3.event.pageY - 65}px`);
        })
        .on('mouseleave', function(d) {
            tip.classed('visible', false);
        });
    
    item.append('circle')
        .attr('r', 3.5)
        .attr('fill', d => color(d.Doping ? 'Riders with doping allegations' : 'No doping allegations'))
    
    item.append('text')
        .attr('dy', '0.35em')
        .attr('dx', '0.7em')
        .text(d => d.Name);

    const legend = svg.selectAll('.legend')
        .data(color.domain())
    .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(0, ${HEIGHT - 80 - i * 20})`);
    
    legend.append('rect')
        .attr('x', WIDTH - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);
    
    legend.append('text')
        .attr('x', WIDTH - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(d => d);
});