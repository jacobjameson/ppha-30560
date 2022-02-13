    let margin = { top: 30, right: 30, bottom: 30, left: 0 };
    let width = 750;
    let height = 550;

    // load data

    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
    d3.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };
    
    d3.csv("football-data.csv").then(function (data){
        data.forEach(function (row) {
            row.player_id = row.player_id
            row.year = +row.year
            row.yards = +row.yards
            row.tds	= +row.tds
            row.att	= +row.att
            row.comp = +row.comp
            row.playoff_games = +row.playoff_games
            row.playoff_wins = +row.playoff_wins	
            row.pb_games = +row.pb_games
            row.year_start = +row.year_start
            row.year_end = +row.year_end
            row.age = +row.age
        })

        // defining variables
        let x = d3.scaleLinear()
            .domain(d3.extent(data.map(function(d) {return d.year} )))
            .range([margin.left, width-margin.right])

        let y = d3.scaleLinear()
            .domain(d3.extent(data.map(function(d) {return d.playoff_wins})))
            .range([height - margin.bottom, margin.top])

        // defining axes
        let xAxisSettings = d3.axisBottom(x)
            .ticks(8)
            .tickSize(8)
            .tickFormat(d3.format("d"))
            .tickPadding(10)

        let yAxisSettings = d3.axisRight(y)
            .tickValues([5, 10, 15, 20, 25, 30, 35])
            .tickSize(width-margin.right)
            .tickPadding(10)

        let svg = d3.select("body")
            .select("svg")

        let yAxisTicks = svg.append("g")
            .attr("class", "y axis")
            .call(yAxisSettings)

        let xAxisTicks = svg.append("g")
            .attr("class", "x axis")
            .call(xAxisSettings)
            .attr("transform", `translate(0, ${height - margin.bottom})`)

        let line = d3.line() //define a line function
            .defined(d => !isNaN(d.playoff_wins))
            .x(function (d) { return x(d.year) }) //accessing date 
            .y(function (d) { return y(d.playoff_wins) }) //accesssing value 

        let grouped_data = d3.group(data, d => d.player_id)
        let highlighted_players = ["StarBa00", "BradTe00", "TarkFr00", "MontJo01", "ElwaJo00"]
        let maxdata = d3.rollups(
            data,
            x => ({
                maxWins: d3.max(x, d => d.playoff_wins),
                maxYear: d3.max(x, d => d.year),
                lastName: x.map(d => d.last_name)[0],
                fullName: x.map(d => d.full_name)[0],
                playerAge: x.map(d => d.age)[0]
            }),
            d => d.player_id)

        let line_path = svg.append("g")
            .selectAll(".line")
            .data(grouped_data)
            .join("path")
            .attr("class", function(d) { return "line " +  d[0] })
            .attr("d", function(d) {
                return line(d[1]) })
            .style("fill", "none")
            .style("stroke", d => {
                if( d[1].slice(-1)[0]["year"] >= 2021
                ) { return "#54b3e5" }
                else if( highlighted_players.indexOf(d[0]) >= 0){ return "#555555" }
                else{ return "#d0d0d0"}} )
            .style("stroke-width", d => {
                if(d[0] == "BradTo00") { 
                    return "3px"
                } 
                else { 
                    return "1px"
                }
            })

        let pts = svg.selectAll("pts")
            .data(maxdata)
            .enter()
            .filter(function(d) { return d[1]["maxWins"] > 0 })
            .append("circle")
            .attr("fill", d => {
                if( d[1]["maxYear"] >= 2021) { return "#54b3e5" }
                else if( highlighted_players.indexOf(d[0]) >= 0){ return "#555555" }
                else{ return "#d0d0d0"}})
            .attr("stroke", "none")
            .attr("cx", function(d) {return x(d[1]["maxYear"]) })
            .attr("cy", function(d) { return y(d[1]["maxWins"]) })
            .attr("r", d => {
                if(d[0] == "BradTo00") {
                    return 4.5
                }
                else {
                    return 1.5
                }
            })

         let labels = svg.selectAll("labels")
            .data(maxdata)
            .enter()
            .filter(function(d) { 
                return highlighted_players.indexOf(d[0]) >= 0 || d[0] == "BradTo00" })
            .append("text")
            .attr("x", d => {
                if( d[0] == "BradTo00") { return x(d[1]["maxYear"]) - 50 }
                else{ return x(d[1]["maxYear"]) + 4 }})
            .attr("y", d => {
                if( d[0] == "BradTo00") { return y(d[1]["maxWins"]) - 15 }
                else{ return y(d[1]["maxWins"]) + 3 }})
            .text(function(d) {
                return d[1]["lastName"]})
            .style("font-size", d => {
                if( d[0] == "BradTo00") { return 20 }
                else{ return 10 }})
            .style("font-family", "Arial")
            .style("stroke", "white")
            .style("stroke-width", 0.3)
            .style("fill", "black")
            .attr("letter-spacing", 0.4)

        // bottom line
        let baseline = svg.append("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.left)
            .attr("y1", y(0))
            .attr("y2", y(0))
            .style("stroke", "black")
            .style("stroke-width", "1.5px")

        // mousover colors
        let div = d3.select("body").append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);
                
        console.log(line_path.filter(function(d) {
            return d[1].slice(-1)[0]["year_end"] < 2021 && highlighted_players.indexOf(d[0]) == -1
        }))

        line_path.on("mouseover", function(event, d) {
                    let selection = d3.select(this)    
                    selection.moveToFront()
                    if(d[1].slice(-1)[0]["year_end"] < 2021 && highlighted_players.indexOf(d[0]) == -1)
                    {selection.style("stroke", "black").moveToFront()}
                    })

                .on("mouseout", function(event, d) {  
                    let selection = d3.select(this)
                    selection.moveToFront()
                    if(d[1].slice(-1)[0]["year_end"] < 2021 && highlighted_players.indexOf(d[0]) == -1)
                    {selection.style("stroke", "#d0d0d0").moveToBack()}})

        })
