d3.csv("data/ic_org.csv")
  .row(function(d, i) { 
    return { 
      'Amount': parseInt(d['Amount']),
      'Cycle': parseInt(d['Cycle']),
      'EntityId': d['EntityId'],
      'Name': d['Name'],
      'Orgname': d['Orgname'],
      'Party': d['Party'],
      'PrimCode': d['PrimCode'],
      'RealCode': d['RealCode'],
      'Type': d['Type']
    }
  })
  .get(function(err, data) {

    if (err) console.log(err)

    var _top = {}
    var _bottom = {}
    var _all = {}

    var initial = [ 'Y4000', 'K1000', 'F2100' ]
    _all.unselected = []
    _all.selected = []
    _all.cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 
    _all.color_scale = d3.scale.category20()

    var data = data
      .filter(function(d) { return _all.cycle === undefined || d['Cycle'] == _all.cycle })

    _all.data = d3.nest()
      .key(function(d) { return d['RealCode'] })
      .key(function(d) { return d['Cycle'] })
        .rollup(function(ds) {
          var amt = d3.sum(ds.map(function(x) { return x['Amount'] })) / 1000
          if (amt < 0) return 0.0 
          else return amt
        })
      .entries(data)
      .map(function(d) { 
        var total = d3.sum(d['values'].map(function(x) { return x['values'] }))
        d['total'] = total
        return d
      })
      .sort(function(a, b) { return d3.descending(a['total'], b['total']) })
      .slice(0,20)

    _all.unselected = _all.data
    initial.forEach(function(el) {
      var idx = _all.unselected.map(function(d) { return d.key }).indexOf(el)
      if (idx >= 0) {
        _all.selected = _all.selected.concat(_all.unselected.splice(idx, 1))
      }
    })

    { // Generate top panel

      var margin = { top: 30, right: 30, bottom: 30, left: 40 }
      var height = 600 - margin.top - margin.bottom
      var width = 1000 - margin.left - margin.right

      _top.fig = d3.select('#viz')
        .append('div')
        .attr("class", 'contributions top')
          .append("svg")
            .attr("height", height)
            .attr("width", width)
  
      _top.x_scale = d3.scale.ordinal()
        .domain(_all.cycles)
        .rangePoints([margin.left, width - margin.right])

      _top.stack = d3.layout.stack()
        .values(function(d) { return d.values })
          .x(function(d) { return d3.format("02")(d.key % 100) })
          .y(function(d) { return d.values })

      var area = d3.svg.area()
        .interpolate('basis')
        .x(function(d) { return _top.x_scale(d3.format("02")(d['key'] % 100)) })
        .y0(function(d) { return _top.y_scale(d.y0) })
        .y1(function(d) { return _top.y_scale(d.y0 + d.y) })

      var real_codes = _top.stack(_all.selected)

      var y_max = d3.max(real_codes.map(function(d) { 
        return d3.max(d['values'].map(function(x) { return x.y0 + x.y }))
      }))

      _top.y_scale = d3.scale.linear()
        .domain([0, y_max])
        .range([height - margin.bottom, margin.top])

      var realcode = _top.fig.selectAll(".realcode")
        .data(real_codes, function(d) { return d.key })

      realcode
        .enter().append('g')
          .attr('class', 'realcode')
          .append('path')
            .attr("class", "area")
            .attr("d", function(d) { return area(d.values) })
            .attr('fill', function(d) { return _all.color_scale(d.key) })

      _top.fig.selectAll('.hotspot')
        .data(d3.set(_all.cycles).values())
          .enter().append('g')
            .attr('class', 'hotspot')
            .append('rect')
              .attr("class", "hotspots")
              .attr('x', function(d) { return _top.x_scale(d) - 20 })
              .attr("width", 40)
              .attr("y", function(d) { return 0 })
              .attr("height", function(d) { return height - margin.bottom  })
              .on('mouseover', function(d) { 
                _bottom.cycle = d 
                update_bottom()
              })
              .on('mouseout', function(d) {
                _bottom.cycle = undefined
                update_bottom()
              })


      _top.x_axis = d3.svg.axis().scale(_top.x_scale)
        .innerTickSize(-height)
        .outerTickSize(0)

      _top.fig.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
          .call(_top.x_axis)

      _top.y_axis = d3.svg.axis().scale(_top.y_scale).orient('left')
        .innerTickSize(-width)
        .outerTickSize(0)

      _top.fig.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + margin.left + ', 0)')
          .call(_top.y_axis)

      _top.fig.select('.y.axis')
        .append('text')
          .text('Contribution ($K)')
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left)
          .attr("x", -(height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
    }

    { // Generate main panel

      var margin = { top: 30, right: 30, bottom: 90, left: 40 }
      var height = 400 - margin.top - margin.bottom
      var width = 1000 - margin.left - margin.right

      _bottom.fig = d3.select("#viz")
        .append("div")
        .attr("class", 'bottom')
          .append("svg")
            .attr("height", height)
            .attr("width", width)

      update_bottom() 

      _bottom.x_axis = d3.svg.axis().scale(_bottom.x_scale)
        .innerTickSize(-height)
        .outerTickSize(0)

      _bottom.fig.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
          .call(_bottom.x_axis)

      _bottom.fig.selectAll('.x.axis text')
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) { return "rotate(-90)" });

      _bottom.y_axis = d3.svg.axis().scale(_bottom.y_scale).orient('left')
        .innerTickSize(-width)
        .outerTickSize(0)

      _bottom.fig.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + margin.left + ', 0)')
          .call(_bottom.y_axis)

      _bottom.fig.select('.x.axis')
        .append('text')
          .text('Industry/Ideology')
          .attr('x', (width/5)- margin.left)
          .attr('y', margin.bottom / 1.5)

      _bottom.fig.select('.y.axis')
        .append('text')
          .text('Contribution ($K)')
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left)
          .attr("x", -(height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
    }

    function update_bottom() {

      var my_data = _all.data

      _bottom.x_scale = d3.scale.ordinal()
        .domain(_all.data.map(function(d) { return d['key'] }))
        .rangeBands([margin.left, width], 0.1, 0.1)

      var y_extent = d3.extent(_all.data, function(d) { return d['total'] })

      _bottom.y_scale = d3.scale.linear()
        .domain(y_extent)
        .range([height - margin.bottom, margin.top])

      var chart = _bottom.fig.selectAll("rect")
        .data(my_data, function(d) { return d.key })

      console.log(my_data)

      chart
        .transition()
        .attr("x", function(d) { return _bottom.x_scale(d['key']) })
        .attr("width", _bottom.x_scale.rangeBand())
        .attr("y", function(d) { return _bottom.y_scale(d['total']) })
        .attr("height", function(d) { return height - margin.bottom - _bottom.y_scale(d['total']) })

      chart
        .enter().append("rect")
          .attr("x", function(d) { return _bottom.x_scale(d['key']) })
          .attr("width", _bottom.x_scale.rangeBand())
          .attr("y", function(d) { return _bottom.y_scale(d['total']) })
          .attr("height", function(d) { return height - margin.bottom - _bottom.y_scale(d['total']) })
          .attr('fill', function(d) { return _all.color_scale(d['key']) })
          .attr("class", function(d) { return "bar " + d['key'] })
          .on("mouseover", function(d) { 
            d3.selectAll('.' + d['key']).classed('highlighted', true) })
          .on("mouseout", function(d) { 
            d3.selectAll('.highlighted').classed('highlighted', false) })
          .on("click", function(d) {
            var idx = _all.selected.map(function(d) { return d.key }).indexOf(d.key)
            var un_idx = _all.unselected.map(function(d) { return d.key }).indexOf(d.key)
            if (idx >= 0) {
              _all.unselected = _all.unselected.concat(_all.selected.splice(idx, 1))
            } else if (un_idx >= 0) {
              _all.selected = _all.selected.concat(_all.unselected.splice(un_idx, 1))
            }

            update_top()
          })

      chart.exit().remove()
    }

    function update_top() {

      var real_codes = _top.stack(_all.selected)

      var y_max = d3.max(real_codes.map(function(d) { 
        return d3.max(d['values'].map(function(x) { return x.y0 + x.y }))
      }))

      _top.y_scale = d3.scale.linear()
        .domain([0, y_max])
        .range([height - margin.bottom, margin.top])
      var selection = _top.fig 
        .selectAll('g.realcode')
          .data(real_codes, function(d) { return d.key })

      var realcode = _top.fig.selectAll(".realcode")
        .data(real_codes, function(d) { return d.key })

      selection.selectAll('path')
        .transition()
        .duration(500)
          .attr("d", function(d) { return area(d.values) })
            
      selection.enter()
        .append('g')
          .attr('class', 'realcode')
          .append('path')
            .attr("class", "area")
            .transition()
            .duration(500)
            .attr("d", function(d) { return area(d.values) })
            .attr('fill', function(d) { return _all.color_scale(d.key) })

      selection.exit()
        .remove()
          .transition()
          .duration(500)

    }
})
