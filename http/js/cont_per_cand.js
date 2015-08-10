d3.csv("data/cont_bush_out.csv")
  .row(function(d, i) { 
    return { 
      'Amount': parseInt(d['Amount']),
      'Cycle': parseInt(d['Cycle']),
      'EntityId': d['EntityId'],
      'Name': d['Name']
    }
  })
  .get(function(err, data) {

    data = data
      .filter(function(d) { 
        return d.Cycle == 1996 || d.Name == 'Steve Forbes (R)' || d.Name == 'George W Bush (R)'
      })

    if (err) console.log(err)
    var nested = d3.nest()
      .key(function(d) { return d.Name })
      .rollup(function(ds) {
        var amt = d3.sum(ds.map(function(x) { return x['Amount'] })) / 1000000
        if (amt < 0) return 0.0 
        else return amt
      })
      .entries(data)
      .sort(function(a, b) { return d3.descending(a.values, b.values) })
      .slice(0, 6)
  
    var names = nested.map(function(d) { return d.key }) 

    draw_bar(d3.select('#per_candidate_bush'), nested, names,
      300, 900,
      { 
        main: {
          x_label: 'Candidate',
          y_label: 'Contributions ($M)' 
        },
      })
})
