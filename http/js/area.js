function draw_area(viz, data, cycles, height, width, options) {

  var _main = {}
  var _all = {}

  _main.tip = d3.tip()
    .attr('class', 'd3-tip n')
    .offset([-10, 0])
    .html(function(d) { return "$" + d3.format(".2f")(d.values) + 'B' })

  _all.cycles = cycles
  _all.color_scale = d3.scale.category10()
  _all.data = data

  _main.margin = { top: 30, right: 30, bottom: 30, left: 50 }
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

  _main.area = d3.svg.area()
    .interpolate('monotone')
    .x(function(d) { return _main.x_scale(d3.format("02")(d.key % 100)) })
    .y0(_main.height - _main.margin.bottom)
    .y1(function(d) { return _main.y_scale(d.values) })

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

  _main.fig.call(_main.tip)

  update_main()

  function update_main() {

    _main.y_axis = d3.svg.axis().scale(_main.y_scale).orient('left')
      .innerTickSize(-_main.width)
      .outerTickSize(0)

    _main.fig.selectAll('g.y.axis')
      .attr('transform', 'translate(' + _main.margin.left + ', 0)')
        .call(_main.y_axis)
          
    var chart = _main.fig
      .append("g")
        .attr("class", "bars")
        .datum(_all.data)

    chart
      .append('path')
        .attr("class", "area")
        .transition()
        .duration(750)
        .attr("d",  _main.area)

    _main.fig
      .append("g")
        .attr("class", "points")
        .selectAll("rect")
          .data(_all.data).enter()
          .append('circle')
            .attr("class", "point")
            .attr("cx", function(d) { return _main.x_scale(d3.format("02")(d.key % 100)) })
            .attr("cy", function(d) { return 25 + _main.y_scale(d.values) })
            .attr("r", 30)
            .on('mouseover', _main.tip.show)
            .on('mouseout', _main.tip.hide)

    var markers = _main.fig
      .append('g')
        .attr('class', 'markers')

    markers
      .append('line')
        .attr('class', 'marker')
        .attr('stroke-dasharray', "5,5")
        .attr('x1', _main.x_scale("00"))
        .attr('y1', _main.margin.top)
        .attr('x2', _main.x_scale("00"))
        .attr('y2', _main.height - _main.margin.bottom)

    markers
      .append('line')
        .attr('class', 'marker')
        .attr('stroke-dasharray', "5,5")
        .attr('x1', (_main.x_scale("08") + _main.x_scale("12")) / 2)
        .attr('y1', _main.margin.top)
        .attr('x2', (_main.x_scale("08") + _main.x_scale("12")) / 2)
        .attr('y2', _main.height - _main.margin.bottom)

    markers
      .append('text')
        .text('2000 Pres. Election')
        .attr('x', _main.x_scale("00")-50)
        .attr('y', _main.margin.top - 5)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '0.9em')

    markers
      .append('text')
        .text('2010: Citizens United')
        .attr('x', ((_main.x_scale("08") + _main.x_scale("12")) / 2) -70)
        .attr('y', _main.margin.top - 5)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '0.9em')
  }

  return _main
}
