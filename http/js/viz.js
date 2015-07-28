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

    var year = undefined 
    var data = data
      .filter(function(elm) { return year === undefined || elm['Cycle'] == year })

    var data = d3.nest()
      .key(function(d) { return d['RealCode'] })
      .entries(data)
      .map(function(d) { 
        var total = d3.sum(d['values'].map(function(x) { return x['Amount'] })) / 1000
        d['total'] = total
        return d
      })
      .sort(function(a, b) { return d3.descending(a['total'], b['total']) })

    var margin = { top: 30, right: 30, bottom: 90, left: 40 }
    var height = 800 - margin.top - margin.bottom
    var width = 4000 - margin.left - margin.right

    var x_scale = d3.scale.ordinal()
      .domain(data.map(function(d) { return d['key'] }))
      .rangeBands([margin.left, width], 0.1, 0.1)

    var y_extent = d3.extent(data, function(d) { return d['total'] })

    var y_scale = d3.scale.linear()
      .domain(y_extent)
      .range([height - margin.bottom, margin.top])

    var panel = d3.select('#viz')
      .append('div')
      .attr("class", 'right col-md-6')

    var main = d3.select("#viz")
      .append("div")
      .attr("class", 'left col-md-6')
        .append("svg")
          .attr("height", height)
          .attr("width", width)

    data.map(function(d) { d['key'] }).forEach(function(d) {
      var fig = panel
        .append("svg")
          .attr("height", height)
          .attr("width", width)
    })

    main.selectAll("rect")
      .data(data)
      .enter().append("rect")
        .attr("x", function(d, i) { return x_scale(d['key']) })
        .attr("width", x_scale.rangeBand())
        .attr("y", function(d, i) { return y_scale(d['total']) })
        .attr("height", function(d, i) { return height - margin.bottom - y_scale(d['total']) })
        .attr("class", "bar")

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
})
