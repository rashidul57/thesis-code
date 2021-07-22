
const date_format = 'YYYY-MM-DD';
const drag_start = {};
const bubble_chart_width = 780;
const bubble_chart_height = 750;
let bubble_chart_scale = 1;
let stream_chart_scale = 1;
let bubble_removed = [];
// let global_streams = ['Turkey', 'Bangladesh'];
let global_streams = [];

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
        draw_a_line(".left-chart-container", l_data, 'count', types[k].label, k, '');
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


function draw_stream_graph(pred_data, algo='mlp', container, sel_country='', sel_country_cls='', ev) {
    stream_blur_on = true;
    if (container) {
        d3.select("." + container).selectAll("svg").remove();
    }
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
            let country_data = all_covid_data[sel_country];
            // Filtering is needed to ensure country stream start point go inside circle
            let found = false;
            country_data = country_data.filter(item => {
                if (!found) {
                    found = item.new_cases;
                }
                return found;
            });
            keys = Object.keys(country_data[0]).filter(key => ['date', 'iso_code', 'location'].indexOf(key) === -1);
            data = get_normalized_data(country_data, keys);
        }

    } else {
        if (country_stream_mode === 'Prediction') {
            for (let i = 0; i < max; i++) {
                const date = moment(new Date(pred_data[keys[0]].mlp.start_timestamp)).add('days', i).toDate();
                const record = {date};
                keys.forEach(country => {
                    record[country] = pred_data[country][algo].y_pred[i] && pred_data[country][algo].y_pred[i][0] || 0;
                });
                data.push(record);
            }
            data = get_normalized_data(data, keys);
        } else {
            const usa_data = all_covid_data['United States'];
            max = usa_data.length;
            const start_date = new Date(usa_data[0].date);
            for (let i = 0; i < max; i++) {
                const date = moment(start_date).add('days', i).toDate();
                const formated_date = moment(date).format(date_format);
                const record = {date};
                keys.forEach(country => {
                    const country_data = all_covid_data[country];
                    const date_rec = _.find(country_data, item => item.date === formated_date);
                    record[country] = date_rec && date_rec[sel_property] || 0;
                });
                data.push(record);
            }
            data = get_normalized_data(data, keys);
        }
    }

    // apply the selected filter only
    if (global_streams.length) {
        data = data.map(item => {
            for (let prop in item) {
                if (!(prop === 'date' || global_streams.indexOf(prop) > -1)) {
                    delete item[prop];
                }
            }
            return item;
        });
        keys = global_streams;
    }


    // set the dimensions and margins of the graph
    margin = ({top: 0, right: 0, bottom: 0, left: 0});

    height = sel_country ? 150 : 500;
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

    y = d3.scaleSqrt()
    .domain([d3.min(series, d => d3.min(d, d => d[0])), d3.max(series, d => d3.max(d, d => d[1]))])
    .range([height - margin.bottom, margin.top]);

    x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

    let start_path_y;
    area = d3.area()
    .x(d => x(d.data.date))
    .y0((d, indx) => {
        const d1 = y(d[0]);
        if (indx === 0) {
            start_path_y = d1;
        }
        return d1;
    })
    .y1(d => y(d[1]));

    // draw legend
    if (!sel_country) {
        const c_svg = d3.select(".left-chart-container")
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

    let svg;
    if (sel_country) {
        if (ev.target) {
            svg = d3.select('.' + 'circle-container-' + sel_country_cls)
            .append('svg')
            .attr('class', 'country-stream-svg ');
        } else {
            return;
        }
    } else {
        svg = d3.select("." + container)
        .append("svg")
        .attr('class', 'main-stream-svg');
        svg.attr("viewBox", [0, 0, width, height]);

        add_texture_defs(svg, keys, color)
    }

    svg.append("g")
        .attr('class', () => {
            return sel_country ? '' : 'main-stream-g';
        })
        .selectAll("path")
        .data(series)
        .join("path")
        // .attr("fill", ({key}) => color(key))
        .attr("fill", ({key}, index) => {
            let fill_code = color(key);
            if (!sel_country) {
                const nameCls = get_name_cls(key);
                fill_code = 'url(#texture-' + nameCls + ')';
            }
            return fill_code;
        })
        .attr("d", area)
        .attr('class', ({key}) =>{
            const nameCls = get_name_cls(key);
            const cls = 'main-stream-cell stream-cell-' + nameCls;
            return sel_country ? '' : cls;
        })
        .append("title")
        .text(({key}) => {
            return key;
        });

    if (sel_country) {
        const country_center = d3.select('.circle-container-' + sel_country_cls + ' circle').attr('center-point').split(',');
        const c_cx = Number(country_center[0]);
        const c_cy = Number(country_center[1]);
        const ty = start_path_y;
        const p1 = {x: bubble_chart_width/2, y: bubble_chart_height/2};
        const p2 = {x: c_cx, y: c_cy};
        const angle = get_angle(p1, p2);
        const country_g = svg.select('g');
        country_g
            .style('transform', `translate(0px,-${ty}px) rotate(${angle}deg)`)
            .style('transform-origin', `0px ${ty}px`);
    }

    if (sel_country) {
        // add_zoom_listener(svg, width, height, 150);
    } else {
        const texture_prop = sel_property === 'new_cases' ? 'new_deaths' : 'new_cases';
        const paths = svg.selectAll('.main-stream-g path').nodes();
        const poly_item_count = 20;
        paths.forEach((path_item, index) => {
            const country = path_item.textContent;
            const d = d3.select(path_item).attr('d').replace(/[MZ]/gi, '');
            const parts = d.split('L');
            let poly_data = {};
            
            const size = parts.length;
            const side1 = _.take(parts, size/2);
            const side2 = _.takeRight(parts, size/2);
            const side_len = side1.length;
            let log = false;
            side1.forEach((item, index) => {
                const sec_indx = parseInt(index / poly_item_count, 10);
                const cc = pred_data;
                const dd = pred_data[country];
                if (!poly_data[sec_indx]) {
                    poly_data[sec_indx] = {start: [], end: [], count: 0};
                    log = true;
                }
                
                poly_data[sec_indx].count += pred_data[country][algo].y[sec_indx];
                const ind = index%poly_item_count;
                const val = side2[side_len - (poly_item_count*(sec_indx+1)) + ind - 1];
                if (val) {
                    poly_data[sec_indx].start.push(item);
                    poly_data[sec_indx].end.push(val);
                }
            });

            const max_val = _.maxBy(_.values(poly_data), ['count']).count;
            const cont_g = svg.select('.main-stream-g');
            for (let prop in poly_data) {
                const start = poly_data[prop].start.join('L');
                const end = poly_data[prop].end.join('L');
                
                const d_str = 'M' + start + 'L' + end + ' Z';
                // console.log(d_str)
                cont_g.append('path')
                    .attr('class', 'sec-path')
                    .style('opacity', () => {
                        const opacity = 1 - poly_data[prop].count/max_val;
                        // console.log(opacity)
                        return opacity;
                    })
                    .attr('d', d_str)
                    .on('mousedown', function (ev, d) {
                        const el = d3.select(this);
                        const opacity = el.style('opacity');
                        let actual_opacity = el.attr('actual-opacity');
                        if (!actual_opacity) {
                            actual_opacity = opacity;
                            el.attr('actual-opacity', actual_opacity);
                        }
                        const new_opacity = opacity === actual_opacity ? 0 : actual_opacity;
                        el.style('opacity', new_opacity);
                    });
                // c++;
            }
        });

        svg.append("g")
            .call(xAxis);

        add_zoom_listener(svg, width, height, 'main-stream-svg');
    }

}

function get_name_cls(key) {
    return key.replace(/\s/g, '-') || '';
}

function add_texture_defs(svg, keys, color) {
    keys.forEach((key, index) => {
        const nameCls = get_name_cls(key);
        svg
        .append('defs')
        .append('pattern')
          .attr('id', 'texture-' + nameCls)
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', 7)
          .attr('height', 7)
        .append('circle')
          .attr('cx', 4)
          .attr('cy', 4)
          .attr('r', 3)
          .attr('fill', color(key));
    });
    
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
        // console.log(cls)
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
        const diff = Math.abs(actual - count);
        const nameCls = get_name_cls(country);
        return {name: country, code: data[country].code, count, actual, diff, nameCls};
    });
    const max_diff = _.maxBy(bubble_data, 'diff').diff;
    bubble_data = bubble_data.map(item => {
        item.deviation = item.diff * 7 / max_diff;
        return item;
    });
    return bubble_data;
}


let bubble_data;

function draw_bubble_chart(data, model='mlp') {
    data = prepare_bubble_data(data, model);
    
    data = data.filter(item => {
        return bubble_removed.indexOf(item.name) === -1;
    });

    // sort data by count
    bubble_data = data = _.orderBy(data, ['count'], ['desc']);

    // initialize configs of the chart
    const width = bubble_chart_width;
    const height = bubble_chart_height;

    // Define color range of bubbles
    const color_range = ["#a30f15", "#dfa6ad"];
    let color_space = d3.scaleSequential()
    .domain([data[0].count, data[data.length-1].count])
    .range(color_range);

    // define layout of the chart
    const pack = data => d3.pack()
    .size([width, height])(d3.hierarchy({children: data})
    .sum(d => d.count));
    const root = pack(data);

    // calculate total count
    let total_count = 0;
    data.forEach(item => {
        total_count += item.count || 0;
    });

    // clear chart container
    d3.selectAll('.left-chart-container svg.bubble-svg').remove();
    // set svg shape/size
    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr('class', 'bubble-svg')
        .attr("width", width)
        .attr("height", height)
        // .attr("transform", 
        //     "translate(" + margin_w/2 + "," + margin_h/2 + ")"
        // )
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
        // get_segment_class(ev, true);
    });

    // svg.append('g')
    //     .call(tooltip);
    
    let cur_scale = 1;
    redraw_bubbles(root, svg, cur_scale);

    // set zoom functon on to the svg
    add_zoom_listener(svg, width, height, 'bubble-svg');

    // reset bubble label(country code) on change scale of the svg
    function redraw_bubbles(root, svg, cur_scale) {

        // clear container
        svg.selectAll(".country-code").remove();
        svg.selectAll('.country-circle').remove();

        // construct bubble circles
        for (let k = 0; k < 2; k++) {
            add_leaf(k);
        }

        function add_leaf(k) {
            const abberation = k === 0;
            const leaf = svg.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr('class', (d) => {
                const nameCls = d && d.data.nameCls || '';
                let cls = 'circle-container circle-container-' + nameCls;
                return cls;
            })
            .attr("transform", d => {
                return `translate(${d.x + 1},${d.y + 1})`
            });

            leaf.append("circle")
            .attr('class', 'country-circle')
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
            .attr('center-point', (d) => {
                return d.x + ',' + d.y;
            })
            .attr("fill-opacity", (d) => {
                return abberation ? 0.15 : 1;
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
                if (control_mode === 'wing-stream') {
                    reorder_bubbles(this.parentNode, root.leaves());
                    toggle_focus(d.data.nameCls, 'mouseover');
                }
            })
            .on('mouseout', function (event, d) {
                if (control_mode === 'wing-stream') {
                    toggle_focus(d.data.nameCls, 'mouseout');
                }
            })
            .on("mousemove", function(event, d){
                // set_cell_tooltip_position(event, tooltip, d);
            })
            .on('mousedown', function (ev, d) {
                let nameCls = d.data.nameCls;
                switch (control_mode) {
                    case 'wing-stream':
                        if (!abberation) {
                            d3.selectAll('.circle-container-' + nameCls + ' .country-stream-svg').remove();
                            draw_stream_graph(prop_pred_data, model, undefined, d.data.name, nameCls, ev);
                        }
                        break;
                    case 'bubble-remove':
                        d3.select('.circle-container-' + nameCls).style("opacity", 0.1);
                        if (bubble_removed.indexOf(d.data.name) > -1) {
                            d3.select('.circle-container-' + nameCls).style("opacity", 1);
                            bubble_removed = bubble_removed.filter(item => item !== d.data.name);
                        } else {
                            bubble_removed.push(d.data.name);
                            d3.select('.circle-container-' + nameCls).style("opacity", 0.1);
                        }
                        toggle_go();
                        toggle_cross('.' + control_mode + ' .cross', bubble_removed.length);
                        break;

                    case 'global-streams':
                        if (global_streams.indexOf(d.data.name) > -1) {
                            global_streams = global_streams.filter(item => item !== d.data.name);
                        } else {
                            global_streams.push(d.data.name);
                        }
                        const opacity = global_streams.length ? 0.1 : 0.8;
                        d3.selectAll(".main-stream-chart" + ' .main-stream-cell').style("opacity", opacity);
                        global_streams.forEach(name => {
                            nameCls = get_name_cls(name);
                            d3.select(".main-stream-chart" + ' .stream-cell-' + nameCls).style("opacity", 1);
                        });

                        toggle_go();
                        toggle_cross('.' + control_mode + ' .cross', global_streams.length);

                        break;
                }
                
            });

            if (!abberation) {
                add_country_code(leaf);
            }
        }
    }
}

function toggle_go() {
    const opacity = (bubble_removed.length > 0 || global_streams.length > 0) ? 1 : 0.3;
    d3.select('.btn-go').style("opacity", opacity);
}

function toggle_cross(selector, len) {
    const opacity = len ? 'inline' : 'none';
    d3.select(selector).style("display", opacity);
}

function add_country_code(country_cell) {
    country_cell.append("text")
        .attr('class', 'country-code')
        .attr("y", 5)
        .attr("x", (d, i, nodes) => {
            const shift = -d.data.code.length * 3/bubble_chart_scale;
            // if (d.data.code === 'EGY') {
            //     console.log(d.r, bubble_chart_scale, shift);
            // }
            return shift + 'px';
        })
        .text(function(d){
            const ratio = d.r*bubble_chart_scale;
            let label = ratio > 14 ? d.data.code : '';
            return label;
        })
        .attr("font-size", (d) => {
            let size = 10 / bubble_chart_scale;
            return size + 'px';
        })
        .attr("fill", (d) => {
            const perc = get_cell_count_norm(bubble_data, d);
            const color = perc <= 0.5 ? 'black' : 'white';
            return color;
        });
}

function add_zoom_listener(svg, width, height, selector) {
    svg = d3.selectAll('.' + selector)
    const zoom_level = 10;
    const zoom = d3.zoom()
        .scaleExtent([-5, zoom_level])
        .extent([[-width,-height], [width, height]])
        .translateExtent([[-width/zoom_level, -height/zoom_level], [width/zoom_level, height/zoom_level]])
        .on("zoom", (event) => {
            if (selector === 'main-stream-svg') {
                stream_chart_scale = event.transform.k;
            } else {
                bubble_chart_scale = event.transform.k;
                d3.selectAll('.circle-container text').remove();
                const circles = d3.selectAll('.circle-container');
                add_country_code(circles)
            }
            // console.log(event.sourceEvent.type, event.transform);
            if (!event.sourceEvent || event.sourceEvent.type === 'wheel') {
                const trans_str = svg.attr("transform") || '';
                if (trans_str && trans_str.indexOf('translate') > -1 && trans_str.indexOf('scale') > -1) {
                    const parts = trans_str.split(' ');
                    const translate = parts[0];
                    svg.attr("transform",
                        translate + " scale(" + event.transform.k + ")"
                    );
                } else {
                    svg.attr('transform', event.transform);
                }
            } else {
                return false;
            }
        });
    svg.call(zoom);

    let drag = d3.drag()
        .on('start', dragstarted, selector)
        // .on('drag', dragged)
        .on('end', (ev, data)=> {
            dragended(ev, data, selector);
        });
    const item_sel = selector === 'main-stream-svg' ? 'main-stream-g' : 'circle-container';
    svg.selectAll('.' + item_sel)
    .call(drag);
    
}

function dragstarted(d) {
    if (control_mode === 'pan') {
        drag_start.clientX = d.sourceEvent.clientX;
        drag_start.clientY = d.sourceEvent.clientY;
    }
}

function dragged(d, ev, selector) {
    // console.log('dragged')
    // svg = d3.selectAll('.zoomable')
}

function dragended(ev, d, selector) {
    if (control_mode === 'pan') {
        const diff_x = ev.sourceEvent.clientX - drag_start.clientX;
        const diff_y = ev.sourceEvent.clientY - drag_start.clientY;
        const svg = d3.selectAll('.' + selector)
        const trans_str = svg.attr("transform") || '';
        const parts = trans_str.split(' ');
        var points = parts[0].replace(/[(translate\()\)]/g, '').split(',');
        let scale = parts.length > 1 ? parts[1] : '';
        var x = Number(points[0]) || 10;
        var y = Number(points[1]) || 10;
        const new_x = x + diff_x;
        const new_y = y + diff_y;
        svg.attr("transform",
            "translate(" + new_x + "," + new_y + ") " + scale
        );
    }
}

function toggle_focus(nameCls, _event) {
    const selectors = [
        ".circle-container-" + nameCls + ' .country-stream-svg',
        ".main-stream-chart" + ' .stream-cell-' + nameCls
    ]
    selectors.forEach(selector => {
        const el = d3.select(selector);
        if (el.size()) {
            let cur_classes = el.attr('class');
            const classes = ['focused', 'dimmed'];
            if (_event === 'mouseover') {
                cur_classes = cur_classes.replace(classes[1], '').trim();
                cur_classes = cur_classes + ' ' + classes[0];
            } else {
                cur_classes = cur_classes.replace(classes[0], '').trim();
                cur_classes = cur_classes + ' ' + classes[1];
            }
            // console.log(cur_classes)
            el.attr('class', cur_classes);
        }
    });
}

function reorder_bubbles(country_node, leaves) {
    const parent_node = country_node.parentNode; // 
    leaves.forEach(leaf => {
        const node = d3.select('.circle-container-' + leaf.data.nameCls);
        if (node._groups[0][0] !== country_node) {
            parent_node.appendChild(node._groups[0][0]);
        }
    });
    parent_node.appendChild(country_node);
}

function clicked(event, [x, y]) {
    event.stopPropagation();
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(40).translate(-x, -y),
      d3.mouse(svg.node())
    );
  }


function get_cell_label(cur_scale, d) {
    let text = d.data.code;
    // if (d.data.count > 100000000) {
        if (cur_scale < 2 && d.data.count < 20000) {
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
    // }
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


function get_angle(p1, p2) {
    // var p1 = {
    //     x: 20,
    //     y: 20
    // };
    
    // var p2 = {
    //     x: 40,
    //     y: 40
    // };
    
    // angle in degrees
    var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return angleDeg;
}