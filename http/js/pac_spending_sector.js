d3.csv("data/pac_out.csv")
  .row(function(d, i) { 
    return { 
      'Amount': parseInt(d['Amount']),
      'Cycle': parseInt(d['Cycle']),
      'EntityId': d['EntityId'],
      'Party': d['Party'],
      'RealCode': d['RealCode'].toLowerCase(),
      'Type': d['Type']
    }
  })
  .get(function(err, data) {

    data = data
      .filter(function(d) { return d['Amount'] >= 0.0 && d.RealCode != 'z' })

    if (err) console.log(err)

    var nested = d3.nest()
    .key(function(d) { return d['Cycle'] })
      .rollup(function(ds) {
        var amt = d3.sum(ds.map(function(x) { return x['Amount'] })) / 1000000
        if (amt < 0) return 0.0 
        else return amt
      })
    .entries(data)

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 

    draw_area(d3.select('#per_sector'), nested, cycles, 
      300, 900,
      { 
        main: {
          x_label: 'Year',
          y_label: 'Contributions ($M)' 
        }
      })
})
