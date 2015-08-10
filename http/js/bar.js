function draw_bar(viz, data, xs, height, width, options) {

  var _main = {}
  var _all = {}

  _all.xs = xs
  _all.color_scale = d3.scale.category20()
  _all.data = data
    .sort(function(a, b) { return d3.descending(a.values, b.values) })

  _main.margin = { top: 30, right: 30, bottom: 30, left: 50 }
  _main.height = height - _main.margin.top - _main.margin.bottom
  _main.width = width - _main.margin.left - _main.margin.right

  _main.fig = viz 
    .append("svg")
      .attr("height", _main.height)
      .attr("width", _main.width)

  _main.x_scale = d3.scale.ordinal()
    .domain(_all.xs)
    .rangeBands([_main.margin.left, _main.width], 0.1, 0.1)

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
      .text(options.main.x_label)
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
      .text(options.main.y_label)
      .attr("transform", "rotate(-90)")
      .attr("y", -_main.margin.left)
      .attr("x", -(_main.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")

  _main.y_axis = d3.svg.axis().scale(_main.y_scale).orient('left')
    .innerTickSize(-_main.width)
    .outerTickSize(0)

  _main.fig.selectAll('g.y.axis')
    .attr('transform', 'translate(' + _main.margin.left + ', 0)')
      .call(_main.y_axis)
        
  _main.fig.append("g")
    .attr("class", "bars")
      .selectAll("rect")
        .data(_all.data, function(d) { return d.key })
          .enter()
          .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return _main.x_scale(d.key) })
            .attr("width", _main.x_scale.rangeBand())
            .attr("y", function(d) { return _main.y_scale(d.values) })
            .attr("height", function(d) { return _main.height - _main.margin.bottom - _main.y_scale(d.values) })
            .attr('fill', function(d) { return _all.color_scale(d.key) })

  return _main
}
