console.log(d3)
let width = 1000;
let height = 300;
let margin = { top: 30, right: 10, bottom: 10, left: 30 };

d3.csv("Data/chicago_vax.csv").then(function (data) {
    let svg = d3.select("svg")
    let scroll_steps = d3.select("article")

    data = data.filter( row => row["Region"] == "Chicago")[0]

    data = Object.keys(data).map(date => ({ date, cases: data[date] }))
        .filter( row => !["Region"].includes(row.date) )

    data.forEach(function(row) {
        [month, day, year] = row.date.split("/")
        month = +month
        month = (month < 10 ? "0" + month : month)
        day = +day
        day = (day < 10 ? "0" + day : day)
        row.numericDate = +("20" + year + month + day)
        row.dateString = "20" + year + "-" + month + "-" + day + "T00:00"
        row.date = new Date( row.dateString )
        row.prettyDate = row.date.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric"})
        row.cases = +row.cases
        row.region = "Chicago"

        scroll_steps.append("div")
            .attr("class", "step")
            .attr("data-numeric-date", row.numericDate)
            .attr("data-pretty-date", row.prettyDate)
    })

    console.log(data)

    let x = d3.scaleTime()
        .domain(d3.extent(data.map( d => d.date )))
        .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
        .domain(d3.extent(data.map( d => d.cases )))
        .range([height - margin.bottom, margin.top])

    let line = d3.line()
        .x( d => x(d.date) )
        .y( d => y(d.cases) )

    let yAxisSettings = d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickPadding(10)

    let xAxisSettings = d3.axisBottom(x)
        .ticks(10)
        .tickSize(10)
        .tickPadding(10)

    let xAxisTicks = svg.append("g")
        .attr("class", "x axis")
        .call(xAxisSettings)
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("color", "#999999")
    
    let yAxisTicks = svg.append("g")
        .attr("class", "y axis")
        .call(yAxisSettings)
        .attr("transform", `translate(${margin.left},0)`)
        .style("color", "#CCCCCC")

    let yAxisTickLabels = svg.selectAll(".y.axis .tick text")
        .attr("dy", -7)
        .attr("dx", -5)
        .attr("x", width)
        .style("text-anchor", "end")
        .style("color", "#666666")
    
    svg.selectAll(".axis .domain")
        .style("display", "none")

    let line_path = svg.append("path")
        .data([data.filter(function(d) { return d.cases == 1 })])
        .attr("class", "case_count_line")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke-width", "3px")
        .style("stroke", "black")

    let case_count = svg.append("text")
        .datum([data[1]])
        .attr("class", "case_count_text")
        .text(d => d[0].cases)
        .attr("x", d => x(d[0].date))
        .attr("y", d => y(d[0].cases))
        .attr("dx", "5")
        .attr("dy", "-10")
        .attr("style", "text-shadow: 1px 1px 2px white")

    let formatComma = d3.format(",")

    function update(max_date) {
        var filtered_data = data.filter(function(d) { 
            return (d.numericDate <= max_date)
        })

        d3.selectAll(".case_count_line")
            .data([filtered_data])
            .attr("d", line)
        
        d3.selectAll(".case_count_text")
            .data([filtered_data[filtered_data.length - 1]])
            .text(d => formatComma(d.cases))
            .attr("x", d => x(d.date))
            .attr("y", d => y(d.cases))
    }

    const container = d3.select('#scrolly-overlay');
    
    const stepSel = container.selectAll('.step');

    function init() {

        enterView({ //our main view function
            selector: stepSel.nodes(),
            offset: 0.5, //when the slide is 50% away then trigger your chart
            enter: el => { //what's supposed to happen when the slide enters?
                d3.select(".highlight").html(d3.select(el).attr('data-pretty-date'))
                update(+d3.select(el).attr('data-numeric-date'))
            },
            exit: el => { //what's supposed to happen when the slide exits?
                d3.select(".highlight").html(d3.select(el).attr('data-pretty-date'))
                update(+d3.select(el).attr('data-numeric-date'))
            }
        });

    }

    init();
    
})
