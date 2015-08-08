var margin = {top: 30, right: 0, bottom: 20, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(",%"),
    colorDomain = [0, .3, 1.0],
    colorRange = ["#FF7878", 'white', "#77DD77"],
    transitioning;

// sets x and y scale to determine size of visible boxes
var x = d3.scale.linear()
    .domain([0, width / 2])
    .range([0, width / 2]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

// adding a color scale
var color = d3.scale.linear()
    .domain(colorDomain)
    .range(colorRange);

// introduce color scale here

var democratTreemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

var svg = d3.select("#democrat-chart").append("svg")
    .attr("width", (width + margin.left + margin.right) / 2)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

var democratGrandparent = svg.append("g")
    .attr("class", "Grandparent");

democratGrandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width / 2)
    .attr("height", margin.top);

democratGrandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");

var legend = d3.select("#democrat-legend").append("svg")
  .attr("width", (width + margin.left + margin.right) / 2)
  .attr("height", 30)
  .attr('class', 'legend')
  .selectAll("g")
      .data([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18])
      .enter()
      .append('g')

// functions

function initialize(root) {
    root.x = root.y = 0;
    root.dx = width / 2;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // democratTreemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.children)
      // recursion step, note that p and v are defined by reduce
        ? d.value = d.children.reduce(function(p, v) {return p + accumulate(v); }, 0)
        : d.value;
  }



  // Compute the democratTreemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      // democratTreemap nodes comes from the democratTreemap set of functions as part of d3
      democratTreemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        // recursion
        layout(c);
      });
    }
  }

function colorIncrements(d){
    return (colorDomain[colorDomain.length - 1] - colorDomain[0])/18*d + colorDomain[0];
}


legend.append("rect")
    .attr("x", function(d){return margin.left + d * 40})
    .attr("y", 0)
    .attr("fill", function(d) {return color(colorIncrements(d))})
    .attr('width', '40px')
    .attr('height', '40px')


legend.append("text")
        .text(function(d){return formatNumber(colorIncrements(d))})
        .attr('y', 20)
        .attr('x', function(d){return margin.left + d * 40 + 20});

// determines if white or black will be better contrasting color
function getContrast50(hexcolor){
    return (parseInt(hexcolor.replace('#', ''), 16) > 0xffffff/3) ? 'black':'white';
}

d3.json("./data/democrat-treemap.json", function(root) {
  console.log(root)
  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function display(d) {
    democratGrandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d))

    // color header based on democratGrandparent's rate
    democratGrandparent
      .datum(d.parent)
      .select("rect")
      .attr("fill", function(){console.log(color(d.rate)); return color(d['rate'])})

    var g1 = svg.insert("g", ".democratGrandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
      .append("title")
        .text(function(d) {console.log(typeof(d.value), d.value); return d.name + ', Number of Donations: ' + d.value + ', percent change: ' + formatNumber(d.rate); });

    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })
        .call(text);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; })
        .attr("fill", function (d) {return getContrast50(color(parseFloat(d.rate)))});
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
        .attr("fill", function(d){return color(parseFloat(d.rate));});
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + "." + d.name
        : d.name;
  }




});