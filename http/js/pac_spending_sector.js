d3.csv("data/pac_out.csv")
  .row(function(d, i) { 
    return { 
      'Amount': parseInt(d['Amount']),
      'Cycle': parseInt(d['Cycle']),
      'EntityId': d['EntityId'],
      'Party': d['Party'],
      'RealCode': d['RealCode'],
      'Type': d['Type']
    }
  })
  .get(function(err, data) {

    data.filter(function(d) { return d['Amount'] >= 0.0 })

    if (err) console.log(err)
    var nested = d3.nest()
    .key(function(d) { return d['RealCode'] })
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
    .sort(function(a, b) { return d3.descending(a['total'], b['total']) })
    .filter(function(d) { return d.key != 'Z5100' && d.key != 'Z5200' && d.key != 'Z5300' })
    .slice(0, 40)

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 

    var height = 1000
    var width = 1000

    draw_stacked_area(d3.select('#per_sector'), nested, cycles, [ 'Y4000', 'K1000', 'F2100' ],
        height, width)
})
