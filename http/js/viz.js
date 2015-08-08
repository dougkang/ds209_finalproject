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

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) })
    var cycle = undefined 
    var data = data
      .filter(function(d) { return cycle === undefined || d['Cycle'] == cycle })

    var data = d3.nest()
      .key(function(d) { return d['RealCode'] })
      .key(function(d) { return d['Cycle'] })
        .rollup(function(ds) {
          return d3.sum(ds.map(function(x) { return x['Amount'] })) / 1000
        })
      .entries(data)
      .map(function(d) { 
        var total = d3.sum(d['values'].map(function(x) { return x['values'] }))
        d['total'] = total
        return d
      })
      .sort(function(a, b) { return d3.descending(a['total'], b['total']) })

    { // Generate side panel

      var margin = { top: 10, right: 15, bottom: 15, left: 7 }
      var height = 80 - margin.top - margin.bottom
      var width = 280 - margin.left - margin.right

      var sidebar = d3.select('#viz')
        .append('div')
        .attr("class", 'left col-md-4 panel panel-default')
          .append('div')
            .attr("class", 'panel-body')
  
      var x_scale = d3.scale.ordinal()
        .domain(cycles)
        .rangePoints([margin.left, width - margin.right])

      var y_max = d3.max(data.map(function(d) { 
        return d3.max(d['values'].map(function(x) { return x['values'] }))
      }))

      var y_scale = d3.scale.linear()
        .domain([0, y_max])
        .range([height - margin.bottom, margin.top])

      data.forEach(function(d) {

        var panel = sidebar
          .append('div') 
          .attr("class", 'spark')

        panel.append("h5").text(d['key'])
          .attr('style', 'margin-left: 7px')

        var fig = panel
          .append("svg")
            .attr("height", height)
            .attr("width", width)

        var key = d['key']
        var data = d['values']
          .sort(function(a, b) { return d3.ascending(a['key'], b['key']) })

        var area = d3.svg.area()
          .interpolate("monotone") 
          .x(function(d) { return x_scale(d3.format("02")(d['key'] % 100)) })
          .y0(height - margin.bottom)
          .y1(function(d) { return y_scale(d["values"]) } )

        fig.append("path")
          .datum(data)
          .attr("class", "area " + d['key'])
          .attr("d", area)
          .on("mouseover", function() { 
            d3.selectAll('.' + d['key']).classed('highlighted', true) })
          .on("mouseout", function(d) { 
            d3.selectAll('.highlighted').classed('highlighted', false) })

        fig.selectAll("circle")
          .data(data)
            .enter().append("circle")
              .attr("class", "point " + d['key'])
              .attr('cx', function(d) { return x_scale(d3.format("02")(d['key'] % 100)) })
              .attr('cy', function(d) { return y_scale(d["values"]) } )
              .attr('r', 10)
              .attr('opacity', 0.0)
              .on("mouseover", function() { 
                d3.selectAll('.' + d['key']).classed('highlighted', true) })
              .on("mouseout", function(d) { 
                d3.selectAll('.highlighted').classed('highlighted', false) })

        var x_axis = d3.svg.axis().scale(x_scale)
          .innerTickSize(-height)
          .outerTickSize(0)

        fig.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
            .call(x_axis)

        fig.selectAll('.tick')
          .on("mouseover", function(d) { console.log(d) })
      })
    }

    { // Generate main panel

      var margin = { top: 30, right: 30, bottom: 90, left: 40 }
      var height = 950 - margin.top - margin.bottom
      var width = 4000 - margin.left - margin.right

      var main = d3.select("#viz")
        .append("div")
        .attr("class", 'right col-md-8')
          .append("svg")
            .attr("height", height)
            .attr("width", width)

      var x_scale = d3.scale.ordinal()
        .domain(data.map(function(d) { return d['key'] }))
        .rangeBands([margin.left, width], 0.1, 0.1)

      var y_extent = d3.extent(data, function(d) { return d['total'] })

      var y_scale = d3.scale.linear()
        .domain(y_extent)
        .range([height - margin.bottom, margin.top])

      main.selectAll("rect")
        .data(data)
        .enter().append("rect")
          .attr("x", function(d) { return x_scale(d['key']) })
          .attr("width", x_scale.rangeBand())
          .attr("y", function(d) { return y_scale(d['total']) })
          .attr("height", function(d) { return height - margin.bottom - y_scale(d['total']) })
          .attr("class", function(d) { return "bar " + d['key'] })
          .on("mouseover", function(d) { 
            d3.selectAll('.' + d['key']).classed('highlighted', true) })
          .on("mouseout", function(d) { 
            d3.selectAll('.highlighted').classed('highlighted', false) })

      var x_axis = d3.svg.axis().scale(x_scale)
        .innerTickSize(-height)
        .outerTickSize(0)

      main.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
          .call(x_axis)

      main.selectAll('.x.axis text')
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) { return "rotate(-90)" });

      var y_axis = d3.svg.axis().scale(y_scale).orient('left')
        .innerTickSize(-width)
        .outerTickSize(0)

      main.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + margin.left + ', 0)')
          .call(y_axis)

      main.select('.x.axis')
        .append('text')
          .text('Industry/Ideology')
          .attr('x', (width/5)- margin.left)
          .attr('y', margin.bottom / 1.5)

      main.select('.y.axis')
        .append('text')
          .text('Contribution ($K)')
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left)
          .attr("x", -(height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
    }
})
