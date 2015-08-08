d3.csv("data/cont_out.csv")
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
      'Destination': d['Destination']
    }
  })
  .get(function(err, data) {

    data = data
      .map(function(d) { 
        if (d.RealCode == 'Z9800') {
          d.Destination = 'Public'
        } else if (d.RealCode.startsWith('Z')) {
          d.Destination = 'Party'
        }
        return d
      })

    if (err) console.log(err)
    var nested = d3.nest()
    .key(function(d) { return d['Destination'] })
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

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 

    var height = 900 
    var width = 490

    draw_stacked_area(d3.select('#per_type'), nested, cycles, [ 'Cmte', 'Cand' ],
        900, 490)
})
