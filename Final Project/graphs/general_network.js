var width = 500,height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(150)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("network.csv", function (error, data) {
    //set up graph in same style as original example but empty
    graph = { "nodes": [], "links": [] };

    //loop through each link record from the csv data
    //add to the nodes each source and target; we'll reduce to unique values later
    //add to the links each source, target record with the value (if desired, multiple value fields can be added)
    data.forEach(function (d) {
        graph.nodes.push({ "name": d.source, "group": +d.groupsource });
        graph.nodes.push({ "name": d.target, "group": +d.grouptarget });

        graph.links.push({ "source": d.source, "target": d.target, "value": +d.value });
    });

    //use this as temporary holding while we manipulate graph.nodes
    //this will contain a map object containing an object for each node
    //within each node object there will be a child object for each instance that node appear
    //however, using rollup we can eliminate this duplication
    var nodesmap = d3.nest()
                        .key(function (d) { return d.name; })
                        .rollup(function (d) { return { "name": d[0].name, "group": d[0].group }; })
                        .map(graph.nodes);

    //thanks Mike Bostock https://groups.google.com/d/msg/d3-js/pl297cFtIQk/Eso4q_eBu1IJ
    //this handy little function returns only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest()
                         .key(function (d) { return d.name; })
                         .map(graph.nodes));


    //it appears d3 with force layout wants a numeric source and target
    //so loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //this is not in the least bit pretty
    //will get graph.nodes in its final useable form
    //loop through each unique node and replace with an object with same numeric key and name/group as properties
    //that will come from the nodesmap that we defined earlier
    graph.nodes.forEach(function (d,i) { graph.nodes[i]={ "name": nodesmap[d].name, "group": nodesmap[d].group }; })


    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

    var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function (d) { return Math.sqrt(d.value); });

    var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 15)
      .style("fill", function (d) { return color(d.group); })
      .call(force.drag);

    node.append("title")
      .text(function (d) { return d.name; });

    force.on("tick", function () {
        link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

        node.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
    });
});
