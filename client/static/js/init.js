window.onload = init;

/**
 * Excecutes on page load(start of the application)
 */
async function init() {
     $.get("/get-forcasts", function(data, status){
        data = JSON.parse(data)
        console.log(data)
        draw(data);
    });
}


function draw(pred_data) {

    var keys = Object.keys(pred_data)
    let max = 0;
    keys.forEach(country => {
        if (pred_data[country].mlp.y_pred.length > max) {
            max = pred_data[country].mlp.y_pred.length;
        } 
    });
    const data = []
    for (let i = 0; i < max; i++) {
        const date = moment(new Date(pred_data[keys[0]].mlp.start_timestamp)).add('days', i).toDate();
        const record = {date};
        keys.forEach(country => {
            const mlp = pred_data[country].mlp.y_pred[i] && pred_data[country].mlp.y_pred[i][0] || 0;
            const cnn = pred_data[country].cnn.y_pred[i] && pred_data[country].cnn.y_pred[i] || 0;
            record[country] = (mlp + cnn)/ 2;
            // record[country] = pred_data[country].cnn.y[i] && pred_data[country].cnn.y[i] || 0
        });
        data.push(record);
    }

    // set the dimensions and margins of the graph
    margin = ({top: 0, right: 20, bottom: 30, left: 20});
    height = 100;
    width = 500;

    color = d3.scaleOrdinal()
    .domain(keys.slice(1))
    .range(d3.schemeCategory10);

    xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    .call(g => g.select(".domain").remove());

    series = d3.stack()
        .keys(keys)
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderInsideOut)
    (data);

    y = d3.scaleLinear()
    .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
    .range([height - margin.bottom, margin.top]);

    x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

    area = d3.area()
    .x(d => x(d.data.date))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

    const c_svg = d3.select("#forecast_viz")
    .append("svg")
    .attr('width', 1500)
    .attr('height', 50);

    const country_g = c_svg.selectAll(".country")
      .data(keys)
      .enter()
      .append("g");

    country_g
      .append("rect")
      .attr('class', 'rect')
      .attr("x", (d, i) => {
            let space = 80;
            keys.forEach((key, indx) => {
                if (indx < i) {
                    space += key.length * 8 + 25;
                }
            });
            return space;
      })
      .attr('y', 10)
      .attr('width', 15)
      .attr('height', 15)
      .attr("fill", (key) => color(key));

    country_g
      .append("text")
      .attr("x", (d, i) => {
        let space = 100;
        keys.forEach((key, indx) => {
            if (indx < i) {
                space += key.length * 8 + 25;
            }
        });
        return space;
      })
      .attr('y', 23)
      .attr('width', 15)
      .attr('height', 15)
      .text(d => d);

    const svg = d3.select("#forecast_viz")
    .append("svg")
      .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .selectAll("path")
        .data(series)
        .join("path")
        .attr("fill", ({key}) => color(key))
        .attr("d", area)
        .append("title")
        .text(({key}) => key);

    svg.append("g")
        .call(xAxis);

}



function draw_chart(pred_data) {
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 0, left: 10},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#forecast_viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    // d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv", function(data) {

        // List of groups = header of the csv files
        var keys = Object.keys(pred_data)
        let max = 0;
        keys.forEach(country => {
            if (pred_data[country].mlp.y_pred.length > max) {
                max = pred_data[country].mlp.y_pred.length;
            } 
        });
        const data = []
        for (let i = 0; i < max; i++) {
            const date = moment(new Date(pred_data[keys[0]].mlp.start_timestamp)).add('days', i).toDate();
            const record = {date};
            keys.forEach(country => {
                record[country] = pred_data[country].mlp.y_pred[i] && pred_data[country].mlp.y_pred[i][0] || 0;
            });
            data.push(record);
        }

        // Add X axis
        var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
        svg.append("g")
        .attr("transform", "translate(0," + height*0.8 + ")")
        .call(d3.axisBottom(x).tickSize(-height*.7).tickValues([1900, 1925, 1975, 2000]))
        .select(".domain").remove()
        // Customization
        svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

        // Add X axis label:
        svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height-30 )
        .text("Time (year)");

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, 30000000])
        .range([ height, 0 ]);

        // color palette
        var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);

        //stack the data?
        var stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data)

        // create a tooltip
        var Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
        }
        var mousemove = function(d,i) {
        grp = keys[i]
        Tooltip.text(grp)
        }
        var mouseleave = function(d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        }

        // Area generator
        var area = d3.area()
        .x(function(d) { return x(d.data.year); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

        // Show the areas
        svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // })
}
