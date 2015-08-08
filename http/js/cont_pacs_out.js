d3.csv("data/cont_pacs_out.csv")
  .row(function(d, i) { 
    return { 
      'Amount': parseInt(d['Amount']),
      'Bucket': d['Bucket'],
      'Cycle': parseInt(d['Cycle']),
      'EntityId': d['EntityId'],
      'Party': d['Party'],
      'RealCode': d['RealCode']
    }
  })
  .get(function(err, data) {

    data.filter(function(d) { return d['Amount'] >= 0.0 })

    if (err) console.log(err)
    var nested = d3.nest()
    .key(function(d) { return d['Bucket'] })
    .key(function(d) { return d['Cycle'] })
      .rollup(function(ds) {
        var amt = d3.sum(ds.map(function(x) { return x['Amount'] })) / 1000000000
        if (amt < 0) return 0.0 
        else return amt
      })
    .entries(data)
    .map(function(d) { 
      var total = d3.sum(d['values'].map(function(x) { return x['values'] }))
      d['total'] = total
      return d
    })
    .sort(function(a, b) { return d3.descending(a['key'], b['key']) })

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 

    var height = 1000
    var width = 1000

    draw_stacked_area(d3.select('#per_pac'), nested, cycles, [ 'a', 'b', 'c', 'd', 'e' ],
        height, width)
})
