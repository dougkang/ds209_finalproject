d3.csv("data/count_out.csv")
  .row(function(d, i) { 
    return { 
      'Amount': parseInt(d['Amount']),
      'Count': parseInt(d['Count']),
      'Bucket': d['Bucket'],
      'Cycle': parseInt(d['Cycle'])
    }
  })
  .get(function(err, data) {

    if (err) console.log(err)

    var nested = d3.nest()
    .key(function(d) { return d['Bucket'] })
    .key(function(d) { return d['Cycle'] })
      .rollup(function(ds) { return d3.sum(ds.map(function(x) { return x['Count'] / 1000000})) })
    .entries(data)
    .map(function(d) { 
      var total = d3.sum(d['values'].map(function(x) { return x['values'] }))
      d['total'] = total
      return d
    })
    .sort(function(a, b) { return d3.ascending(a['key'], b['key']) })

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 

    var height = 800
    var width = 1000

    draw_stacked_area(d3.select('#per_amount'), nested, cycles, [ 'a', 'b', 'c', 'd' ],
      800, 500)
})
