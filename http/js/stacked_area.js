function draw_stacked_area(viz, data, cycles, initial, height, width, options) {

  var _top = {}
  var _bottom = {}
  var _all = {}

  _all.cycles = cycles
  _all.color_scale = d3.scale.category20()
  _all.data = data

  _all.selected = []
  _all.unselected = []

  _all.unselected = _all.data.slice()
  initial.forEach(function(el) {
    var idx = _all.unselected.map(function(d) { return d.key }).indexOf(el)
    if (idx >= 0) {
      _all.selected = _all.selected.concat(_all.unselected.splice(idx, 1))
    }
  })

  { // Generate top panel

    _top.margin = { top: 30, right: 30, bottom: 30, left: 50 }
    _top.height = (6 * height / 10) - _top.margin.top - _top.margin.bottom
    _top.width = width - _top.margin.left - _top.margin.right

    _top.fig = viz 
      .append('div')
      .attr("class", 'stacked top')
        .append("svg")
          .attr("height", _top.height)
          .attr("width", _top.width)

    _top.x_scale = d3.scale.ordinal()
      .domain(_all.cycles)
      .rangePoints([_top.margin.left, _top.width - _top.margin.right])

    _top.stack = d3.layout.stack()
      .values(function(d) { return d.values })
        .x(function(d) { return d3.format("02")(d.key % 100) })
        .y(function(d) { return d.values })

    var area = d3.svg.area()
      .interpolate('monotone')
      .x(function(d) { return _top.x_scale(d3.format("02")(d['key'] % 100)) })
      .y0(function(d) { return _top.y_scale(d.y0) })
      .y1(function(d) { return _top.y_scale(d.y0 + d.y) })

    var real_codes = _top.stack(_all.selected)

    var y_max = d3.max(real_codes.map(function(d) { 
      return d3.max(d['values'].map(function(x) { return x.y0 + x.y }))
    }))

    _top.y_scale = d3.scale.linear()
      .domain([0, y_max])
      .range([_top.height - _top.margin.bottom, _top.margin.top])

    var realcode = _top.fig.selectAll(".realcode")
      .data(real_codes, function(d) { return d.key })

    _top.fig.append('g')
      .attr('class', 'x axis')

    _top.x_axis = d3.svg.axis().scale(_top.x_scale)
      .innerTickSize(-_top.height)
      .outerTickSize(0)

    _top.fig.select('.x.axis')
      .append('text')
        .text(options.top.x_label)
        .attr('x', (_top.width/2) - _top.margin.left)
        .attr('y', _top.height)

    _top.fig.append('g')
      .attr('class', 'y axis')

    _top.fig.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (_top.height - _top.margin.bottom) + ')')
        .call(_top.x_axis)

    _top.fig.select('.y.axis')
      .append('text')
        .text(options.top.y_label)
        .attr("transform", "rotate(-90)")
        .attr("y", -_top.margin.left)
        .attr("x", -(_top.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
  }

  { // Generate main panel

    _bottom.margin = { top: 30, right: 30, bottom: 90, left: 50 }
    _bottom.height = (4 * height / 10) - _bottom.margin.top - _bottom.margin.bottom
    _bottom.width = width - _bottom.margin.left - _bottom.margin.right

    _bottom.fig = viz
      .append("div")
      .attr("class", 'bottom')
        .append("svg")
          .attr("height", _bottom.height)
          .attr("width", _bottom.width)

    _bottom.fig.append('g')
      .attr('class', 'x axis')

    _bottom.x_scale = d3.scale.ordinal()
      .domain(_all.data.map(function(d) { return d['key'] }))
      .rangeBands([_bottom.margin.left, _bottom.width], 0.1, 0.1)

    _bottom.x_axis = d3.svg.axis().scale(_bottom.x_scale)
      .innerTickSize(-_bottom.height)
      .outerTickSize(0)

    _bottom.fig.selectAll('g.x.axis')
      .attr('transform', 'translate(0,' + (_bottom.height - _bottom.margin.bottom) + ')')
        .call(_bottom.x_axis)

    _bottom.fig.append('g')
      .attr('class', 'y axis')

    _bottom.fig.selectAll('.x.axis text')
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) { return "rotate(-90)" });

    _bottom.fig.select('.x.axis')
      .append('text')
        .text(options.bottom.x_label)
        .attr('x', (_bottom.width/2) - _bottom.margin.left)
        .attr('y', _bottom.margin.bottom / 1.5)

    _bottom.fig.select('.y.axis')
      .append('text')
        .text(options.bottom.y_label)
        .attr("transform", "rotate(-90)")
        .attr("y", -_bottom.margin.left)
        .attr("x", -(_bottom.height / 2.5))
        .attr("dy", "1em")
        .style("text-anchor", "middle")

  }

  update_top()
  update_bottom() 

  _all.unselected.forEach(function(d) { d3.selectAll('.' + d.key).classed('unselected', true) })
  _all.selected.forEach(function(d) { d3.selectAll('.' + d.key).classed('unselected', false) })

  function update_top() {

    var real_codes = _top.stack(_all.selected)

    _all.unselected.forEach(function(d) { d3.selectAll('.' + d.key).classed('unselected', true) })
    _all.selected.forEach(function(d) { d3.selectAll('.' + d.key).classed('unselected', false) })

    var y_max = d3.max(real_codes.map(function(d) { 
      return d3.max(d['values'].map(function(x) { return x.y0 + x.y }))
    }))

    _top.y_scale = d3.scale.linear()
      .domain([0, y_max])
      .range([_top.height - _top.margin.bottom, _top.margin.top])
    var selection = _top.fig 
      .selectAll('g.realcode')
        .data(real_codes, function(d) { return d.key })

    var realcode = _top.fig.selectAll(".realcode")
      .data(real_codes, function(d) { return d.key })

    _top.y_axis = d3.svg.axis().scale(_top.y_scale).orient('left')
      .innerTickSize(-_top.width)
      .outerTickSize(0)

    _top.fig.selectAll('g.y.axis')
      .attr('transform', 'translate(' + _top.margin.left + ', 0)')
        .call(_top.y_axis)

    selection.selectAll('path')
      .transition()
      .duration(100)
        .attr("d", function(d) { return area(d.values) })
          
    selection.enter()
      .append('g')
        .attr('class', 'realcode')
        .append('path')
          .attr("class", "area")
          .attr('fill', function(d) { return _all.color_scale(d.key) })
          .transition()
          .duration(750)
          .attr("d", function(d) { return area(d.values) })

    selection.exit()
      .remove()
        .transition()
        .duration(500)

    _top.fig.selectAll('.hotspot').remove()

    _top.fig.selectAll('.hotspot')
      .data(d3.set(_all.cycles).values())
        .enter().append('g')
          .attr('class', 'hotspot')
          .append('rect')
            .attr("class", "hotspots")
            .attr('x', function(d) { return _top.x_scale(d) - 15 })
            .attr("width", 30)
            .attr("y", function(d) { return 0 })
            .attr("height", function(d) { return _top.height - _top.margin.bottom  })
            .on('mouseover', function(d) { 
              _bottom.cycle = d 
              update_bottom()
            })
            .on('mouseout', function(d) {
              _bottom.cycle = undefined
              update_bottom()
            })
  }

  function update_bottom() {

    var my_data = _all.data

    if (_bottom.cycle) {
      my_data = my_data.map(function(d) { 
        var total = d3.sum(d['values']
          .filter(function(d) { return d3.format("02")(d.key % 100) == _bottom.cycle })
          .map(function(x) { return x['values'] }))
        return { 'key': d.key, 'total': total }
      })
      .sort(function(a, b) { return d3.descending(a['total'], b['total']) })
    }

    var bars = _bottom.fig.selectAll("rect")
      .data(my_data, function(d) { return d.key })

    var y_max = d3.max(my_data.map(function(d) { return d['total'] }))

    _bottom.y_scale = d3.scale.linear()
      .domain([0, y_max])
      .range([_bottom.height - _bottom.margin.bottom, _bottom.margin.top])

    _bottom.y_axis = d3.svg.axis().scale(_bottom.y_scale).orient('left')
      .innerTickSize(-_bottom.width)
      .outerTickSize(0)

    _bottom.fig.selectAll('g.y.axis')
      .attr('transform', 'translate(' + _bottom.margin.left + ', 0)')
        .call(_bottom.y_axis)

    bars 
      .transition()
      .attr("x", function(d) { return _bottom.x_scale(d['key']) })
      .attr("width", _bottom.x_scale.rangeBand())
      .attr("y", function(d) { return _bottom.y_scale(d['total']) })
      .attr("height", function(d) { return _bottom.height - _bottom.margin.bottom - _bottom.y_scale(d['total']) })

    bars 
      .enter()
      .append("rect")
        .attr("x", function(d) { return _bottom.x_scale(d['key']) })
        .attr("width", _bottom.x_scale.rangeBand())
        .attr("y", function(d) { return _bottom.y_scale(d['total']) })
        .attr("height", function(d) { return _bottom.height - _bottom.margin.bottom - _bottom.y_scale(d['total']) })
        .attr('fill', function(d) { return _all.color_scale(d['key']) })
        .attr("class", function(d) { return "bar " + d['key'] })
        .on("click", function(d) {
          var keys_selected = _all.selected.map(function(d) { return d.key })
          var idx = keys_selected.indexOf(d.key)
          var keys_unselected = _all.unselected.map(function(d) { return d.key })
          var un_idx = keys_unselected.indexOf(d.key)

          if (idx >= 0) {
            _all.unselected = _all.unselected.concat(_all.selected.splice(idx, 1))
          } else if (un_idx >= 0) {
            _all.selected = _all.selected.concat(_all.unselected.splice(un_idx, 1))
          }
        
          update_top()
        })

    bars.exit()
      .remove()
      .transition()
  }
}
