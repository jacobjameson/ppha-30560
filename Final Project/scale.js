let margin = { top: 0, right: 0, bottom: 50, left: 30 };
const width = document.body.clientWidth
const height = document.body.clientHeight

var colorScale = d3.scaleLinear()
  	.range(['#440154FF', '#481567FF', '#482677FF', '#453781FF', '#404788FF',
'#39568CFF', '#33638DFF', '#2D708EFF', '#287D8EFF', '#238A8DFF',
'#1F968BFF', '#20A387FF', '#29AF7FFF', '#3CBB75FF', '#55C667FF',
'#73D055FF', '#95D840FF', '#B8DE29FF', '#DCE319FF', '#FDE725FF']);



  // append a defs (for definition) element to your SVG
var svgLegend = d3.select('body').append('svg')
    .attr("width",600);
var defs = svgLegend.append('defs');

	// append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append('linearGradient')
		.attr('id', 'linear-gradient');

// horizontal gradient
linearGradient
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0%");

// append multiple color stops by using D3's data/enter step
linearGradient.selectAll("stop")
  .data([
    {offset: "0%", color: "#440154FF"},
    {offset: "50%", color: "#29AF7FFF"},
    {offset: "100%", color: "#FDE725FF"}
  ])
  .enter().append("stop")
  .attr("offset", function(d) { 
    return d.offset; 
  })
  .attr("stop-color", function(d) { 
    return d.color; 
  });

// append title
svgLegend.append("text")
  .attr("class", "legendTitle")
  .attr("x", 10)
  .attr("y", 20)
  .style("text-anchor", "left")
  .text("Centrality Scale: Brighter Colors Represent Higher Centrality Measure");

// draw the rectangle and fill with gradient
svgLegend.append("rect")
  .attr("x", 10)
  .attr("y", 30)
  .attr("width", width + margin.left + margin.right)
  .attr("height", 35)
  .style("fill", "url(#linear-gradient)");

//create tick marks
var xLeg = d3.scaleLinear()
  .domain([0, 100])
  .range([10, 400]);


svgLegend
  .attr("class", "axis")
  .append("g")
  .attr("transform", "translate(0, 40)")
  .call(axisLeg);
