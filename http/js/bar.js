function draw_bar(viz, data, height, width, margin) {

  var _main = {}
  var _all = {}

  _all.cycles = cycles
  _all.color_scale = d3.scale.category20()
  _all.data = data

  _main.margin = margin
  _main.height = height - _main.margin.top - _main.margin.bottom
  _main.width = width - _main.margin.left - _main.margin.right

  _main.fig = viz 
    .append('div')
    .attr("class", 'viz_area')
      .append("svg")
        .attr("height", _main.height)
        .attr("width", _main.width)

  _main.x_scale = d3.scale.ordinal()
    .domain(_all.cycles)
    .rangePoints([_main.margin.left, _main.width - _main.margin.right])

  _main.y_max = d3.max(_all.data.map(function(d) { return d.values }))

  _main.y_scale = d3.scale.linear()
    .domain([0, _main.y_max])
    .range([_main.height - _main.margin.bottom, _main.margin.top])

  _main.fig.append('g')
    .attr('class', 'x axis')

  _main.x_axis = d3.svg.axis().scale(_main.x_scale)
    .innerTickSize(-_main.height)
    .outerTickSize(0)

  _main.fig.select('.x.axis')
    .append('text')
      .text('Year')
      .attr('x', (_main.width/2) - _main.margin.left)
      .attr('y', _main.height)

  _main.fig.append('g')
    .attr('class', 'y axis')

  _main.fig.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + (_main.height - _main.margin.bottom) + ')')
      .call(_main.x_axis)

  _main.fig.select('.y.axis')
    .append('text')
      .text('Contribution ($B)')
      .attr("transform", "rotate(-90)")
      .attr("y", -_main.margin.left)
      .attr("x", -(_main.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")

  update_main()

  function update_main() {

    _main.y_axis = d3.svg.axis().scale(_main.y_scale).orient('left')
      .innerTickSize(-_main.width)
      .outerTickSize(0)

    _main.fig.selectAll('g.y.axis')
      .attr('transform', 'translate(' + _main.margin.left + ', 0)')
        .call(_main.y_axis)
          
    var chart = _main.fig.datum(_all.data)

    chart
      .append('path')
        .attr("class", "area")
        .transition()
        .duration(750)
        .attr("d",  _main.area)

    _main.fig.selectAll('circle').data(_all.data)
      .enter().append('circle')
        .attr('class', function(d) { return d.key })
        .attr('cx', function(d) { return _main.x_scale(d3.format("02")(d.key % 100)) })
        .attr('cy', function(d) { return _main.y_scale(d.values) })
        .attr("r", 3)
  }

  return _main
}
