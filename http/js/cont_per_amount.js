d3.csv("data/count_out.csv")
  .row(function(d, i) { 
    return { 
      'Amount': parseInt(d['Amount']),
      'Bucket': d['Bucket'],
      'Cycle': parseInt(d['Cycle'])
    }
  })
  .get(function(err, data) {

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
    .sort(function(a, b) { return d3.ascending(a['key'], b['key']) })

    var cycle_totals = nested[0].values.map(function(d, i) {
      var amts = nested.map(function(x) { return x.values[i].values })
      console.log(amts)
      return d3.sum(amts)
    })

    nested = nested.map(function(d) {
      d.values = d.values.map(function(x, i) { 
        x.values = x.values / cycle_totals[i]
        return x
      })
      return d
    })

    var cycles = data.map(function(d) { return d3.format("02")(d['Cycle'] % 100) }) 

    draw_stacked_area(d3.select('#per_amount'), nested, cycles, [ 'a', 'b', 'c', 'd', 'e' ],
      800, 450,
      { 
        top: {
          x_label: 'Year',
          y_label: 'Contributions ($B)' 
        },
        bottom: {
          x_label: 'Donation Amount ($)',
          y_label: 'Contributions ($B)' 
        }
      })
})
