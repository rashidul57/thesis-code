
const date_format = 'YYYY-MM-DD';
const drag_start = {};
const bubble_chart_width = 780;
const left_panel_height = 750;
let bubble_chart_scale = 1;
let stream_chart_scale = 1;
let bubble_removed = [];
let bubble_selected = [];
let global_streams = [];
let country_streams = [];
let bubble_data;
const bubble_colors = {0: '#64ffff', 1: '#ff95ff', 2: '#ffffB4'};
const bubble_colors1 = {0: '#ff0000', 1: '#800000', 2: '#FF00FF'}; // red, maroon, fushia
const bubble_colors2 = {0: '#008080	', 1: '#0000FF', 2: '#000080'}; //teal, blue, navy: https://en.wikipedia.org/wiki/Web_colors
const rgb_indexes = {'0': 'r', '1': 'g', '2': 'b'};


function draw_predicted_lines(data, sel_country='United States') {

    let num_dates = 0;
    countries.forEach(country => {
        if (data[country].mlp.y_pred.length > num_dates) {
            num_dates = data[country].mlp.y_pred.length;
        } 
    });

    const width = 895; // 955 - margin-x: 50 + 10
    const height = 710; // 750 - margin-y: 10 + 30
    const mlp_data = prop_pred_data[sel_country]['mlp'];
    const all_data = all_covid_data[sel_country];
    const ranges = mlp_data['ranges'];
    let preds = mlp_data['y_pred'];
    const total_num_of_days = all_data.length;
    const range_len = ranges.length;
    const svg = d3.select('.left-chart-container')
        .append('svg')
        .attr('class', 'lines-chart');
    
    let actuals = [];
    const pred_start = (total_num_of_days  - range_len);
    all_data.forEach((row, index) => {
        let count;
        let rec;
        if (index < pred_start) {
            count = row['new_cases'] || 0;
            rec = [index, count];
            actuals.push(rec);
        }
    });
    
    const last_actual_row = _.cloneDeep(actuals[actuals.length-1]);
    let pred_data = [_.cloneDeep(last_actual_row)];
    let lower_data = [_.cloneDeep(last_actual_row)];
    let upper_data = [_.cloneDeep(last_actual_row)];
    let lo_sum = 0, up_sum = 0, prd_sum = 0;
    const slice_len = 5;
    ranges.forEach((range, index) => {
        lo_sum += range[0];
        up_sum += range[1];
        prd_sum += preds[index];
        if (index%slice_len === 0 && index > 0) {
            lower_data.push([pred_start+index, lo_sum/slice_len]);
            upper_data.push([pred_start+index, up_sum/slice_len]);
            pred_data.push([pred_start+index, prd_sum/slice_len]);
            lo_sum = 0;
            up_sum = 0;
            prd_sum = 0;
        }
    });

    let max_y = -99999999;
    const all_line_data = _.concat(actuals, lower_data, upper_data, pred_data);
    all_line_data.forEach(rec => {
        if (rec[1] > max_y) {
            max_y = rec[1];
        }
    });

    const actual_line_str = get_line_str(actuals);
    const lower_line_str = get_line_str(lower_data);
    const upper_line_str = get_line_str(upper_data);
    const range_data = [_.cloneDeep(last_actual_row)].concat(upper_data).concat(lower_data.reverse());
    const range_poly = range_data.map(rec => rec.join(',')).join(' ');

    const pred_line_str = get_line_str(pred_data);

    // const actual_line_str = 'M' + actuals.join('L');
    const axis_line_str = 'M0,0L0,' + height + 'L' + width + ',' + height;
    
    draw_line(axis_line_str, 'black', 'axis', 1);
    draw_line(actual_line_str, 'black', 'actual', 1);
    // draw_line(lower_line_str, bubble_colors[1], 'lower');
    // draw_line(upper_line_str, bubble_colors[2], 'upper');
    draw_line(pred_line_str, 'red', 'pred', 1);

    svg
    .append('polygon')
    .attr('points', range_poly)
    .attr('fill-opacity', 0.33)
    .attr('fill', 'grey');


    svg
    .append("text")
    .text('Actual occurrences')
    .attr("x", 180)
    .attr("y", 528)
    .attr("font-size", 15);

    svg
    .append("text")
    .text('Prediction Range')
    .attr("x", 752)
    .attr("y", 615)
    .attr("font-size", 15);

    svg
    .append("text")
    .text('Number of cases')
    .attr("x", 20)
    .attr("y", 400)
    .attr("font-size", 15)
    .attr('transform', 'translate(-410,400) rotate(-90)');


    svg
    .append("text")
    .text('Date')
    .attr("x", 380)
    .attr("y", 728)
    .attr("font-size", 15);


    function get_line_str(data) {
        data = data.map(rec => {
            rec[0] = rec[0] * width/total_num_of_days;
            rec[1] = (max_y - rec[1]) * height/max_y;
            return rec.join(',');
        });
        return 'M' + data.join('L');
    }

    function draw_line(line_str, color, type, stroke_width) {
        svg.append("path")
        .attr("class", "line line-" + type)
        .attr("d", line_str)
        .attr("stroke", color)
        .attr("stroke-width", stroke_width);
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
    // clip.append('path')
    // .attr("class", "legend-line")
    // .style('stroke', country_colors[indx%11])
    // .attr("stroke-width", 2)
    // .attr('d', `M20,${27+indx*22},L60,${27+indx*22}`);

    // Add text of country name in legend
    // clip.append('text')
    // .attr("class", "legend-text")
    // .attr('fill', country_colors[indx%11])
    // .attr("x", 65)
    // .attr("y", 33+indx*22)
    // .html(leg_label);

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

}


function draw_stream_graph(params) {
    let {pred_data, container='', sel_country='', sel_country_cls='', drill_model, mode='color', q_country_index} = params;

    if (container && !drill_model) {
        d3.select("." + container).selectAll("svg").remove();
    }
    if (!sel_country_cls && sel_country) {
        sel_country_cls = get_name_cls(sel_country);
    }
    let data = [];
    let keys = Object.keys(pred_data);
    let max = 0;
    keys.forEach(country => {
        if (pred_data[country].mlp.y_pred.length > max) {
            max = pred_data[country].mlp.y_pred.length;
        }
    });

    if (sel_country) {
        if (country_stream_mode === 'Prediction') {

            let model_types = drill_model ? [drill_model] : ['mlp'];
            for (let i = 0; i < max; i++) {
                const date = moment(new Date(pred_data[keys[0]].mlp.start_timestamp)).add('days', i).toDate();
                const record = {date};
                model_types.forEach(model => {
                    const ranges = pred_data[sel_country][model].ranges[i];
                    record[model] = Math.abs(ranges[0] - ranges[1]) || 0;
                });
                data.push(record);
            }
            data = get_normalized_data(data, model_types);
            keys = model_types;
        } else {
            // For property(non prediction) based option
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
                const record_pred = {date};
                const record_low = {date};
                const record_up = {date};

                keys.forEach(country => {
                    record_pred[country] = pred_data[country][sel_model].y_pred[i] || 0;
                    record_low[country] = pred_data[country][sel_model].ranges[i][0] || 0;
                    record_up[country] = pred_data[country][sel_model].ranges[i][1] || 0;
                });
                data.push(record_pred);
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
            // data = get_normalized_data(data, keys);
        }
    }

    // apply the selected filter only
    if (!sel_country && global_streams.length) {
        for (let k = 0; k < data.length; k++) {
            for (let prop in data[k]) {
                if (!(prop === 'date' || global_streams.indexOf(prop) > -1)) {
                    delete data[k][prop];
                }
            }
        }
        keys = global_streams;
    }


    // set the dimensions and margins of the graph
    margin = ({top: 0, right: 0, bottom: 0, left: 0});

    height = sel_country ? 150 : 500;
    width = 500;

    color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeCategory10);

    let axis_y = height - margin.bottom;
    xAxis = g => g
    .attr("transform", `translate(0,${axis_y})`)
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
    .x(d => {
        if (!d.data) {
            return;
        }
        return x(d.data.date);
    })
    .y0((d, indx) => {
        const d1 = y(d[0]);
        if (indx === 0) {
            start_path_y = d1;
        }
        return d1;
    })
    .y1(d => y(d[1]));

    let svg;
    if (sel_country) {
        container = container ? ('.' + container) : ('.' + 'circle-container-' + sel_country_cls);
        if (container) {
            svg = d3.select(container)
            .append('svg')
            .attr('class', 'country-stream-svg ');

            if (drill_model) {
                svg
                .attr("preserveAspectRatio", "none")
                .attr("viewBox", "0 0 520 130");
            }
        } else {
            return;
        }
    } else {
        svg = d3.select("." + container)
        .append("svg")
        .attr('class', 'main-stream-svg');
        svg.attr("viewBox", [0, 0, width, height]);
    }

    const stream_countries = drill_country ? [drill_country] : global_streams.concat(country_streams);
    if (stream_countries.length && (!drill_country || (drill_country && drill_model === 'mlp'))) {
        def_textures(svg, stream_countries, max);
    }

    let stream = svg.append("g")
        .attr('class', () => {
            return sel_country ? 'selected-country-g' : 'main-stream-g';
        })
        .selectAll("path")
        .data(series)
        .join("path");

    stream
        .attr("d", area)
        .attr('class', ({key}) => {
            const nameCls = get_name_cls(key);
            return sel_country ? 'sel-country-stream-cell' : ('main-stream-cell stream-cell-' + nameCls);
        });

    // if (!question_mode) {
        stream.append("title")
        .text(({key}) => {
            return key;
        });
    // }

    if ((!global_streams.length && !drill_country && !question_mode) || mode === 'color') {
        stream.attr("fill", ({key}) => {
            return color(key);
        });
    }

    // for the selected country streams
    if (mode === 'color') {
        const cont_g = d3.selectAll('.country-stream-svg g');
        cont_g.selectAll('.sel-country-stream-cell').style('display', 'block');
        cont_g.selectAll('.texture-sec-path').remove();
    } else {
        show_textures(drill_model);
    }

    if (sel_country && !drill_model) {
        const country_center = d3.select('.circle-container-' + sel_country_cls + ' circle').attr('center-point').split(',');
        const c_cx = Number(country_center[0]);
        const c_cy = Number(country_center[1]);
        const ty = start_path_y;
        const p1 = {x: bubble_chart_width/2, y: left_panel_height/2};
        const p2 = {x: c_cx, y: c_cy};
        const angle = get_angle(p1, p2);
        const country_g = svg.select('g');
        country_g
            .style('transform', `translate(0px,-${ty}px) rotate(${angle}deg)`)
            .style('transform-origin', `0px ${ty}px`);

        // add_zoom_listener(svg, width, height, 150);

    } else {
        if (!drill_model) {
            svg.append("g").call(xAxis);
        }
        // const container_ = container ? ('.' + container) : ('.' + 'circle-container-' + sel_country_cls);
        add_zoom_listener(svg, width, height, 'main-stream-svg');
    }
}

function show_textures(drill_model) {
    let selectors;
    if (sel_chart_type === 'Bubble Chart') {
        selectors = drill_model ? ['.drill-models-container .model-row-' + drill_model] : ['.country-stream-svg'];
        if (global_streams.length) {
            d3.selectAll('.main-stream-cell').style("display", 'none');
            selectors.push('.main-stream-g');
        }
        if (drill_country) {
            d3.selectAll('.sel-country-stream-cell').style("display", 'none');
        }

    } else if (sel_chart_type === 'Horizon Chart') {
        selectors = ['.rate-svg'];
        d3.selectAll('.horizon-flow').style('display', 'none');
    }

    selectors.forEach((selector, sel_indx) => {
        const containers = d3.selectAll(selector).nodes();

        containers.forEach(container => {
            let cont_g = d3.select(container);
            const paths = cont_g.selectAll('path').nodes();

            if (selector.indexOf('country-stream') > -1) {
                cont_g = cont_g.select('g');
                cont_g.selectAll('.sel-country-stream-cell').style('display', 'none');
                cont_g.selectAll('.texture-sec-path').remove();
            }

            let num_of_days = 3;
            paths.forEach((path_item, path_index) => {
                let country, cur_model;
                if (selector.indexOf('country-stream') > -1) {
                    if (!path_item.parentElement) {
                        return;
                    }
                    const country_code = path_item.parentElement.parentElement.previousSibling.textContent;
                    country = mapped_countries[country_code];
                    cur_model = path_item.textContent;
                } else if (selector.indexOf('main-stream') > -1) {
                    country = path_item.textContent;
                    cur_model = sel_model;
                } else if (selector.indexOf('rate-svg') > -1) {
                    country = path_item.parentElement.__data__.name;
                    cur_model = sel_model;
                    cont_g = d3.select(path_item.parentElement.parentElement)
                        .append('g')
                        .attr("transform", `translate(-2,24)`);
        
                } else if (selector.indexOf('drill') > -1) {
                    cur_model = drill_model;
                    country = drill_country;
                    cont_g = cont_g.select('g');
                }
                
                const path_d = d3.select(path_item).attr('d');
                if (!path_d) {
                    return;
                }
                const d = path_d.replace(/[MZ]/gi, '').replace(/C/g, 'L');
                const parts = d.split('L');
                let poly_data = {};
                
                const size = parts.length;
                const side1 = _.take(parts, size/2);
                let side2 = _.takeRight(parts, size/2);
                // console.log(country, side1.length);

                side2.reverse();
                if (!forecast_data[sel_property][country]) {
                    return;
                }
                const country_data = forecast_data[sel_property][country][cur_model];
                
                let sec_indx = 0;
                side1.forEach((item, side_index) => {
                    if (!poly_data[sec_indx]) {
                        poly_data[sec_indx] = {start: [], end: [], count: 0};
                    }

                    if (sec_indx > 0 && poly_data[sec_indx].start.length === 0) {
                        poly_data[sec_indx].start.push(side1[side_index-1]);
                        poly_data[sec_indx].end.push(side2[side_index-1]);
                        poly_data[sec_indx].count = get_count(country_data, side_index-1);
                    }

                    poly_data[sec_indx].count += get_count(country_data, side_index);

                    const val = side2[side_index];
                    if (val) {
                        poly_data[sec_indx].start.push(item);
                        poly_data[sec_indx].end.push(val);
                    }

                    if (poly_data[sec_indx].start.length === num_of_days) {
                        sec_indx++;
                    }
                });

                for (let sec_indx in poly_data) {
                    const start = poly_data[sec_indx].start.join('L');
                    const end = poly_data[sec_indx].end.reverse().join('L');
                    let deviation = parseInt(poly_data[sec_indx].count/(num_of_days*100), 10);
                    while (deviation >= 10) {
                        deviation = Math.ceil(deviation / 10);
                    }

                    if (!start || !end) {
                        continue;
                    }

                    const d_str = 'M' + start + 'L' + end + ' Z';
                    // cont_g.append('path')
                    // .attr("stroke", 'red')
                    // .attr("stroke-width", 1)
                    // .attr("fill", "none")
                    // .attr('class', 'poly' + sec_indx)
                    // .attr('d', d_str);

                    for (let k = 0; k < 3; k++) {
                        add_texture_layer(k, deviation, cont_g, d_str, country, path_index, selector);
                    }
                }
            });
        });
    });

    function get_count(country_data, side_index) {
        return country_data['y_pred'] && country_data['y_pred'][side_index]|| 0;
    }


    function add_texture_layer(k, deviation, cont_g, d_str, country, path_index, selector) {
        const nameCls = get_name_cls(country);
        if (selector.indexOf('main') > -1 || selector.indexOf('rate-svg') > -1) {
            path_index = path_index%2 === 0 ? color_mappings[country][0] : color_mappings[country][2];
        }

        cont_g.append('path')
            .attr('class', 'texture-sec-path path-' + country)
            .attr("fill", 'url(#pat-' + nameCls + '-' + path_index + '-'+ rgb_indexes[k] + '-' + deviation + ')')
            // .attr('fill-opacity', 0.33)
            .style("mix-blend-mode", "darken")
            .attr('d', d_str)
            .append('title')
            .text('Uncertainty: ' + deviation);
            // .on('mousedown', function (ev, d) {
            //     const el = d3.select(this);
            //     const opacity = el.style('opacity');
            //     let actual_opacity = el.attr('actual-opacity');
            //     if (!actual_opacity) {
            //         actual_opacity = opacity;
            //         el.attr('actual-opacity', actual_opacity);
            //     }
            //     const new_opacity = opacity === actual_opacity ? 0 : actual_opacity;
            //     el.style('opacity', new_opacity);
            // });
    }
}


function draw_horizon_chart(pred_data, mode='color') {
    let countries = Object.keys(pred_data);
    let num_dates = 0;
    let start_date;
    const overlap = 1;
    const width = 1000;
    if (question_mode) {
        countries = _.take(countries, 12);
    } else {
        countries = _.take(countries, 20);
    }
    countries.forEach(country => {
        if (pred_data[country][sel_model].y_pred.length > num_dates) {
            num_dates = pred_data[country][sel_model].y_pred.length;
        }
        const date = new Date(pred_data[country][sel_model].start_timestamp);
        if (start_date) {
            if (start_date.getTime() < date.getTime()) {
                start_date = date;
            }
        } else {
            start_date = date;
        }
    });

    const dates = [];
    for (let i = 0; i < num_dates; i++) {
        const date = moment(start_date).add('days', i).toDate();
        dates.push(date);
    }
    
    const series = [];
    countries.forEach(country => {
        let predictions = [];
        let lower_ranges = [];
        let upper_ranges = [];
        for (let i = 0; i < num_dates; i++) {
            const pred = pred_data[country][sel_model].y_pred[i] || 0;
            const ranges = pred_data[country][sel_model].ranges[i];
            predictions.push(parseInt(pred/1000));
            lower_ranges.push(ranges[0]);
            upper_ranges.push(ranges[1]);
        }
        max = _.max(predictions);
        predictions = predictions.map(val => val/max);

        max = _.max(lower_ranges);
        lower_ranges = lower_ranges.map(val => val/max);

        max = _.max(upper_ranges);
        upper_ranges = upper_ranges.map(val => val/max);

        series.push({name: country, lower_ranges, predictions, upper_ranges});
    });
    const data = {dates, series};

    // find countries
    max = 0;
    countries.forEach(country => {
        if (pred_data[country].mlp.y_pred.length > max) {
            max = pred_data[country].mlp.y_pred.length;
        }
    });

    const step = 23;
    const margin = ({top: 30, right: 10, bottom: 0, left: 50});
    if (question_mode) {
        margin.top = 60;
    }
    let height = data.series.length * (step + 1) + margin.top + margin.bottom;
    if (question_mode) {
        height += 145;
    }

    const y = d3.scaleLinear()
    .domain([0, d3.max(data.series, d => d3.max(d.predictions))])
    .range([0, -overlap * step]);

    const x = d3.scaleUtc()
    .domain(d3.extent(data.dates))
    .range([60, width]);

    const area = d3.area()
    .curve(d3.curveBasis)
    .defined(d => !isNaN(d))
    .x((d, i) => x(data.dates[i]))
    .y0(0)
    .y1(d => y(d));

    const xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80).tickSizeOuter(0))
    .call(g => g.selectAll(".tick").filter(d => x(d) < margin.left || x(d) >= width - margin.right).remove())
    .call(g => g.select(".domain").remove());

    // remove if exists
    d3.selectAll('.left-chart-container svg').remove();

    const color = i => d3.schemePurples[Math.max(3, overlap)][i + Math.max(0, 3 - overlap)];
    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr('class', 'rate-svg')
        .attr("viewBox", [0, 0, width, height])
        .style("font", "10px sans-serif");

    // data.series = data.series.map(item => {
    //     item.values = item[k];
    //     return item;
    // });
    const ident_data = data.series.map(d => Object.assign({
        clipId: DOM.uid("clip"),
        pathId: DOM.uid("path")
    }, d));

    const g = svg.append("g")
        .selectAll("g")
        .data(ident_data)
        .join("g")
        .attr("transform", (d, i) => `translate(0,${i * (step + 1) + margin.top})`);

    g.append("clipPath")
        .attr("id", d => d.clipId.id)
        .append("rect")
        .attr("width", width)
        .attr("height", step);

    g.append("defs")
        .append("path")
        .attr("id", d => d.pathId.id)
        .attr("d", d => area(d.predictions));

    g.append("g")
        .attr("clip-path", d => {
            const c_path = 'url(' + d.clipId.href + ')';
            return c_path;
        })
        .selectAll("use")
        .data(d => {
            const ret = new Array(overlap).fill(d);
            return ret;
        })
        .join("use")
        .attr('class', 'horizon-flow')
        .attr("transform", (d, i) => `translate(0,${(i + 1) * step})`)
        .attr("xlink:href", d => d.pathId.href);

    g.append("text")
        .attr("x", 4)
        .attr("y", step / 2)
        .attr("dy", "0.35em")
        .attr('fill', 'black')
        .text(d => d.name);

    svg.append("g")
        .call(xAxis);

    if (mode === 'color') {
        g
        .attr("fill", (d, i) => {
            return bubble_colors[0];
        })
        .attr("fill-opacity", (d) => {
            return 0.7;
        });
    } else {
        def_textures(svg, countries, max);
        show_textures();
    }
    
}

function draw_parallel_coords() {
    const props = ['new_cases', 'new_deaths', 'new_tests', 'new_vaccinations'];
    const keys = props;
    const keyz = props[0];

    const data_pred = [];
    const lower_range = [];
    const upper_range = [];
    let top_countries = _.clone(countries);
    if (sel_country_num === 0) {
        top_countries = selected_countries;
    } else {
        if (sel_country_num !== 'all') {
            top_countries = _.take(top_countries, sel_country_num);
        }
    }

    top_countries.forEach(country  => {
        const pred_row = {name: country};
        const lr_row = {name: country};
        const ur_row = {name: country};
        props.forEach(prop => {
            if (!forecast_data[prop][country]) {
                return;
            }
            const preds = forecast_data[prop][country][sel_model]['y_pred'];
            preds.forEach(value => {
                pred_row[prop] = (pred_row[prop] || 0)  + Number(value || 0);
            });
            const ranges = forecast_data[prop][country][sel_model]['ranges'];
            ranges.forEach(range => {
                lr_row[prop] = (lr_row[prop] || 0)  + range[0];
                ur_row[prop] = (ur_row[prop] || 0)  + range[1];
            });
        });
        data_pred.push(pred_row);
        lower_range.push(lr_row);
        upper_range.push(ur_row);
    });

    const perc_uncerts = [];
    for (let k = 0; k < upper_range.length; k++) {
        const perc_rec = {name: upper_range[k].name};
        props.forEach(prop => {
            const upper_val = upper_range[k][prop] || 0;
            const lower_val = lower_range[k][prop] || 0;
            perc_rec[prop] = upper_val > 0 ? (Math.abs(upper_val - lower_val) * 100/upper_val) : 0;
        });
        perc_uncerts.push(perc_rec);
    }

    const width = 1000;
    const height = keys.length * 120;
    const margin = ({top: 20, right: 10, bottom: 30, left: 10});
    const line = d3.line()
    .defined(([, value]) => value != null)
    .x(([key, value]) => x.get(key)(value))
    .y(([key]) => y(key));
    
    const x = new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(data_pred, d => d[key]), [margin.left, width - margin.right])]));
    const y = d3.scalePoint(keys, [margin.top, height - margin.bottom]);
    const z = d3.scaleSequential(x.get(keyz).domain(), t => d3.interpolateBrBG(1 - t));

    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr('class', 'rate-svg')
        .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
      .attr('class', 'solid-line')
    .selectAll("path")
    .data(data_pred.slice().sort((a, b) => d3.ascending(a[keyz], b[keyz])))
    .join("path")
      .attr("stroke", d => z(d[keyz]))
      .attr("d", d => {
          const vals = d3.cross(keys, [d], (key, d) => [key, d[key] || 0]);
          return line(vals);
    })
    .append("title")
      .text(d => d.name);

    svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
      .attr('class', 'dashed-line')
    .selectAll("path")
    .data(lower_range.slice().sort((a, b) => d3.ascending(a[keyz], b[keyz])))
    .join("path")
      .attr("stroke", d => z(d[keyz]))
      .attr("d", d => {
          const vals = d3.cross(keys, [d], (key, d) => [key, d[key] || 0]);
          return line(vals);
    })
    .append("title")
      .text(d => d.name);

      svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
      .attr('class', 'dashed-line')
    .selectAll("path")
    .data(upper_range.slice().sort((a, b) => d3.ascending(a[keyz], b[keyz])))
    .join("path")
      .attr("stroke", d => z(d[keyz]))
      .attr("d", d => {
          const vals = d3.cross(keys, [d], (key, d) => [key, d[key] || 0]);
          return line(vals);
    })
    .append("title")
      .text(d => d.name);
    

    svg.append("g")
    .selectAll("g")
    .data(keys)
    .join("g")
      .attr("transform", d => `translate(0,${y(d)})`)
      .each(function(d) { d3.select(this).call(d3.axisBottom(x.get(d))); })
      .call(g => g.append("text")
        .attr("x", margin.left)
        .attr("y", -6)
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .text(d => d))
      .call(g => g.selectAll("text")
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white"));

    // Draw polygons
    const dashed_lines = d3.selectAll('.rate-svg g.dashed-line path').nodes();
    const mid = dashed_lines.length/2;
    const r_polygons = [];
    const g_polygons = [];
    const b_polygons = [];
    for (let k = 0; k < mid; k++) {
        const lb_line = dashed_lines[k];
        const ub_line = dashed_lines[mid + k];
        let lb_line_points = lb_line.getAttribute('d').replace('M', '').split('L')
        let ub_line_points = ub_line.getAttribute('d').replace('M', '').split('L');
        
        // copy points for green and blue colors
        const green_lb_line_points = _.cloneDeep(lb_line_points);
        const green_ub_line_points = _.cloneDeep(ub_line_points);
        const blue_lb_line_points = _.cloneDeep(lb_line_points);
        const blue_ub_line_points = _.cloneDeep(ub_line_points);

        r_polygons.push(lb_line_points.join(' ') + ' ' + ub_line_points.reverse().join(' '));
        
        // add percentage uncertainty on lower bound-x
        for (let i = 0; i < green_lb_line_points.length; i++) {
            const lo_points = green_lb_line_points[i].split(',');
            const l_point_x = Number(lo_points[0]);
            const change = (l_point_x * perc_uncerts[k][props[i]])/100;
            lo_points[0] = l_point_x + change/2;
            green_lb_line_points[i] = lo_points.join(',');
        }
        g_polygons.push(green_lb_line_points.join(' ') + ' ' + green_ub_line_points.reverse().join(' '));

        // subtract percentage uncertainty from upper bound-x
        for (let i = 0; i < lb_line_points.length; i++) {
            const hi_points = blue_ub_line_points[i].split(',');
            const r_point_x = Number(hi_points[0]);
            const change = (r_point_x * perc_uncerts[k][props[i]])/(100 * 2);
            hi_points[0] = r_point_x - change/2;
            blue_ub_line_points[i] = hi_points.join(',');
        }
        b_polygons.push(blue_lb_line_points.join(' ') + ' ' + blue_ub_line_points.reverse().join(' '));
    }

    [r_polygons, g_polygons, b_polygons].forEach((polygon_data, k) => {
        draw_polys(polygon_data, k);
    });

    show_hide_polygons();
    

    function draw_polys(polygon_data, k) {
        svg.selectAll('polygon-'+ k)
        .data(polygon_data)
        .enter()
        .append('polygon')
        .attr('points', d=> d)
        // .attr('fill-opacity', 0.33)
        .style("mix-blend-mode", "darken")
        .attr('fill', bubble_colors[k])
        .attr('class', 'parallel-coords')
        .append('title')
        .text((d, i) => {
            return perc_uncerts[i].name;
        });
    }

}

function show_hide_polygons() {
    d3.selectAll('polygon').style('display', show_polygon ? 'inline': 'none');
}

function draw_usage_chart() {
    let data = [];
    const prop = 'new_cases';
    const top_countries = _.take(countries, 31);
    top_countries.forEach(country  => {
        const c_base = all_covid_data[country];
        const c_data = {name: country, iso_code: c_base[0].iso_code};

        let preds = forecast_data[prop][country][sel_model]['y_pred'];
        let deaths_preds = forecast_data['new_deaths'][country][sel_model]['y_pred'];
        const start_date = new Date(forecast_data[prop][country][sel_model].start_timestamp);

        if (question_mode) {
            preds = _.take(preds, 25)
        } else {
            preds = _.take(preds, 50); // to smooth rendering
        }

        preds.forEach((value, i) => {
            const date = moment(start_date).add('days', i).toDate();
            const ranges = forecast_data[prop][country][sel_model]['ranges'][i];
            const divider = _.max([ranges[0], ranges[1], value]);
            const uncertainty = Math.abs(ranges[1]-ranges[0])*100/divider;
            const row = Object.assign({date, uncertainty: uncertainty}, c_data);
            row[prop] = Number(value || 0);
            row['new_deaths'] = Number(deaths_preds[i] || 0);
            data.push(row);
        });
    });
    const c_codes = _.uniq(data.map(c => c.iso_code));
    data = _.orderBy(data, [(item) => item.date], ['asc']);

    const dateExtent = d3.extent(data, d => new Date(d.date));
    const margin = ({top: 35, right: 20, bottom: 0, left: 50});
    if (question_mode) {
        margin.top = 65;
    }
    let height = margin.top + margin.bottom + (d3.timeDay.count(...dateExtent) + 1) * 12;

    const width = 954;
    formatCountry = (d) => {
        return d;
    }

    formatDay = (d) => {
        return moment(new Date(d)).format('L');
    }
    formatDate = d3.timeFormat("%B %-d, %-I %p");
    formatUsage = d3.format(",.0f");

    const days_y = d3.timeDays(...dateExtent).map(date => moment(new Date(date)).format('L'))
    y = d3.scaleBand(days_y, [margin.top, height - margin.bottom]).round(true);
    x = d3.scaleBand(c_codes, [margin.left, width - margin.right]).round(true);
    
    yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(formatDay))
    .call(g => g.select(".domain").remove());

    xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).tickFormat(formatCountry))
    .call(g => g.select(".domain").remove());

    color = () => {
        let [min, max] = d3.extent(data, d => d.new_deaths);
        if (min < 0) {
          max = Math.max(-min, max);
          return d3.scaleDiverging([-max, 0, max], t => d3.interpolateRdBu(1 - t));
        }
        return d3.scaleSequential([0, max], d3.interpolateReds);
    }

    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr('class', 'rate-svg')
        .attr("viewBox", [0, 15, width, height + (question_mode ? 105 : 0)])
        .attr("font-family", "sans-serif")
        .attr("font-size", 15);
    
    svg.append("g")
        .call(xAxis);
  
    svg.append("g")
        .call(yAxis);

    
    let max_x = [], max_y = [];
    let min_w = [], min_h = [];
    for (let k = 0; k < 3; k++) {
        draw_layer(k);
    }

    // draw_layer(3);

    function draw_layer(k) {
        const ca_space = 2;
        svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr('class', (d, i) => {
            return 'usage-rect' + ' urect-' + i;
        })
        .attr("x", (d, i) => {
            let x_pos = x_base = x(d.iso_code);
            if (k===3) {
                return max_x[i];
            } else {
                const change = get_rect_change('x', k, d.uncertainty*ca_space/100);
                if (!max_x[i]) {
                    max_x[i] = -9999;
                }

                if (change >= 0) {
                    x_pos = x_pos + change;
                } else {
                    x_pos = x_pos + ca_space - change;
                }

                if (x_pos > max_x[i]) {
                    max_x[i] = x_pos;
                }
                return x_pos;
            }
        })
        .attr("width", (d, i) => {
            if (k===3) {
                return min_w[i]; // x.bandwidth() - max_x_change;
            } else {
                let width = base_width = x.bandwidth();
                const change = get_rect_change('x', k, d.uncertainty*ca_space/100);

                if (change >= 0) {
                    width = width - 2*ca_space - change;
                } else {
                    width = width - 2*ca_space + change;
                }
                if (!min_w[i]) {
                    min_w[i] = 999999;
                }

                if (width < min_w[i]) {
                    min_w[i] = width;
                }

                return width;
            }
        })
        .attr("y", (d, i) => {
            let y_pos = base_y = y(moment(new Date(d.date)).format('L')) || 0;
            if (k===3) {
                return max_y[i]; // y_pos + max_y_change;
            } else {
                const change = get_rect_change('y', k, d.uncertainty*ca_space/100);
                if (!max_y[i]) {
                    max_y[i] = -999999;
                }
                
                if (change >= 0) {
                    y_pos = y_pos + change;
                } else {
                    y_pos = y_pos + ca_space - change;
                }

                if (y_pos > max_y[i]) {
                    max_y[i] = y_pos;
                }

                return y_pos;
            }
        })
        .attr("height", (d, i) => {
            if (k===3) {
                return min_h[i]; //y.bandwidth() - max_y_change;
            } else {
                let height = base_height = y.bandwidth();
                const change = get_rect_change('y', k, d.uncertainty*ca_space/100);
                // console.log('k:', k, '  h:', change);
                if (change >= 0) {
                    height = height - 2*ca_space - change;
                } else {
                    height = height - 2*ca_space + change;
                }
                if (!min_h[i]) {
                    min_h[i] = 999999;
                }

                if (height < min_h[i]) {
                    min_h[i] = height;
                }
                
                return height;
            }
        })
        .attr('fill-opacity', () => {
            // return k===3 ? 1 : 0.33;
            return 1;
        })
        .style("mix-blend-mode", "darken")
        .attr("fill", (d) => {
            if (k===3) {
                return '#888';
            } else {
                const u =  d.uncertainty*255*2;
                const unc = parseInt(u/100);
                const hex_code = unc.toString(16);
                return bubble_colors[k].replace('ff', hex_code);
            }
        })
        // .attr('stroke', () => {
        //     const stroke_color = k===3 ? '#121214' : 'none';
        //     return stroke_color;
        // })
        // .attr("stroke-width", 0.1)
        .append("title")
        .text(d => `Uncertainty: ${formatUsage(d.uncertainty*2)}%`);
    }
}

function draw_world_map() {
    var width = 1000,
    height = 600;

    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr('class', 'world-map')
        .attr("viewBox", [0, -103, width, height])
        .attr("font-family", "sans-serif")
        .attr("font-size", 15);

    var projection = d3.geoMercator()
        .center([0,0])
        .scale(120)
        .rotate([0,0]);


    var path = d3.geoPath()
        .projection(projection);

    var g = svg.append("g");

    // load and display the World
    d3.json("world-map").then(function(topology) {

        const data = prepare_bubble_data(prop_pred_data, sel_model);
        const mapped_preds = _.keyBy(data, 'name');
        const def_dev = .001;

        var tip = d3.tip().attr('class', 'd3-tip').html((EVENT,d)=> {
            return d.tip_text;
        });

    
        /* Invoke the tip in the context of your visualization */
        svg.call(tip)

        g.selectAll("path")
        .data(topology.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('name', (d) => {
            return d.properties.name;
        })
        .attr('class', (d) => {
            return 'world-map-path ' + d.properties.name;
        })
        .on('mouseover',function(e, d){
            show_tip(e, this, d, tip, mapped_preds, def_dev);
        });
        

        

        for (let k = 0; k < 3; k++) {
            add_world_map_circles(k);
        }

        control_mode = 'pan';
        add_zoom_listener(svg, width, height, 'world-map');

        function add_world_map_circles(k) {
            g.selectAll(".dots")
            .data(topology.features)
            .enter()
            .append("circle")
            .attr('class', (d) => {
                return 'world-map-circle ' + d.properties.name;
            })
            .attr('r', function (d) {
                return Math.sqrt(path.area(d) * 0.25 / Math.PI);
            })
            .attr('name', (d) => {
                return d.properties.name;
            })
            .attr("fill", bubble_colors[k])
            .style("mix-blend-mode", "darken")
            .attr("transform",function(d) {                 
                // const p = projection(d3.geoCentroid(d)); //<-- centroid is the center of the path, projection maps it to pixel positions
                const p = path.centroid(d);
                let name = get_country_name(d);
                
                const country = mapped_preds[name];
                let deviation = country ? country.deviation : def_dev;
                
                // if (name === 'Argentina') {
                //     // debugger
                // }

                if (deviation < 3 && deviation >=1) {
                    deviation *= 1.5;
                } else if (deviation < 1 && deviation >=0.5) {
                    deviation *= 2;
                } else if (deviation < 0.5 && deviation >=0.4) {
                    deviation *= 3;
                } else if (deviation < 0.4 && deviation >=0.3) {
                    deviation *= 5;
                }  else if (deviation < 0.3 && deviation >=0.2) {
                    deviation *= 7;
                }  else if (deviation < 0.2 && deviation >=0.1) {
                    deviation *= 10;
                } else if (deviation < 0.1 && deviation >=0.05) {
                    deviation *= 15;
                } else if (deviation < 0.05 && deviation >=0.01) {
                    deviation *= 25;
                } else if (deviation < 0.01 && deviation >=0.001) {
                    deviation *= 100;
                } else if (deviation < 0.001) {
                    deviation *= 500;
                }

                const x = get_circle_coord('x', k, deviation, p[0], true);
                const y = get_circle_coord('y', k, deviation, p[1], true);
                return "translate(" + x + ',' + y + ")";
            })
            
            .on('mouseover',function(e, d){
                show_tip(e, this, d, tip, mapped_preds, def_dev);
            });
        }
    });

    function show_tip(e, ref, d, tip, mapped_preds, def_dev) {
        let name = get_country_name(d);
        const country = mapped_all_countries[name];
        if (!country) {
            return;
        }
        const format = (d, dc) => {
            const fmt = dc ? ('.' + dc + 'f') : ",d";
            const f = d3.format(fmt);
            return `${f(d)}`;
        }
        const texts = [`<div><div class='country'>${country.location}</div>`];
        num_props.forEach(prop => {
            texts.push(`<div class='prop'>${prop}: ${format(country[prop], 0)}</div>`);
        });
        
        const dev = mapped_preds[name] ? mapped_preds[name].deviation : def_dev;
        texts.push(`<div class='prop'>Uncertainty: ${format(dev, 3)}</div>`);
        
        const tip_text = texts.join('') + '</div>';
        tip.show(e, {tip_text});

        d3.select(ref)
        .style("opacity", 1)
        .style("stroke","white")
        .style("stroke-width",3);
    }

    function get_country_name(d) {
        let name = d.properties.name;
        if (name === 'USA') {
            name = 'United States';
        }
        return name;
    }
}

function make_point(element, xy) {
    // console.log(element);
    var matrix = element.getCTM();
    // var matrix = element.getScreenCTM();
    var p = element.nearestViewportElement.createSVGPoint();
    // var matrix = element.getTransformToElement(element.nearestViewportElement);
    p.x = xy[0];
    p.y = xy[1];
    var sp = p.matrixTransform(matrix);
    return sp;
}

function draw_impact_chart(pred_data, model='mlp') {

    let countries = Object.keys(pred_data)
    if (question_mode) {
        countries = _.take(countries, 15);
    } else {
        countries = _.take(countries, 33);
    }
    let num_dates = 0;
    let start_date;
    countries.forEach(country => {
        if (pred_data[country][model].y_pred.length > num_dates) {
            num_dates = pred_data[country][model].y_pred.length;
        }
        const date = new Date(pred_data[country][model].start_timestamp);
        if (start_date) {
            if (start_date.getTime() < date.getTime()) {
                start_date = date;
            }
        } else {
            start_date = date;
        }
    });

    const dates = [];
    num_dates = 130; // to smooth rendering

    for (let i = 0; i < num_dates; i++) {
        const date = moment(start_date).add('days', i).toDate();
        dates.push(date);
    }
    
    const predictions = [];
    const lower_values = [];
    const upper_values = [];
    const uncertainties = [];

    countries.forEach(country => {
        const cp_values = [];
        const cl_values = [];
        const cu_values = [];
        const c_uncerts = [];
        for (let i = 0; i < num_dates; i++) {
            const pred = pred_data[country][model].y_pred[i] || 0;
            const ranges = pred_data[country][model]['ranges'][i];
            const lower_value = ranges[0] || 0;
            const upper_value = ranges[1] || 0;
            const uncertainty = Math.abs(upper_value - lower_value);
            const divider = _.max([pred, upper_value, lower_value]);
            const perc_unc = uncertainty*100/divider;

            cp_values.push(pred);
            cl_values.push(lower_value);
            cu_values.push(upper_value);
            c_uncerts.push(perc_unc);
        }
        predictions.push(cp_values);
        lower_values.push(cl_values);
        upper_values.push(cu_values);
        uncertainties.push(c_uncerts)
    });
    const mid = parseInt(dates.length/2);
    const year = dates[mid];
    
    const chart_data = {
        lower_values,
        predictions,
        upper_values,
        names:countries,
        uncertainties,
        dates,
        year
    };

    const margin = {top: 20, right: 1, bottom: 40, left: 35};
    if (question_mode) {
        margin.top = 30;
    }
    const height = 5;
    const width = chart_data.dates.length * 6 + margin.left + margin.right;
    let innerHeight = height * chart_data.names.length;

    const date = (i) => {
        return moment(start_date).add('days', i).format('ll');
    };
    const format = (d) => {
        const f = d3.format(",d");
        return `${f(d)}`;
    }
    
    const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .attr("font-size", 15)
    .call(d3.axisLeft(y).tickSize(0))
    .call(g => g.select(".domain").remove());
    
    const xAxis = g => g
    .call(g => g.append("g")
      .attr("transform", `translate(0,${margin.top})`)
      .call(
        d3.axisTop(x)
        .tickFormat(x => {
            return moment(new Date(x)).format('ll');
        })
      )
      .call(g => g.select(".domain").remove()))
    .call(g => g.append("g")
      .attr("transform", `translate(0,${innerHeight + margin.top + 4})`)
    //   .call(d3.axisBottom(x)
    //     //   .tickValues([chart_data.year])
    //     //   .tickFormat(x => x)
    //     //   .tickSize(-innerHeight - 10)
    //     )
      .call(g => g.select(".tick text")
          .clone()
          .attr("dy", "2em")
        //   .style("font-weight", "bold")
        //   .style("font-size", "20")
        //   .text("New Cases")
      )
      .call(g => g.select(".domain").remove()));

    const color = d3.scaleSequentialSqrt([0, d3.max(chart_data.uncertainties, d => d3.max(d))], d3.interpolatePuRd);
    const y = d3.scaleBand()
      .domain(chart_data.names)
      .rangeRound([margin.top, margin.top + innerHeight]);

    const date_count = chart_data.dates.length;
    const min_date = moment(d3.min(chart_data.dates)).toDate();
    const max_date = moment(d3.max(chart_data.dates)).add('days', 1).toDate();
    const x = d3.scaleLinear()
    .domain([min_date, max_date])
    .rangeRound([margin.left, width - margin.right]);

    // set svg shape/size
    if (question_mode) {
        innerHeight += 100;
    }

    const v_w = question_mode ? 900 : width;

    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr('class', 'rate-svg impact-chart-svg')
        .attr("viewBox", [0, 0, v_w, innerHeight + margin.top + margin.bottom])
        .attr("font-family", "sans-serif")
        .attr("font-size", 15);
    
    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

        let row_count = 0;
        svg.append("g")
        .selectAll("g")
        .data(chart_data.uncertainties)
        .join("g")
        .attr("transform", (d, i) => `translate(0,${y(chart_data.names[i])})`)
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr('class', (d) => {
            return 'impact-rect';
        })
        .attr('d', d => d)
        .attr("x", (d, i) => {
            const dt_indx = i%date_count;
            let x_pos = x_base = x(chart_data.dates[dt_indx]);
            return x_pos;
        })
        .attr("width", (d, i) => {
            const dt_indx = i%date_count;
            let width = base_width = x(moment(chart_data.dates[dt_indx]).add('days', 1).toDate()) - x(chart_data.dates[dt_indx]);
            return width;
        })
        .attr("y", (d, i) => {
            const indx = (i % row_count === 0) ? (row_count++) : row_count;
            let y_pos = base_y = y(chart_data.names[indx]) - margin.top;
            return y_pos;
        })
        .attr("height", (d, i) => {
            let height = base_height = y.bandwidth();
            return height;
        })
        .attr("fill", 'transparent')
        .attr('stroke', '#e3e3e3')
        .attr("stroke-width", 0.1);

        const rects = d3.selectAll('.impact-rect').nodes();
        rects.forEach(rect => {
            const rect_el = d3.select(rect);
            const row_g = d3.select(rect.parentElement);
            const x = Number(rect_el.attr('x'));
            const y = Number(rect_el.attr('y'));
            const w = Number(rect_el.attr('width'));
            const h = Number(rect_el.attr('height'));
            const d = Number(rect_el.attr('d'));
            
            for (let k = 0; k < 3; k++) {
                const factor = 3.5;
                const change_x = get_rect_change('x', k, d*w/(factor*100));
                const change_y = get_rect_change('y', k, d*h/(factor*100));

                row_g
                    .append("circle")
                    .attr("r", h/factor)
                    .attr('cx', x + w/2 + change_x)
                    .attr('cy', y + h/2 + change_y - 0.2)
                    // .attr("fill-opacity", 0.33)
                    .style("mix-blend-mode", "darken")
                    .attr("fill", bubble_colors[k])
                    .append("title")
                    .text(`Uncertainty: ${format(d)}%`);
            }
        });
}

function get_rect_change(axis, rgb_indx, uncertainty) {
    let change;
    if (axis === 'x') {
        switch (rgb_indx) {
            case 0:
            change = 0;
            break;
            case 1:
            change = uncertainty * (-Math.sqrt(3)/2);
            break;
            case 2:
            change = uncertainty * (Math.sqrt(3)/2);
            break;
        }
    } else {
        switch (rgb_indx) {
            case 0:
            change = uncertainty;
            break;
            case 1:
            change = uncertainty * (-1)/2;
            break;
            case 2:
            change = uncertainty * (-1)/2;
            break;
        }
    }
    return change;
}

function draw_bubble_chart(data, params) {
    const {ques_mode_indx, question_circle_mode, model='mlp', percents, circle_for} = params || {};
    const perc_indx = isNaN(ques_mode_indx) ? 0 : ques_mode_indx;
    const given_dev = percents ? percents[perc_indx] : undefined;
    data = prepare_bubble_data(data, model);
    if (control_mode === 'bubble-select' && bubble_selected.length) {
        data = data.filter(item => {
            return bubble_selected.indexOf(item.name) > -1;
        });
    } else if (control_mode === 'bubble-remove' && bubble_removed.length) {
        data = data.filter(item => {
            return bubble_removed.indexOf(item.name) === -1;
        });
    }

    // sort data by count
    bubble_data = _.orderBy(data, ['count'], ['desc']);
    
    if (question_circle_mode) {
        bubble_data = [bubble_data[0]];
    } else {
        bubble_data = _.take(bubble_data, 50);
    }


    // scale deviation by a factor so that in every case something might be visible
    const max_dev = _.maxBy(bubble_data, 'deviation');
    if (max_dev.deviation < 10) {
        const factor = 1*10/max_dev.deviation;
        bubble_data = bubble_data.map(item => {
            item.deviation = item.deviation * factor;
            return item;
        });
    }

    

    if (!isNaN(given_dev)) {
        bubble_data[0].deviation = given_dev;
    }

    // initialize configs of the chart
    let width, height;
    if (!question_circle_mode) {
        width = bubble_chart_width;
        height = left_panel_height - 65;
    } else {
        width = 100;
        height = 100;
    }

    // Define color range of bubbles
    const color_range = ["#a30f15", "#dfa6ad"];
    let color_space = d3.scaleSequential()
    .domain([bubble_data[0].count, bubble_data[bubble_data.length-1].count])
    .range(color_range);

    // define layout of the chart
    const pack = data => d3.pack()
    .size([width, height])(d3.hierarchy({children: bubble_data})
    .sum(d => d.count));
    const root = pack(bubble_data);

    // clear chart container
    if (!question_circle_mode || (question_circle_mode && ques_mode_indx === 0)) {
        d3.selectAll('.left-chart-container .inner-container').remove();
        d3.select('.left-chart-container')
        .append('div')
        .attr('class', 'inner-container');
    }

    if (!question_circle_mode) {
        d3.select('.inner-container')
        .append('div')
        .attr('class', 'percent-row');
    }

    if (!question_circle_mode || (question_circle_mode && ques_mode_indx === 0)) {
        d3.select('.inner-container')
        .append('div')
        .attr('class', 'bubble-chart');
    }

    let svg = d3.select('.bubble-chart')
        .append("svg")
        .attr('class', 'bubble-svg')
        .attr("width", width)
        .attr("height", height)
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
    
    redraw_bubbles(root, svg);

    // set zoom functon on to the svg
    if (!question_circle_mode) {
        add_zoom_listener(svg, width, height, 'bubble-svg');
    }

    if (['blur', 'ca-blur'].indexOf(question_circle_mode) > -1) {
        add_circle_blur(svg, bubble_data[0].deviation);
    }

    // reset bubble label(country code) on change scale of the svg
    function redraw_bubbles(root, svg) {
        
        draw_circles();

        if (!question_circle_mode && !question_mode) {
            draw_percentages(root.leaves());
        }
        
        function draw_circles() {
            // clear container
            svg.selectAll(".country-code").remove();
            svg.selectAll('.country-circle, .circle-container').remove();

            for (let k = 0; k < 3; k++) {
                add_circle(k);
            }
        }

        function add_circle(k) {
            const first_circle = k === 0;
            const circle = svg.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr('class', (d) => {
                const nameCls = d && d.data.nameCls || '';
                let cls = 'circle-container circle-container-' + nameCls;
                return cls;
            })
            .attr("transform", d => {
                let xx, yy;
                if (circle_for === 'question') {
                    xx = 200;
                    yy = 370;
                } else {
                    xx = question_circle_mode ? ((ques_mode_indx+1)*170) : 0;
                    yy = question_circle_mode ? 80 : 0;
                }
                return `translate(${d.x + 1 + xx},${d.y + 1 + yy})`
            });

            const new_circle = circle
                .append("circle")
                .attr("id", d => (d.data.name + '-' + d.data.count))
                .attr("r", d => {
                    return question_circle_mode ? d.r * 0.8 : d.r;
                })
                .attr('center-point', (d) => {
                    return d.x + ',' + d.y;
                })
                // .attr("fill-opacity", (d) => {
                //     return 0.33;
                // })
                .style("mix-blend-mode", "darken")
                .attr('class', ()=> {
                    let cls;
                    if (question_circle_mode) {
                        const dev_cls = bubble_data[0].deviation.toString().replace('.', '');
                        cls = question_circle_mode && question_circle_mode.indexOf('blur') > -1 ? 'abberation-blur-' + dev_cls : 'abberation';
                    } else {
                        cls = 'actual';
                    }
                    return cls;
                })
                .attr("fill", (d) => {
                    let color = bubble_colors[k];
                    // if (question_circle_mode === 'trans') {
                    //     color = color + '80';
                    // }
                    return color;
                });

            if (!question_circle_mode) {
                new_circle
                .on('mouseover', function (event, d) {
                    if (control_mode === 'star-fish' && !question_circle_mode && !question_mode) {
                        reorder_bubbles(this.parentNode, root.leaves());
                        toggle_focus(d.data.nameCls, 'mouseover');
                    }
                })
                .on('mouseout', function (event, d) {
                    if (control_mode === 'star-fish' && !question_circle_mode && !question_mode) {
                        toggle_focus(d.data.nameCls, 'mouseout');
                    }
                })
                .on('mousedown', function (ev, d) {
                    
                    if (ev.which !== 1 || question_mode) {
                        return;
                    }
                    
                    let nameCls = d.data.nameCls;
                    switch (control_mode) {
                        case 'star-fish':
                            if (!first_circle) {
                                if (country_streams.indexOf(d.data.name) > -1) {
                                    country_streams = country_streams.filter(item => item !== d.data.name);
                                } else {
                                    country_streams.push(d.data.name);
                                }
                                d3.selectAll('.circle-container-' + nameCls + ' .country-stream-svg').remove();
                                set_color_mode();
                                draw_stream_graph({pred_data: prop_pred_data, sel_country: d.data.name, sel_country_cls: nameCls});
                            }
                            break;

                        case 'drill-models':
                            drill_country = d.data.name;
                            create_drill_container();
                            break;
                        case 'bubble-select':
                            select_deselect('.circle-container', false);
                            if (bubble_selected.indexOf(d.data.name) > -1) {
                                bubble_selected = bubble_selected.filter(item => item !== d.data.name);
                            } else {
                                bubble_selected.push(d.data.name);
                            }
                            bubble_selected.forEach(name => {
                                nameCls = get_name_cls(name);
                                select_deselect('.circle-container-' + nameCls, true);
                            });

                            toggle_go();
                            toggle_cross('.' + control_mode + ' .cross', bubble_selected.length);
                            break;

                        case 'bubble-remove':
                            select_deselect('.circle-container-' + nameCls, false);
                            if (bubble_removed.indexOf(d.data.name) > -1) {
                                select_deselect('.circle-container-' + nameCls, true);
                                bubble_removed = bubble_removed.filter(item => item !== d.data.name);
                            } else {
                                bubble_removed.push(d.data.name);
                                select_deselect('.circle-container-' + nameCls, false);
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
                            select_deselect('.circle-container', false);
                            global_streams.forEach(name => {
                                nameCls = get_name_cls(name);
                                d3.select(".main-stream-chart" + ' .stream-cell-' + nameCls).style("opacity", 1);
                                select_deselect('.circle-container-' + nameCls, true);
                            });

                            toggle_go();
                            toggle_cross('.' + control_mode + ' .cross', global_streams.length);

                            break;
                    }
                })
                ;
            }

            if (k === 2) {
                if (question_circle_mode) {
                    add_alt_mode(circle, bubble_data[0].deviation, circle_for);
                }
                if (circle_for === 'question') {
                    show_circle_questions(svg);
                }
                add_country_code(circle);
            }

            if (!question_circle_mode || question_circle_mode === 'ca' || question_circle_mode === 'ca-static' || question_circle_mode === 'ca-blur') {
                do_transition();
            }

            if (k === 2 && question_circle_mode === 'noise') {
                add_noise_layer(circle, k);
            }

            function do_transition() {
                if (question_circle_mode === 'ca-static' || sel_quest_category === 'star-fish') {
                    new_circle
                    .attr("cx", d => {
                        return get_circle_coord('x', k, d.data.deviation, 0, true);
                    })
                    .attr("cy", d => {
                        return get_circle_coord('y', k, d.data.deviation, 0, true);
                    });
                } else {
                    const ease = d3.easeLinear;
                    new_circle
                    .attr("cx", d => {
                        return get_circle_coord('x', k, d.data.deviation, 0, false);
                    })
                    .attr("cy", d => {
                        return get_circle_coord('y', k, d.data.deviation, 0, false);
                    })
                    .transition()             
                    .ease(ease)
                    .duration(2000)    
                    .attr("cx", d => {
                        return get_circle_coord('x', k, d.data.deviation, 0, true);
                    })
                    .attr("cy", d => {
                        return get_circle_coord('y', k, d.data.deviation, 0, true);
                    })
                    .transition()             
                    .ease(ease)           
                    .duration(2000)    
                    .attr("cx", d => {
                        return get_circle_coord('x', k, d.data.deviation, 0, false);
                    })
                    .attr("cy", d => {
                        return get_circle_coord('y', k, d.data.deviation, 0, false);
                    })
                    .on("end", function() {
                        do_transition();
                    });
                }
            }

            function add_noise_layer(circle, k) {
                for ( let i = 0; i < 1000; i++) {
                    var rad = Math.sqrt((Math.random() * 40 * 40)),
                        angle = Math.random() * Math.PI * 2,
                        posx = Math.cos(angle),
                        posy = Math.sin(angle);
                    let opacity = bubble_data[0].deviation/100;

                    var c2 = circle
                        .append('circle')
                        .attr('id', 'cir')
                        .attr('cx', posx * rad)
                        .attr('cy', posy * rad)
                        .attr('r', 1)
                        .style('fill', () => {
                            let indx;
                            if (i%3 === 0) {
                                indx = 0;
                            } else if (i%3 === 1) {
                                indx = 1;
                            } else {
                                indx = 2;
                            }
                            let color = bubble_colors[indx];
                            return color;
                        })
                        .style('opacity', opacity);
                    }
        
                if (k === 2) {
                    add_alt_mode(circle, bubble_data[0].deviation, circle_for);
                    add_country_code(circle);
                }
            }
            
        }
    }
}

function create_drill_container() {
    const base_selector = 'drill-models-container';
    const nameCls = get_name_cls(drill_country);
    d3.selectAll('.' + base_selector + ' div' + ', .' + base_selector + ' span').remove();

    const models = ['mlp', 'cnn', 'lstm', 'arima'];
    d3.select('.' + base_selector)
    .selectAll("div")
    .data(models)
    .enter()
    .append("div")
    .attr("class", (d) => 'model-row model-row-' + d)
    .append('text')
    .text(d => d.toUpperCase());

    models.forEach(prop => {
        draw_stream_graph({pred_data: prop_pred_data, drill_model: prop, container: base_selector + ' .model-row-' + prop, sel_country: drill_country, sel_country_cls: nameCls, mode: color_or_texture});
    });
}

function add_alt_mode(country_cell, given_dev, circle_for) {
    given_dev *= 10;
    const text = circle_for === 'question' ? '' : (given_dev +'%');
    country_cell.append("text")
        .attr('class', 'country-code')
        .attr("y", 75)
        .attr("x", -10)
        .text(text)
        .attr("font-size", (d) => {
            return 25 + 'px';
        })
        .attr("fill", 'black');
}

function select_deselect(selector, clear) {
    d3.selectAll(selector + ' circle').style("opacity", clear ? 0.7 : 1);
}

function add_circle_blur(svg, deviation) {
    var defs = svg.append("defs");
    const dev_cls = deviation.toString().replace('.', '');
    //Initialize the filter
    defs.append("filter")
        .attr("id", "motionFilter-" + deviation) //Give it a unique ID
        //Increase the width of the filter region to remove blur "boundary"
        .attr("width", "300%")
        .attr("height", "300%")
        //Put center of the "width" back in the middle of the element
        .attr("x", "-100%")
        .attr("y", "-100%")
        .append("feGaussianBlur") //Append a filter technique
        .attr("class", "blurValues") //Needed to select later on
        .attr("in", "SourceGraphic") //Apply blur on the applied element
        //Do a blur of 8 standard deviations in the horizontal
        //direction and 0 in vertical
        .attr("stdDeviation", deviation + " " + deviation);

    d3.selectAll(".circle-container circle.abberation-blur-" + dev_cls).style("filter", "url(#motionFilter-" + deviation + ")");
}

function draw_percentages(leaves) {
    const data = leaves.map(item => item.data);
    if (data.length) {
        const percent_circles = [];
        const perc_count = 5;
        const max_deviation = _.max(data, 'deviation').deviation;
        const dev_factor = max_deviation/perc_count;
        const svg = d3.select('.percent-row').append('svg');

        svg.append('rect')
        .attr('x', 10)
        .attr('y', 5)
        .attr('width', 400)
        .attr('height', 58)
        .attr('stroke', '#7678A9')
        .attr('fill', 'white');

        // draw circles
        for(let i = 0; i < perc_count; i++) {
            const cur_dev = i === 0 ? 0 : ((i+1) * dev_factor);
            for(let k = 0; k < 3; k++) {
                const circle = svg
                .append('circle')
                .attr('r', 25)
                .attr("fill", d => {
                    return bubble_colors[k];
                })
                // .attr("fill-opacity", (d) => {
                //     return 0.33;
                // })
                .style("mix-blend-mode", "darken")
                ;

                // percentage label
                const label = (i*25) + '%';
                svg.append('text')
                .attr('dx', () => {
                    return 50 + i * 80 - label.length * 4;
                })
                .attr('dy', () => {
                    return 37;
                })
                .attr("font-size", 13)
                .attr("fill", 'white')
                .html(label);

                // store circle
                percent_circles.push({circle, i, k, cur_dev})
            }
        }

        // animate with transition
        repeat();

        function repeat() {
            const ease = d3.easeLinear;
            let y = 34;
            percent_circles.forEach((item) => {
                const {circle, i, k, cur_dev} = item;
                circle
                .attr('cx', () => {
                    let x = 50 + i * 80;
                    return get_circle_coord('x', k, cur_dev, x, false);
                })
                .attr('cy', () => {
                    return get_circle_coord('y', k, cur_dev, y, false);
                })
                .transition()             
                .ease(ease)
                .duration(2000)    
                .attr('cx', () => {
                    let x = 50 + i * 80;
                    return get_circle_coord('x', k, cur_dev, x, true);
                })
                .attr('cy', () => {
                    return get_circle_coord('y', k, cur_dev, y, true);
                })
                .transition()             
                .ease(ease)           
                .duration(2000)    
                .attr('cx', () => {
                    let x = 50 + i * 80;
                    return get_circle_coord('x', k, cur_dev, x, false);
                })
                .attr('cy', () => {
                    return get_circle_coord('y', k, cur_dev, y, false);
                })
                .on("end", function() {
                    repeat();
                });
            })
        }
    }
}

function get_circle_coord(axis, rgb_indx, deviation, init_val, show_aber) {
    let coord;
    let r = show_aber ? deviation : 0;
    if (axis === 'x') {
        switch (rgb_indx) {
            case 0:
            coord = init_val;
            break;
            case 1:
            coord = init_val + r * (-Math.sqrt(3)/2);
            break;
            case 2:
            coord = init_val + r * (Math.sqrt(3)/2);
            break;
        }
    } else {
        switch (rgb_indx) {
            case 0:
            coord = init_val + r;
            break;
            case 1:
            coord = init_val + r * (-1)/2;
            break;
            case 2:
            coord = init_val + r * (-1)/2;
            break;
        }
    }
    return coord;
}

function prepare_bubble_data(data, model) {
    let num_dates = 0;
    countries.forEach(country => {
        if (data[country][model].y_pred.length > num_dates) {
            num_dates = data[country][model].y_pred.length;
        } 
    });
    // calculate differences between actual and prediction/count
    let bubble_data = countries.map(country => {
        let count = 0;
        let actual = 0;
        for (let i = 0; i < num_dates; i++) {
            count += data[country][model].y_pred[i] || 0;
            actual += data[country][model].y && data[country][model].y[i] || 0;
        }
        // const diff = Math.abs(actual - count);
        const nameCls = get_name_cls(country);
        const uncertainties = data[country][model].ranges.map(range => {
            return range[1] - range[0];
        });
        const avg_uncertainty = _.sum(uncertainties)/uncertainties.length;
        return {name: country, code: data[country].code, count, actual, nameCls, avg_uncertainty};
    });

    // Calculate deviation to shift centers of aberrated circles
    const max_uncertainty = _.maxBy(bubble_data, 'avg_uncertainty').avg_uncertainty;
    bubble_data = bubble_data.map((item) => {
        item.deviation = item.avg_uncertainty * 7 / max_uncertainty;
        return item;
    });
    
    return bubble_data;
}

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

function get_name_cls(key) {
    return key.replace(/\s/g, '-') || '';
}

function get_color_orders(key, max) {
    const model_types = ['mlp', 'cnn', 'lstm'];
    let data = [];
    for (let i = 0; i < max; i++) {
        const date = moment(new Date(prop_pred_data[key].mlp.start_timestamp)).add('days', i).toDate();
        const record = {date};
        model_types.forEach(model => {
            const ranges = prop_pred_data[key][model].ranges[i];
            record[model] = Math.abs(ranges[0] - ranges[1]) || 0;
        });
        data.push(record);
    }
    data = get_normalized_data(data, model_types);
    let orders = [];
    model_types.forEach((prop, indx) => {
        orders.push({name: prop, value: data[0][prop], index: indx});
    });
    orders = _.orderBy(orders, ['value'], ['asc']);
    return orders;
}

function def_textures(svg, keys, max) {
    color_mappings = {};

    keys.forEach((key, index) => {
        const color_orders = get_color_orders(key, max);
        // console.log(key, color_orders)
        const first_two_col_indexs = [color_orders[0].index, color_orders[1].index]; 
        color_mappings[key] = color_orders.map(item => item.index);
        
        // For number of alternative colors
        for (let k = 0; k < 3; k++) {
            const nameCls = get_name_cls(key);

            // For number of aberration points
            for (let c = 0; c < 3; c++) {
                let fill_color, texture_id;
                if (first_two_col_indexs.indexOf(c) > -1 && !question_mode) {
                    fill_color = bubble_colors2[k];
                } else {
                    fill_color = bubble_colors1[k];
                    
                }
                // number of deviation scales
                for (let dev = 0; dev < 10; dev++) {
                    const fract_dev = dev/6;
                    const cx_change = get_circle_coord('x', k, fract_dev, 1+(-1*2/(dev+1)), true);
                    const cy_change = get_circle_coord('y', k, fract_dev, 1+(-1*2/(dev+1)), true);

                    texture_id = 'pat-' + nameCls + '-' + c + '-' + rgb_indexes[k] + '-' + dev;
                    // console.log('defs:', texture_id)
                    let w = 5;
                    const base_h = 4.5;
                    let h = base_h + dev*0.15;
                    let r = 1.5 - dev*0.08;
                    let cx = w/2 + cx_change;
                    if (dev <= 3 ) {
                        cx += .6;
                    }
                    const cy = base_h/2 + cy_change;
                    
                    svg
                    .append('defs')
                    .append('pattern')
                    .attr('id', texture_id)
                    .attr('patternUnits', 'userSpaceOnUse')
                    .attr('width', w)
                    .attr('height', h)
                    .append('circle')
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('r', r)
                    .attr('fill', fill_color);
                }
            }
        }
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

function toggle_go() {
    const opacity = (bubble_selected.length > 0 || bubble_removed.length > 0 || global_streams.length > 0) ? 1 : 0.3;
    d3.select('.btn-go').style("opacity", opacity);
}

function toggle_cross(selector, len) {
    const opacity = len ? 'inline' : 'none';
    d3.select(selector).style("display", opacity);
}

function add_country_code(country_cell, show_aber) {
    country_cell.append("text")
        .attr('class', 'country-code')
        .attr("y", 5)
        .attr("x", (d) => {
            let shift = -d.data.code.length * 3/bubble_chart_scale;
            if (show_aber) {
                shift = 0;
            }
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
        .attr("fill", 'white');
}

function add_zoom_listener(svg, width, height, selector) {
    selector = selector.replace('.', '');
    svg = d3.selectAll('.' + selector);

    const zoom_level = 20;
    const ext_x = -width/zoom_level;
    let ext_y = -height/zoom_level;
    if (question_mode) {
        ext_y += 80;
    }
    const zoom = d3.zoom()
        .scaleExtent([-5, zoom_level])
        .extent([[-width,-height], [width, height]])
        .translateExtent([[ext_x, ext_y], [width/zoom_level, height/zoom_level]])
        .on("zoom", (event) => {
            if (selector === 'main-stream-svg') {
                stream_chart_scale = event.transform.k;
            } else if (selector === 'bubble-svg') {
                bubble_chart_scale = event.transform.k;
                d3.selectAll('.circle-container text').remove();
                const circles = d3.selectAll('.circle-container');
                add_country_code(circles, undefined)
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


    if (question_mode) {
        svg.call(zoom.translateBy, 0, -80);
        svg.transition().call(zoom.scaleBy, 0.49);
    } else {
        svg.call(zoom);
    }

    let drag = d3.drag()
        .on('start', dragstarted, selector)
        // .on('drag', dragged)
        .on('end', (ev, data)=> {
            dragended(ev, data, selector);
        });
    
    
    let item_sel = selector;
    if (selector.indexOf('bubble-svg') > -1) {
        item_sel = 'circle-container';
    }
    if (selector.indexOf('world-map') > -1) {
        svg.selectAll('.world-map-path').call(drag);
        item_sel = 'world-map-circle';
    }

    svg.selectAll('.' + item_sel).call(drag);
    
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
        selector = selector.startsWith('.') ? selector : ('.' + selector);
        const svg = d3.selectAll(selector)
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
    ];
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
    leaves.forEach(circle => {
        const node = d3.select('.circle-container-' + circle.data.nameCls);
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

function get_angle(p1, p2) {
    // angle in degrees
    var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    return angleDeg;
}

