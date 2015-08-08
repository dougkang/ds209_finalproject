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
      'Destination': d['Destination']
    }
  })
  .get(function(err, data) {

    if (err) console.log(err)
    var nested = d3.nest()
    .key(function(d) { return d['Cycle'] })
      .rollup(function(ds) {
        var amt = d3.sum(ds.map(function(x) { return x['Amount'] })) / 1000000000
        if (amt < 0) return 0.0 
        else return amt
      })
    .entries(data)
    .sort(function(a, b) { return d3.descending(a['key'], b['key']) })

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 
    var margin = { top: 30, right: 30, bottom: 30, left: 50 }
    var height = 500
    var width = 1000

    var x = draw_area(d3.select('#contributions'), nested, cycles, height, width, margin)
})