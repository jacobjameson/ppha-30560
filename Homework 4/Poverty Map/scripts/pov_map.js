Promise.all([ 
d3.json('mapshaper-output/final_data.json'),
])
.then(ready)
.catch((err) => {
    console.log(err);
});

function ready(res) {
let raw = res[0]
let county = topojson.feature(raw, raw.objects.county)
let state = topojson.feature(raw, raw.objects.state)

let width = 1050;
let height = 600;

let svg = d3.select("body").select("svg")

let myProjection = d3.geoAlbersUsa()
    .fitSize([width, height], county)

// path function
let path = d3.geoPath()
    .projection(myProjection)

let innerLines = topojson.mesh(raw, raw.objects.state, function(a, b) {
    return a != b;
})

svg.selectAll(".states")
    .data(state.features)
    .join("path")
    .attr("d", path)
    .style("fill", "#eeeeee")
    .style("stroke", "none")
    .style("pointer-events", "none")

let states = svg
    .append("path")
    .attr("d", path(innerLines))
    .style("fill", "none")
    .style("stroke", "#333")
    .style("stroke-width", 1)
    .style("pointer-events", "none")

let scaleFunction = d3.scaleSqrt()
    .domain([0, d3.max(county.features, function (d) { return d.properties.pop_18_in_poverty; })])
    .range([1, 35]);

let popup = d3.select(".pop-up").style("opacity", 0);

let counties = svg
    .selectAll(".counties")
    .data(county.features.filter(d => !isNaN(path.centroid(d)[0])))
    .join("circle")
    .attr("r", function (d) { return scaleFunction(d.properties.pop_18_in_poverty) })
    .attr("cx", d => { return path.centroid(d)[0]})
    .attr("cy", d => { return path.centroid(d)[1]})
    .attr("class", function (d) { return "counties c-" + d.properties.GEOID }) // Give circles a class name.
    .style("fill", "#ffa500")
    .style("stroke", "white")
    .style("stroke-width", .1)
    .style("fill-opacity", .45)

counties.on("mouseover", function(event, d) {
    d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill-opacity", 1)
        .raise()
    
    let lang = "There are  <b>" + d.properties.pop_18_in_poverty.toLocaleString('en') + 
    "</b> children living in poverty in <b>" +  d.properties.Geo_QName

    popup
        .style("opacity", 1)
        .style("left", (event.x + 10) + "px")
        .style("top", (event.y - 20) + "px")
        .html(lang)

})

counties.on("mouseout", function(event, d) {
    d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", .1)
        .style("fill-opacity", .45)
    
    popup
        .style("opacity", 1)
})

}