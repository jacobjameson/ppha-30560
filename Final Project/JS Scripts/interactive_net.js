var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var simulation = d3.forceSimulation()
                    .force("link", d3.forceLink().id(function(d) { return d.id; }))
                    .force("charge", d3.forceManyBody())
                    .force("center", d3.forceCenter(width / 2, height / 2));

var virdis = ['#440154FF',  '#482677FF', '#453781FF', '#404788FF',
              '#39568CFF', '#33638DFF', '#2D708EFF', '#287D8EFF', '#238A8DFF',
              '#1F968BFF', '#20A387FF', '#29AF7FFF', '#3CBB75FF', '#55C667FF',
              '#73D055FF', '#95D840FF', '#B8DE29FF', '#DCE319FF', '#FDE725FF'];

d3.json("Data/network.json", function(error, graph) { 
  if (error) throw error;

var link = svg.append("g")
              .attr("class", "links")
              .selectAll("line")
              .data(graph.links)
              .enter().append("line")
              .attr("stroke-width", function(d) { 
                return Math.sqrt(d.value); });

var node = svg.append("g")
              .attr("class", "nodes")
              .selectAll("circle")
              .data(graph.nodes)
              .enter().append("circle")
              .attr("r", 8)
              .attr("fill", function(d) { 
                min = Math.ceil(0);
                max = Math.floor(19);
                return virdis[Math.floor(Math.random() * (18 - 0) + 0)]; })
              .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

simulation.nodes(graph.nodes).on("tick", ticked);

simulation.force("link").links(graph.links);

function ticked() {
link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

