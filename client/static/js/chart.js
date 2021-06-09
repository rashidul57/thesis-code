const date_format = 'YYYY-MM-DD';


function draw_predicted_lines(data, sel_country='United States') {

    let num_dates = 0;
    countries.forEach(country => {
        if (data[country].mlp.y_pred.length > num_dates) {
            num_dates = data[country].mlp.y_pred.length;
        } 
    });
    const line_data = {}
    countries.forEach(country => {
        const mlps = [];
        const cnns = [];
        const actuals = [];
        for (let i = 0; i < num_dates; i++) {
            const date = moment(new Date(data[countries[0]].mlp.start_timestamp)).add('days', i).toDate();
            const mlp = data[country].mlp.y_pred[i] && data[country].mlp.y_pred[i][0] || 0;
            const cnn = data[country].cnn.y_pred[i] && data[country].cnn.y_pred[i][0] || 0;
            const actual = data[country].cnn.y[i] && data[country].cnn.y[i] || 0;
            mlps.push({date, count: mlp});
            cnns.push({date, count: cnn});
            actuals.push({date, count: actual});
        }
        line_data[country] = {mlps, cnns, actuals};
    });

    const types = [
        {name: 'actuals', label: 'Actual'},
        {name: 'mlps', label: 'MLP Prediction'},
        {name: 'cnns', label: 'CNN Prediction'}
    ];
    for (var k = 0; k<types.length; k++) {
        const l_data = line_data[sel_country][types[k].name];
        draw_a_line(".chart-item", l_data, 'count', types[k].label, k, '');
    }
}

function draw_a_line(base_container, dataset, count_prop, leg_label, indx, legend_title) {
    const mappedData = _.keyBy(dataset, 'date');
    // Init configurations
    let bounds, xScale, yScale, xAccessor, yAccessor, clip;
    let svg = d3.select(base_container + " svg.lines-chart");
    let axesExists = svg.size() > 0;
    let height = 680;
    let dimensions = {
        width: 1000,
        height: height,
        margin: {
            top: 15,
            right: 25,
            bottom: 20,
            left: 80
        }
    }

    if (!axesExists) {
        xAccessor = d => new Date(d.date);
        yAccessor = d => d.count;
        
        // Create chart dimensions
        dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
        dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

        // Draw canvas
        svg = d3.select(base_container)
        .append("svg")
        .attr("class", "lines-chart")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

        bounds = svg.append("g")
            .attr("transform", `translate(${
                dimensions.margin.left
            }, ${
                dimensions.margin.top
            })`);

        bounds.append("defs").append("clipPath")
            .attr("id", "bounds-clip-path")
            .append("rect")
            .attr("width", dimensions.boundedWidth)
            .attr("height", dimensions.boundedHeight)
        clip = bounds.append("g")
            .attr("clip-path", "url(#bounds-clip-path)")

        // Create scales
        yScale = d3.scaleLinear()
            .domain(d3.extent(dataset, yAccessor))
            .range([dimensions.boundedHeight, 0])

        xScale = d3.scaleTime()
            .domain(d3.extent(dataset, xAccessor))
            .range([0, dimensions.boundedWidth])
    } else {
        // set the chart configuration from memory
        bounds = line_chart_state.bounds;
        xScale = line_chart_state.xScale;
        yScale = line_chart_state.yScale;
        xAccessor = line_chart_state.xAccessor;
        yAccessor = line_chart_state.yAccessor;
        clip = line_chart_state.clip;
    }

    // construction of tooltip
    const tooltip = d3.tip().attr('class', 'd3-tip')
    .html(function (event, d) {
        const dated_count = (d.data.count || 0).toLocaleString('en-US');
        const name = d.data.name || 'Greenland';
        return `<div>
        <p>Country: <strong>${dated_count}</strong></p>
        </div>`;
    });

    svg.on('mousedown', function (d) {
        tooltip.hide()
    });
    // svg.append('g').call(tooltip);

    // Draw data
    const lineGenerator = d3.line()
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)));
    const line_data = lineGenerator(dataset);

    // Define some static color to identify different country
    const country_colors = ['#6c4242', '#ff1e00', '#00ff0e', '#20BEFF', '#1600ff', '#568f3c', '#00ffd6', '#c4c411', '#212121', '#6e6ae1', '#e929e7'];

    // Draw line of chart
    clip.append("path")
    .attr("class", "line")
    .attr("d", line_data)
    .attr("stroke", country_colors[indx%11])
    .attr("stroke-width", 2)
    .on('mouseover', function (event, d) {
        show_dated_tip(event);
    })
    .on('mouseout', function (d) {
        tooltip.hide();
    })
    .on("mousemove", function(event, d){
        show_dated_tip(event);
    })
    .on('mousedown', function (d) {
        tooltip.hide()
    });

    // Draw line for country in legend
    clip.append('path')
    .attr("class", "legend-line")
    .style('stroke', country_colors[indx%11])
    .attr("stroke-width", 2)
    .attr('d', `M20,${27+indx*22},L60,${27+indx*22}`);

    // Add text of country name in legend
    clip.append('text')
    .attr("class", "legend-text")
    .attr('fill', country_colors[indx%11])
    .attr("x", 65)
    .attr("y", 33+indx*22)
    .html(leg_label);

    // Draw peripherals
    if (!axesExists) {
        clip.append('text')
        .attr("class", "top-countries")
        .attr('fill', 'Black')
        .attr("x", 15)
        .attr("y", 30)
        .html(legend_title);

        const yAxisGenerator = d3.axisLeft()
            .scale(yScale);

        const yAxis = bounds.append("g")
            .attr("class", "y-axis")
            .call(yAxisGenerator);

        const xAxisGenerator = d3.axisBottom()
            .scale(xScale);

        const xAxis = bounds.append("g")
            .attr("class", "x-axis")
            .style("transform", `translateY(${dimensions.boundedHeight}px)`)
            .call(xAxisGenerator);
    }

    if (!axesExists) {
        line_chart_state = {bounds, xScale, yScale, xAccessor, yAccessor, clip};
    }

    // Show tooltip for the date at which mouse pointed out
    function show_dated_tip(event) {
        const mousePosition = d3.pointer(event);
        let date = xScale.invert(mousePosition[0]);
        const formated_date = moment(date).format("LL").replace('00', '20');
        const dmy_date = moment(date).format(date_format);
        const dated_count = mappedData[dmy_date] && mappedData[dmy_date].count || 0;
        const cur_date = new Date(date);
        const total_count = _.reduce(dataset, (sum, item) => {
            const in_date = new Date(item.date).getTime() <= cur_date.getTime();
            return sum += in_date ? (item.count || 0) : 0;
        }, 0);
        set_cell_tooltip_position(event, tooltip, {data: {name: leg_label, date:formated_date, dated_count, total_count}});
    }

}

/**
 * Update tooltip position on mouse move
 * @param {*} event 
 * @param {*} tooltip 
 * @param {*} d 
 */

function set_cell_tooltip_position(event, tooltip, d) {
    let x = Math.abs(event.pageX) - 50;
    let y = Math.abs(event.pageY) + 15;
    if (y > 620) {
        y = 600;
        if (x > 500) {
            x -= 150;
        } else {
            x += 150;
        }
    }
    tooltip.show(event, d);
    $('.d3-tip').css({"left": (x + "px"), "top": (y + "px")});
}


function draw_stream_graph(pred_data, algo='mlp') {

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
            record[country] = pred_data[country][algo].y_pred[i] && pred_data[country][algo].y_pred[i][0] || 0;
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

    const c_svg = d3.select(".chart-item")
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

    const svg = d3.select(".chart-item")
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
    var svg = d3.select(".chart-item")
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
