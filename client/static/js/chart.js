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
        const lstms = [];
        const actuals = [];
        for (let i = 0; i < num_dates; i++) {
            const date = moment(new Date(data[countries[0]].mlp.start_timestamp)).add('days', i).toDate();
            const mlp = data[country].mlp.y_pred[i] && data[country].mlp.y_pred[i][0] || 0;
            const cnn = data[country].cnn.y_pred[i] && data[country].cnn.y_pred[i][0] || 0;
            const lstm = data[country].lstm.y_pred[i] && data[country].lstm.y_pred[i][0] || 0;
            const actual = data[country].cnn.y[i] && data[country].cnn.y[i] || 0;
            mlps.push({date, count: mlp});
            cnns.push({date, count: cnn});
            lstms.push({date, count: lstm});
            actuals.push({date, count: actual});
        }
        line_data[country] = {mlps, cnns, lstms, actuals};
    });

    const types = [
        {name: 'actuals', label: 'Actual'},
        {name: 'mlps', label: 'MLP Prediction'},
        {name: 'cnns', label: 'CNN Prediction'},
        {name: 'lstms', label: 'LSTM Prediction'}
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
        // show_dated_tip(event);
    })
    .on('mouseout', function (d) {
        tooltip.hide();
    })
    .on("mousemove", function(event, d){
        // show_dated_tip(event);
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


function draw_stream_graph(pred_data, algo='mlp', sel_country='', ev) {
    let cls;
    sel_country_cls = sel_country.replace(/\s/g, '-');
    d3.selectAll('.' + sel_country_cls + '-stream').remove();

    let data = [];
    let keys = Object.keys(pred_data)
    let max = 0;
    keys.forEach(country => {
        if (pred_data[country].mlp.y_pred.length > max) {
            max = pred_data[country].mlp.y_pred.length;
        }
    });

    if (sel_country) {
        if (country_stream_mode === 'Prediction') {
            const model_types = ['mlp', 'cnn', 'lstm'];
            for (let i = 0; i < max; i++) {
                const date = moment(new Date(pred_data[keys[0]].mlp.start_timestamp)).add('days', i).toDate();
                const record = {date};
                model_types.forEach(model => {
                    record[model] = pred_data[sel_country][model].y_pred[i] && pred_data[sel_country][model].y_pred[i][0] || 0;
                });
                data.push(record);
            }
            data = get_normalized_data(data, model_types);
            keys = model_types;
        } else {
            const country_data = all_covid_data[sel_country];
            keys = Object.keys(country_data[0]).filter(key => ['date', 'iso_code', 'location'].indexOf(key) === -1);

            data = get_normalized_data(country_data, keys);
        }

    } else {
        for (let i = 0; i < max; i++) {
            const date = moment(new Date(pred_data[keys[0]].mlp.start_timestamp)).add('days', i).toDate();
            const record = {date};
            keys.forEach(country => {
                record[country] = pred_data[country][algo].y_pred[i] && pred_data[country][algo].y_pred[i][0] || 0;
            });
            data.push(record);
        }
        data = get_normalized_data(data, keys);
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

    // draw legend
    if (!sel_country) {
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
    }
    let svg = d3.select(".chart-item")
        .append("svg");

    if (sel_country) {
        if (ev.target) {
            cls = get_segment_class(ev, false);
            svg.attr('class', sel_country_cls + '-stream country-stream ' + cls);
            // console.log(cls, '...')
        }
    } else {
        svg.attr("viewBox", [0, 0, width, height]);
    }

    svg.append("g")
        .selectAll("path")
        .data(series)
        .join("path")
        .attr("fill", ({key}) => color(key))
        .attr("d", area)
        .append("title")
        .text(({key}) => {
            return key;
        });

    if (!sel_country) {
        svg.append("g")
            .call(xAxis);
    }

    if (sel_country_cls) {
        const seg_countries = d3.selectAll('.' + cls);
        const sel_country_seg = d3.selectAll('.' + sel_country_cls + '-stream');
        if (seg_countries.size() > 1) {
            let nodes = seg_countries.nodes();
            nodes.forEach(node => {
                node.classList.remove('focused');
                node.classList.add("dimmed");
            });
            
            nodes = sel_country_seg.nodes();
            nodes.forEach(node => {
                node.classList.remove('dimmed');
                node.classList.add("focused");
            });
        }
    }

}

function get_normalized_data(data, keys) {
    const maxs = {};
    keys.forEach(key => {
        const max_item = _.maxBy(data, key);
        maxs[key] = max_item && max_item[key] || 1;
    });

    data = data.map(item => {
        item.date = new Date(item.date);
        keys.forEach(key => {
            item[key] = item[key] / maxs[key];
        });
        return item;
    });
    return data;
}

function get_segment_class(ev, show_log) {
    const boxEl = $('.container-box')[0];
    const start_x = boxEl.offsetLeft, end_x = boxEl.offsetWidth;
    const start_y = boxEl.offsetTop, end_y = boxEl.offsetHeight;
    const cent_x = end_x/2;
    const cent_y = end_y/2;
    const x = ev.clientX - start_x;
    const y = ev.clientY - start_y;
    if (show_log) {
        console.log('x', x, 'y', y, 'cx', cent_x, 'cy', cent_y)
    }

    if (x >= (cent_x - 80) && x <= (cent_x + 80)) {
        if (y <= cent_y) {
            cls = 'top-middle';
        } else {
            cls = 'bottom-middle';
        }
    } else if (y >= (cent_y - 70) && y <= (cent_y + 70)) {
        if (x <= cent_x) {
            cls = 'left-middle';
        } else {
            cls = 'right-middle';
        }
    } else if (x <= cent_x && y <= cent_y) {
        cls = 'top-left';
    } else if (x > cent_x && y <= cent_y) {
        cls = 'top-right';
    } else if (x <= cent_x && y > cent_y) {
        cls = 'bottom-left';
    } else {
        cls = 'bottom-right';
    }
    if (show_log) {
        console.log(cls)
    }
    return cls;
}


// Draw bubble chart

function prepare_bubble_data(data, model) {
    let num_dates = 0;
    countries.forEach(country => {
        if (data[country][model].y_pred.length > num_dates) {
            num_dates = data[country][model].y_pred.length;
        } 
    });
    let bubble_data = countries.map(country => {
        let count = 0;
        let actual = 0;
        for (let i = 0; i < num_dates; i++) {
            count += data[country][model].y_pred[i] && data[country][model].y_pred[i][0] || 0;
            actual += data[country][model].y && data[country][model].y[i] || 0;
        }
        const diff = Math.abs(count - actual);
        return {name: country, code: data[country].code, count, actual, diff};
    });
    const max_diff = _.maxBy(bubble_data, 'diff').diff;
    bubble_data = bubble_data.map(item => {
        item.deviation = item.diff * 10 / max_diff;
        return item;
    });
    return bubble_data;
}

function draw_bubble_chart(data, model='mlp') {
    data = prepare_bubble_data(data, model);

    // sort data by count
    data = _.orderBy(data, ['count'], ['desc']);

    // initialize configs of the chart
    const margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1000 - margin.left - margin.right;
    const height = 660;

    // Define color range of bubbles
    const color_range = ["#a30f15", "#dfa6ad"];
    let color_space = d3.scaleSequential()
    .domain([data[0].count, data[data.length-1].count])
    .range(color_range);

    // define layout of the chart
    const pack = data => d3.pack()
    .size([width - 2, height - 2])(d3.hierarchy({children: data})
    .sum(d => d.count));
    const root = pack(data);

    // calculate total count
    let total_count = 0;
    data.forEach(item => {
        total_count += item.count || 0;
    });

    // clear chart container
    d3.selectAll('.chart-item svg.bubble-svg').remove();
    // set svg shape/size
    const svg = d3.select('.chart-item')
        .append("svg")
        .attr('class', 'bubble-svg')
        .attr("viewBox", [0, 0, width, height]);

    // tooltip construction piece 
    const tooltip = d3.tip().attr('class', 'd3-tip')
    .html(function (event, d, x, y) {
        const value = (d.data.count || 0).toLocaleString('en-US');
        const name = d.data.name || 'Greenland';
        return `<div>
        <p>Country: <strong>${name}</strong></p>
        <p>New Cases: <strong>${value}</strong></p>
        </div>`;
    });

    svg.on('mousedown', function (ev) {
        // tooltip.hide();
        get_segment_class(ev, true);
    });
    svg.attr("width", width)
        .attr("height", height)
        .style("background", 'ivory')
        .append('g')
        .call(tooltip);
    
    let cur_scale = 1;
    redraw_bubble_text(root, svg, cur_scale);

    // set zoom functon on to the svg
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[-width,-height], [width, height]])
        .on("zoom", (event) => {
            svg.attr('transform', event.transform)
            cur_scale = event.transform.k;
            redraw_bubble_text(root, svg, cur_scale)
        });
    svg.call(zoom);

    // reset bubble label(country code) on change scale of the svg
    function redraw_bubble_text(root, svg, cur_scale) {

        // clear container
        svg.selectAll(".country-code").remove();

        // construct bubble circles
        for (let k = 0; k < 2; k++) {
            add_leaf(k);
        }

        function add_leaf(k) {
            const shift = 5;
            const abberation = k === 0;
            const leaf = svg.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => {
                return `translate(${d.x + 1},${d.y + 1})`
            });

            leaf.append("circle")
            .attr("id", d => (d.data.name + '-' + d.data.count))
            .attr("r", d => {
                return abberation ? (d.r + d.data.deviation) : d.r;
            })
            // .attr("cx", d => {
            //     return abberation ? 0 : 0;
            // })
            .attr("cy", d => {
                return abberation ? d.data.deviation : 0;
            })
            .attr("fill-opacity", (d) => {
                return abberation ? 0.1 : 1;
            })
            .attr('class', ()=> {
                return abberation ? 'abberation' : 'actual';
            })
            .attr("fill", d => {
                if (abberation) {
                    return 'blue';
                } else {
                    return color_space(d.data.count);
                }
            })
            .on('mouseover', function (event, d) {
                // set_cell_tooltip_position(event, tooltip, d);
            })
            .on('mouseout', function (d) {
                tooltip.hide();
            })
            .on("mousemove", function(event, d){
                // set_cell_tooltip_position(event, tooltip, d);
            })
            .on('mousedown', function (ev, d) {
                if (!abberation) {
                    draw_stream_graph(prop_pred_data, model, d.data.name, ev);
                }
            });

            leaf.append("text")
            .attr("y", 5)
            .attr("x", (d, i, nodes) => {
                return (-d.data.name.length*4) + 'px';
            })
            .text(function(d){
                return abberation ? '' : get_cell_label(total_count, cur_scale, d);
            })
            .attr("font-size", (d) => {
                let size = 10 / cur_scale;
                return size + 'px';
            })
            .attr("fill", (d) => {
                const perc = get_cell_count_norm(data, d);
                const color = perc <= 0.5 ? 'black' : 'white';
                return color;
            });
        }
    }
}


function get_cell_label(total_count, cur_scale, d) {
    let text = d.data.code;
    if (total_count > 100000000) {
        if (cur_scale < 2 && d.data.count < 8000000) {
            text = '';
        }
        if (cur_scale >= 2 && cur_scale < 3 && d.data.count < 2000000) {
            text = '';
        }
        if (cur_scale >= 3 && cur_scale < 5 && d.data.count < 1500000) {
            text = '';
        }
        if (cur_scale >= 5 && cur_scale < 7 && d.data.count < 1000000) {
            text = '';
        }
        if (cur_scale >= 7 && cur_scale < 10 && d.data.count < 500000) {
            text = '';
        }
        if (cur_scale >= 10 && cur_scale < 14 && d.data.count < 300000) {
            text = '';
        }
        if (cur_scale >= 14 && cur_scale < 17 && d.data.count < 100000) {
            text = '';
        }
        if (cur_scale >= 17 && cur_scale < 45 && d.data.count < 50000) {
            text = '';
        }
    }
    return text;
}

function get_cell_count_norm(data, d) {
    const total = _.reduce(data, (sum, item) => {
        return sum += Number(item.count || 0);
    }, 0);
    count = Number(d.data.count || 0);
    let perc = count * 10 / Number(total);
    perc = perc > 1 ? 1 : perc;
    return perc;
}