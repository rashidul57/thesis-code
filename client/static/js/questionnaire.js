const answers = {};
const question_types = ['ca', 'ca-static', 'blur', 'noise'];

let question_num = 9, sel_country_num;
let empty_pass = true;
let cur_quest_perc;
let question_per_sec = 2;
let bubble_quest_countries;
let vsup_quest_color;
const dev_groups = 4;
const val_groups = 8;
const radius_reduce_factor = 0.8;
const aberr_div_factor = 10;
const width = 650;
const height = 585;

const question_values = [
    {
        "ca": 52,
        "radius": 20
    },
    {
        "ca": 71,
        "radius": 30
    },
    {
        "ca": 71,
        "radius": 37
    },
    {
        "ca": 33,
        "radius": 43
    },
    {
        "ca": 52,
        "radius": 49
    },
    {
        "ca": 71,
        "radius": 54
    },
    {
        "ca": 71,
        "radius": 58
    },
    {
        "ca": 90,
        "radius": 63
    }
];

function show_question() {
    sel_model = models[0];

    d3.select('.drill-models-container').style('display', 'none');
    d3.selectAll('.left-chart-container svg').remove();

    if (question_num <= 8) {
        draw_ca_bubble_questions();
    } else if (question_num > 8 && question_num <= 16) {
        draw_ca_grid_questions();
    } else if (question_num > 16 && question_num <= 24) {
        draw_vsup_bubble_questions();
    } else if (question_num > 24 && question_num <= 32) {
        draw_vsup_grid_questions();
    }

}


function draw_ca_bubble_questions() {

    let bubble_data = get_quantized_data();
    const leaves = get_bubble_leaves(bubble_data);

    const dev_radiis = Array(dev_groups).fill(35);
    let dev_deviations = bubble_data.map(item => item.deviation);
    dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = leaves.map(item => item.r);
    val_radiis = _.sortBy(_.uniq(val_radiis));
    const val_deviations = Array(val_groups).fill(0);

    // used for legend drawing
    const dev_conf = {groups: dev_groups, deviations: dev_deviations, radiis: dev_radiis, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, deviations: val_deviations, radiis: val_radiis,  type: 'value-legend', legend_caption: 'Value'};

    const max_radius = _.max(val_conf.radiis);

    for (let k = 0; k < 3; k++) {
        draw_chart(k, leaves);
    }
    const svg = d3.select('.bubble-svg');

    draw_legend(svg, val_conf, max_radius);
    draw_legend(svg, dev_conf, max_radius);

    const question_data = leaves.map(item => {
        return Object.assign({r: item.r}, item.data);
    });

    draw_question(svg, 700, 450, question_data, val_conf.radiis);

    function draw_chart(k, leaves) {
        let svg;
        if (k === 0) {
            svg = d3.select('.left-chart-container')
            .append("svg")
            .attr('class', 'bubble-svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

            svg
            .append("text")
            .text('CA + Bubble')
            .attr("x", 20)
            .attr("y", 40)
            .attr("font-size", 25)
            .attr("fill", 'black');
        } else {
            svg = d3.select('.bubble-svg');
        }

        const circle_g = svg.selectAll("g")
        .data(leaves)
        .join("g")
        .attr('class', (d) => {
            const nameCls = d && d.data.nameCls || '';
            let cls = 'circle-container circle-container-' + nameCls;
            return cls;
        })
        .attr("transform", d => {
            let xx = -100, yy = 150;
            return `translate(${d.x + 1 + xx},${d.y + 1 + yy})`
        });
    
        circle_g
            .append("circle")
            .attr("id", d => (d.data.name + '-' + d.data.count))
            .attr("r", d => d.r)
            .attr('info', (d) => {
                return 'value=' + d.r + ', unc=' + d.data.deviation;
            })
            .style("mix-blend-mode", "darken")
            .attr('class', ()=> {
                return 'abberation';
            })
            .attr("fill", (d) => {
                let color = bubble_colors[k];
                return color;
            })
            .attr("cx", d => {
                return get_circle_coord('x', k, d.data.deviation/aberr_div_factor, 0, true);
            })
            .attr("cy", d => {
                return get_circle_coord('y', k, d.data.deviation/aberr_div_factor, 0, true);
            })
            .on('mousedown', function (ev, d) {
                if (ev.which !== 1) {
                    return;
                }

                bubble_quest_countries.forEach(country => {
                    if (country.name === d.data.name) {
                        answers[question_num] = true;
                    }
                });
                if (!answers[question_num]) {
                    answers[question_num] = false;
                }
                console.log(answers[question_num]);

                show_question(++question_num);

            });
    }

    function draw_legend(svg, conf, max_radius) {
        const {groups, type, radiis, deviations, legend_caption} = conf;

        let data = [];
        let legend_left_start = 480;
        let leg_top_start = max_radius + 10;

        if (type === 'ca-legend') {
            leg_top_start = 2*max_radius + 80;
            legend_left_start += 160;
        }

        let padding_left = legend_left_start + 20;

        for (let k = 0; k < groups; k++) {
            const radius = radiis[k];
            padding_left += 2 * radius + 10;
            const deviation = deviations[k];
            let label = type === 'value-legend' ? radius : deviation;
            label = parseInt(label);
            data.push({radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label});
        }
    
        // Draw circles
        data.forEach((dev_rec, i) => {
            const circle_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_circle(circle_g, dev_rec, i, k);
            }
        }); 
    
    }

    function draw_question(svg, x, y, question_data, radiis) {
        const question_g_sel = 'bubble-ca-question-g';
        d3.select('.' + question_g_sel).remove();

        const svg_g = svg
            .append('g')
            .attr('class', question_g_sel);

        // don't parseInt here as used in next line
        const radius = radiis[question_num-1];
        bubble_quest_countries = question_data.filter(item => item.r === radius);

        const ca = parseInt(bubble_quest_countries[0].deviation);
        const question = `Question-${question_num}: Click on chart where <Value=${parseInt(radius)}> and <CA=${parseInt(ca)}>`;

        svg_g
        .append("text")
        .attr("x", x)
        .attr("y", y + 100)
        .text(question)
        .attr("font-size", 20)
        .attr('fill', 'black');

        transition_question(svg_g, 2800);
    }
}

function draw_ca_grid_questions1() {
    let bubble_data = get_quantized_data();
    const leaves = get_bubble_leaves(bubble_data);
    const question_data = leaves.map(item => {
        return Object.assign({r: item.r}, item.data);
    });

    let data = draw_usage_chart(question_data);

    // Draw rects
    const svg = d3.select('.rate-svg');

    svg
    .append("text")
    .text('CA + Grid')
    .attr("x", 20)
    .attr("y", 50)
    .attr("font-size", 25)
    .attr("fill", 'black');


    const dev_radiis = Array(dev_groups).fill(35);
    let dev_deviations = bubble_data.map(item => item.deviation);
    dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = leaves.map(item => item.r);
    val_radiis = _.sortBy(_.uniq(val_radiis));
    const val_deviations = Array(val_groups).fill(0);

    // used for legend drawing
    const dev_conf = {groups: dev_groups, deviations: dev_deviations, radiis: dev_radiis, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, deviations: val_deviations, radiis: val_radiis,  type: 'value-legend', legend_caption: 'Value'};

    const max_radius = _.max(val_conf.radiis);

    draw_legend(svg, val_conf, max_radius);
    draw_legend(svg, dev_conf, max_radius);

    function draw_legend(svg, conf, max_radius) {
        const {groups, type, radiis, deviations, legend_caption} = conf;

        let data = [];
        let legend_left_start = 480;
        let leg_top_start = max_radius + 10;

        if (type === 'ca-legend') {
            leg_top_start = 2*max_radius + 80;
            legend_left_start += 160;
        }

        let padding_left = legend_left_start + 20;

        for (let k = 0; k < groups; k++) {
            const radius = radiis[k];
            padding_left += usage_cell_width + 10;
            const deviation = deviations[k];
            let label = type === 'value-legend' ? radius : deviation;
            label = parseInt(label).toString();
            data.push({radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label});
        }
    
        // Draw circles
        data.forEach((dev_rec, i) => {
            const rect_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_rect(rect_g, dev_rec, i, k);
            }
        });

        function add_legend_rect(rect_g, dev_rec, i, k) {
            
            const {radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label} = dev_rec;
            const label_top = 20;
        
            if (i === 0 && k === 0) {
                let dx = legend_left_start;
                if (type === 'ca-legend') {
                    dx += 30;
                }
                rect_g
                .append('text')
                .attr('dx', dx)
                .attr('dy', leg_top_start + label_top)
                .html(legend_caption);
            }
        
            rect_g
                .append('rect')
                .attr("r", radius)
                .attr("fill", d => bubble_colors[k])
                .attr('class', 'legend-circle-' + label)
                .attr('x', () => {
                    let cx = get_circle_coord('x', k, deviation/aberr_div_factor, padding_left, true);
                    if (type === 'ca-legend') {
                        cx += i*20;
                    }
                    return cx;
                })
                .attr("width", (d, i) => {
                    return usage_cell_width;
                })
                .attr('y', () => {
                    let cy = get_circle_coord('y', k, deviation/aberr_div_factor, leg_top_start, true) + 15;
                    return cy;
                })
                .attr("height", (d, i) => {
                    return usage_cell_height;
                })
                .style("mix-blend-mode", "darken");
        
                if (k === 0) {
                    rect_g
                    .append('text')
                    .attr('dx', () => {
                        let dx = padding_left - label.toString().length * 4;
                        if (type === 'ca-legend') {
                            dx += i*20 ;
                        }
                        return dx;
                    })
                    .attr('dy', () => {
                        let dy = leg_top_start + label_top;
                        return dy;
                    })
                    .attr("font-size", 18)
                    .attr("font-weight", 'bold')
                    .attr("fill", '#2b1089')
                    .html(label);
                }
        }
    
    }
}

function draw_ca_grid_questions() {
    let data = get_quantized_data();
    data = get_bubble_leaves(data).map(item => {
        item.data.r = item.r;
        return item.data;
    });

    const cell_per_row = data.length/5;
    data = data.map((item, indx) => {
        item.position_indx = parseInt((indx)/cell_per_row);
        return item;
    });
    const max_rate = _.maxBy(data, 'r').r;
    
    d3.select('.vsup-svg').remove();

    var w = 300;
    var h = 280;
    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr('class', 'vsup-svg');

    var x = d3.scaleBand().range([0, w]).domain(data.map(function(d) { return d.r; }));
    var y = d3.scaleBand().range([0, h]).domain(data.map(function(d) { return d.position_indx; }));

    // special scales for axes
    var xAxis = d3.scaleLinear().range([0, w]).domain(d3.extent(data.map(function(d) { return d.r; })));
    const y_domain = [];
    for (let k=1; k<=cell_per_row; k++) {
        y_domain.push(k);
    }
    var yAxis = d3.scaleBand().range([0, h]).domain(y_domain);

    var vDom = d3.extent(data.map(function(d) { return d.r; }));
    var uDom = d3.extent(data.map(function(d) { return d.deviation; }));
    var quantization = vsup.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
    var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);

    var heatmap = svg
        .attr("width", w)
        .attr("height", h).append("g")
        .attr("transform", "translate(230,250)");
    

    draw_grid(0);
    draw_grid(1);
    draw_grid(2);
    

    const dev_radiis = Array(dev_groups).fill(55);
    let dev_deviations = data.map(item => item.deviation);
    dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = data.map(item => item.r);
    val_radiis = _.sortBy(_.uniq(val_radiis));
    const val_deviations = Array(val_groups).fill(0);

    // used for legend drawing
    const dev_conf = {groups: dev_groups, deviations: dev_deviations, radiis: dev_radiis, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, deviations: val_deviations, radiis: val_radiis,  type: 'value-legend', legend_caption: 'Value'};

    const max_radius = _.max(val_conf.radiis);

    draw_legend(svg, val_conf, max_radius);
    draw_legend(svg, dev_conf, max_radius);
    
    show_question(val_conf);

    function draw_grid(k) {
        const ca_space = 4;

        heatmap.append("g")
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr('class', (d, i) => {
                return 'rect-' + i;
            })
            .attr("x", function(d, i) {
                let x_pos = x_base = i%cell_per_row;
                const width = y.bandwidth() - 1;
                x_pos = x_pos*width;

                const change = get_rect_change('x', k, d.deviation*ca_space/100);
                
                if (change >= 0) {
                    x_pos = x_pos + change;
                } else {
                    x_pos = x_pos + ca_space - change;
                }

                const bar_width = get_bar_width(y, k, d, ca_space);
                x_pos = x_pos + (width - bar_width)/2;

                if (x_pos < 0) {
                    x_pos = 0;
                }

                return x_pos;
            })
            .attr("width", (d, i) => {
                const width = get_bar_width(y, k, d, ca_space);
                return width;
            })
            .attr("y", function(d, i) {
                let y_pos = y_base = y(d.position_indx);
                const height = y.bandwidth() - 1;
                const change = get_rect_change('y', k, d.deviation*ca_space/100);
                if (change >= 0) {
                    y_pos = y_pos + change;
                } else {
                    y_pos = y_pos + ca_space - change;
                }

                const bar_height = get_bar_height(y, k, d, ca_space);
                y_pos = y_pos + (height - bar_height)/2;

                if (y_pos < 0) {
                    y_pos = 0;
                }
                return y_pos;
            })
            .attr("height", (d, i) => {
                const height = get_bar_height(y, k, d, ca_space);
                if (height < 5) {
                    height = 5;
                }
                
                return height;
            })
            .style("mix-blend-mode", "darken")
            .attr("fill", (d) => {
                const unc =  parseInt(d.deviation*255/100); // percentage to FF scale
                let hex_code = unc.toString(16);
                if (hex_code.length === 1) {
                    hex_code = 0 + hex_code;
                }
                let colr = bubble_colors[k];
                const rgb_part = colr.replace(/[(#)(ff)]/g, '');
                
                // colr = colr.replace(rgb_part, hex_code);

                return colr;
            })
            .on('mousedown', function (ev) {
                if (ev.which !== 1) {
                    return;
                }
                const fill_color = d3.select(this).attr('fill');
                console.log(vsup_quest_color === fill_color);
                show_question(++question_num);
            })
            .append("title")
            .text(d => `deviation: ${(d.deviation)}%`);;

            function get_bar_width(y, k, d, ca_space) {
                let width = y.bandwidth() - 1;
                width = (d.r * width)/max_rate;
                const change = get_rect_change('x', k, d.deviation*ca_space/100);

                if (change >= 0) {
                    width = width - 2*ca_space - change;
                } else {
                    width = width - 2*ca_space + change;
                }
                if (width < 5) {
                    width = 5;
                }
                return width;
            }

            function get_bar_height(y, k, d, ca_space) {
                let height = y.bandwidth()-1;
                height = (d.r * height)/max_rate;
                
                const change = get_rect_change('y', k, d.deviation*ca_space/100);
                // console.log('k:', k, '  h:', change);
                if (change >= 0) {
                    height = height - 2*ca_space - change;
                } else {
                    height = height - 2*ca_space + change;
                }
                return height;
            }
    }

    function draw_legend(svg, conf, max_radius) {
        const {groups, type, radiis, deviations, legend_caption} = conf;

        let data = [];
        let legend_left_start = 480;
        let leg_top_start = max_radius + 10;

        if (type === 'ca-legend') {
            leg_top_start = 2*max_radius + 80;
            legend_left_start += 160;
        }

        let padding_left = legend_left_start + 20;

        for (let k = 0; k < groups; k++) {
            const radius = radiis[k];
            padding_left += 2 * radius + 10;
            const deviation = deviations[k];
            let label = type === 'value-legend' ? radius : deviation;
            label = parseInt(label).toString();
            data.push({radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label, max_radius});
        }
    
        // Draw dev-group circles
        data.forEach((dev_rec, i) => {
            const rect_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_rect(rect_g, dev_rec, i, k);
            }
        });
    
    }

    function add_legend_rect(rect_g, d, i, k) {
            
        const {radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label, max_radius} = d;
        const label_top = 20;
        const ca_space = 4;
    
        if (i === 0 && k === 0) {
            let dx = legend_left_start;
            let dy = leg_top_start + label_top;
            if (type === 'ca-legend') {
                dx += 90;
                dy += 7;
            } else {
                dx += 30;
            }
            rect_g
            .append('text')
            .attr('dx', dx)
            .attr('dy', dy)
            .html(legend_caption);
        }

    
        rect_g
            .append('rect')
            // .attr("r", radius)
            .attr("fill", d => bubble_colors[k])
            .attr('class', 'legend-circle-' + label)
            .attr("x", function() {
                let x_pos = y.bandwidth() - 1;
                const change = get_rect_change('x', k, d.deviation*ca_space/100);

                if (change >= 0) {
                    x_pos = x_pos + change;
                } else {
                    x_pos = x_pos + ca_space - change;
                }
                if (x_pos < x_base) {
                    x_pos = x_base;
                }

                if (type === 'ca-legend') {
                    x_pos = padding_left - radius + x_pos;
                } else {
                    x_pos = padding_left - radius + x_pos;
                }
                return x_pos;
            })
            .attr("width", () => {
                let width = y.bandwidth() - 1;
                width = (d.radius * width)/max_rate;
                const change = get_rect_change('x', k, d.deviation*ca_space/100);

                if (change >= 0) {
                    width = width - 2*ca_space - change;
                } else {
                    width = width - 2*ca_space + change;
                }
                if (width < 5) {
                    width = 5;
                }

                return width;
            })
            .attr("y", function() {
                let y_pos = y_base = y.bandwidth();
                

                const change = get_rect_change('y', k, d.deviation*ca_space/100);
                if (change >= 0) {
                    y_pos = y_pos + change;
                } else {
                    y_pos = y_pos + ca_space - change;
                }

                if (y_pos < y_base) {
                    y_pos = y_base;
                }

                y_pos = (max_radius - radius)/2 + y_pos ;
                if (type === 'ca-legend') {
                    y_pos = y_pos + leg_top_start - max_radius;
                }
                return y_pos;
            })
            .attr("height", () => {
                let height = y.bandwidth()-1;
                height = (d.radius * height)/max_rate;
                
                const change = get_rect_change('y', k, d.deviation*ca_space/100);
                // console.log('k:', k, '  h:', change);
                if (change >= 0) {
                    height = height - 2*ca_space - change;
                } else {
                    height = height - 2*ca_space + change;
                }
                if (height < 5) {
                    height = 5;
                }
                
                return height;
            })
            .style("mix-blend-mode", "darken")
            .attr("fill", () => {
                const unc =  parseInt(d.deviation*255/100); // percentage to FF scale
                let hex_code = unc.toString(16);
                if (hex_code.length === 1) {
                    hex_code = 0 + hex_code;
                }
                let colr = bubble_colors[k];
                const rgb_part = colr.replace(/[(#)(ff)]/g, '');
                
                // colr = colr.replace(rgb_part, hex_code);

                return colr;
            });
    
            if (k === 0) {
                rect_g
                .append('text')
                .attr('dx', () => {
                    let dx = padding_left - label.toString().length * 4 + max_radius - radius + radius/2 - 15;
                    return dx;
                })
                .attr('dy', () => {
                    let dy = leg_top_start + label_top + radius/2 + 2;
                    if (type === 'ca-legend') {
                        dy += 10 ;
                    }
                    return dy;
                })
                .attr("font-size", 18)
                .attr("font-weight", 'bold')
                .attr("fill", '#2b1089')
                .html(label);
            }
    }

    function show_question(conf) {
        // Question sections
        const xx = 30;
        const yy = 30;

        svg
        .append("text")
        .text('VSUP Palette')
        .attr("x", xx)
        .attr("y", yy+20)
        .attr("font-size", 22);

        
        const question = `Question-${question_num}: Click on grid-cell where <Value=${conf.prediction}> and <Uncertainty=${conf.uncertainty}>`;

        const svg_g = svg.append('g');

        svg_g
        .append("text")
        .attr("x", xx + 700)
        .attr("y", yy + 400)
        .text(question)
        .attr("font-size", 18);

        transition_question(svg_g, 3000);
    }


}

function draw_vsup_bubble_questions() {

    let bubble_data = get_quantized_data();
    const leaves = get_bubble_leaves(bubble_data);
    const question_data = leaves.map(item => {
        return Object.assign({r: item.r}, item.data);
    });

    const dev_radiis = Array(dev_groups).fill(35);
    let dev_deviations = bubble_data.map(item => item.deviation);
    dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = leaves.map(item => item.r);
    val_radiis = _.sortBy(_.uniq(val_radiis));
    const val_deviations = Array(val_groups).fill(0);

    // used for legend drawing
    const dev_conf = {groups: dev_groups, deviations: dev_deviations, radiis: dev_radiis, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, deviations: val_deviations, radiis: val_radiis,  type: 'value-legend', legend_caption: 'Value'};

    const max_radius = _.max(val_conf.radiis);
   
    

    // define legend settings
    var vDom = d3.extent(question_data.map(function(d) { return d.r; }));
    var uDom = d3.extent(question_data.map(function(d) { return d.deviation; }));
    var quantization = vsup.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
    var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);
    var legend = vsup.legend.arcmapLegend();

    draw_chart(0, leaves);
    const svg = d3.select('.bubble-svg');

    legend
        .scale(scale)
        .size(160)
        .vtitle("")
        .utitle("Uncertainty");
    svg.append("g").call(legend);
    d3.select('.legend').attr("transform", "translate(960 230)");

    draw_legend(svg, val_conf, max_radius);
    // draw_legend(svg, dev_conf, max_radius);

    const legend_comp = d3.select('.legend');
    const g_tags = legend_comp.selectAll("g").filter(function() { 
        return this.parentNode == legend_comp.node();
    });

    // remove pred scales 
    d3.select(g_tags.nodes()[1]).remove();
    
    draw_question(svg, 700, 450, question_data, val_conf.radiis, dev_conf.deviations);

    function draw_chart(k, leaves) {
        let svg;
        if (k === 0) {
            svg = d3.select('.left-chart-container')
            .append("svg")
            .attr('class', 'bubble-svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

            svg
            .append("text")
            .text('VSUP + Bubble')
            .attr("x", 20)
            .attr("y", 40)
            .attr("font-size", 25)
            .attr("fill", 'black');
        } else {
            svg = d3.select('.bubble-svg');
        }

        const circle_g = svg.selectAll("g")
        .data(leaves)
        .join("g")
        .attr('class', (d) => {
            const nameCls = d && d.data.nameCls || '';
            let cls = 'circle-container circle-container-' + nameCls;
            return cls;
        })
        .attr("transform", d => {
            let xx = -100, yy = 150;
            return `translate(${d.x + 1 + xx},${d.y + 1 + yy})`
        });
    
        circle_g
            .append("circle")
            .attr("id", d => (d.data.name + '-' + d.data.count))
            .attr("r", d => d.r)
            .attr('info', (d) => {
                return 'value=' + d.r + ', unc=' + d.data.deviation;
            })
            .style("mix-blend-mode", "darken")
            .attr('class', ()=> {
                return 'abberation';
            })
            .attr("fill", function(d) { return scale(d.r, d.data.deviation); })
            .attr("cx", d => {
                return get_circle_coord('x', k, d.data.deviation/aberr_div_factor, 0, true);
            })
            .attr("cy", d => {
                return get_circle_coord('y', k, d.data.deviation/aberr_div_factor, 0, true);
            })
            .on('mousedown', function (ev, d) {
                if (ev.which !== 1) {
                    return;
                }

                bubble_quest_countries.forEach(country => {
                    if (country.name === d.data.name) {
                        answers[question_num] = true;
                    }
                });
                if (!answers[question_num]) {
                    answers[question_num] = false;
                }

                console.log(answers[question_num]);

                show_question(++question_num);

            });
    }

    function draw_legend(svg, conf, max_radius) {
        const {groups, type, radiis, deviations, legend_caption} = conf;

        let data = [];
        let legend_left_start = 480;
        let leg_top_start = max_radius + 10;

        if (type === 'ca-legend') {
            leg_top_start = 2*max_radius + 80;
            legend_left_start += 160;
        }

        let padding_left = legend_left_start + 20;

        for (let k = 0; k < groups; k++) {
            const radius = radiis[k];
            padding_left += 2 * radius + 10;
            const deviation = deviations[k];
            let label = type === 'value-legend' ? radius : deviation;
            label = parseInt(label).toString();
            data.push({radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label});
        }
    
        // Draw dev-group circles
        data.forEach((dev_rec, i) => {
            const circle_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_circle(circle_g, dev_rec, i, k);
            }
        });
    
    }

    function draw_question(svg, x, y, question_data, radiis) {
        const question_g_sel = 'bubble-ca-question-g';
        d3.select('.' + question_g_sel).remove();

        const svg_g = svg
            .append('g')
            .attr('class', question_g_sel);

        const radius = radiis[(question_num-1)%8];
        bubble_quest_countries = question_data.filter(item => item.r === radius);
        const ca = parseInt(bubble_quest_countries[0].deviation);
        const question = `Question-${question_num}: Click on bubble chart where <Value=${parseInt(radius)}> and <Uncertainty=${parseInt(ca)}>`;

        svg_g
        .append("text")
        .attr("x", x)
        .attr("y", y + 100)
        .text(question)
        .attr("font-size", 20)
        .attr('fill', 'black');

        transition_question(svg_g, 2800);
    }

}

function draw_vsup_grid_questions() {
    const cell_width = 52;
    let data = get_quantized_data();
    data = get_bubble_leaves(data).map(item => {
        item.data.r = item.r;
        return item.data;
    });

    const cell_per_row = data.length/5;
    data = data.map((item, indx) => {
        item.position_indx = parseInt((indx)/cell_per_row);
        return item;
    });
    
    d3.select('.vsup-svg').remove();

    var w = 260;
    var h = 200;
    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr('class', 'vsup-svg');

    var vDom = d3.extent(data.map(function(d) { return d.r; }));
    var uDom = d3.extent(data.map(function(d) { return d.deviation; }));

    var quantization = vsup.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
    var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);

    var x = d3.scaleBand().range([0, w]).domain(data.map(function(d) { return d.r; }));
    var y = d3.scaleBand().range([0, h]).domain(data.map(function(d) { return d.position_indx; }));

    // special scales for axes
    // var xAxis = d3.scalePoint().range([0, w]).domain([0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    var xAxis = d3.scaleLinear().range([0, w]).domain(d3.extent(data.map(function(d) { return d.r; })));
    const y_domain = [];
    for (let k=1; k<=cell_per_row; k++) {
        y_domain.push(k);
    }
    var yAxis = d3.scaleBand().range([0, h]).domain(y_domain);

    var heatmap = svg
        .attr("width", w)
        .attr("height", h).append("g")
        .attr("transform", "translate(230,250)");
    
    heatmap.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            const row = i%cell_per_row;
            return row*cell_width;
        })
        .attr("y", function(d) { return y(d.position_indx); })
        .attr("width", cell_width)
        .attr("height", y.bandwidth())
        // .attr("title", JSON.stringify)
        .attr("fill", function(d) { return scale(d.r, d.deviation); })
        .on('mousedown', function (ev) {
            if (ev.which !== 1) {
                return;
            }
            const fill_color = d3.select(this).attr('fill');
            console.log(vsup_quest_color === fill_color);
            show_question(++question_num);
        });

    // axes
    heatmap.append("g")
        .attr("transform", "translate(0," + h + ")")
        .call(d3.axisBottom(xAxis));

    heatmap.append("text")
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .attr("transform", "translate(" + (w / 2) + ", " + (h + 40) + ")")
        .text("New Cases")

    heatmap.append("g")
        .attr("transform", "translate(" + w + ", 0)")
        .call(d3.axisRight(yAxis));

    heatmap.append("text")
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .attr("transform", "translate(" + (w + 40) + ", " + (h / 2) + ")rotate(90)")
        .text("Countries");

    // legend
    var legend = vsup.legend.arcmapLegend();
    legend
        .scale(scale)
        .size(160)
        .vtitle("Value")
        .utitle("Uncertainty");

    svg.append("g").call(legend);
    d3.select('.legend').attr("transform", "translate(960 130)");


    // Question sections
    const xx = 30;
    const yy = 30;

    svg
    .append("text")
    .text('VSUP + Grid')
    .attr("x", xx)
    .attr("y", yy+20)
    .attr("font-size", 22);

    const conf = get_vsup_grid_conf();
    
    const question = `Question-${question_num}: Click on grid-cell where <Value=${conf.prediction}> and <Uncertainty=${conf.uncertainty}>`;

    const svg_g = svg.append('g');

    svg_g
    .append("text")
    .attr("x", xx + 700)
    .attr("y", yy + 400)
    .text(question)
    .attr("font-size", 22);

    transition_question(svg_g, 3000);


}

function get_vsup_grid_conf() {
    let uncertainty, value;
    switch (question_num%8) {
        case 1:
        uncertainty = 25;
        value = 42;
        vsup_quest_color = 'rgb(38, 130, 142)';
        break;

        case 2:
        uncertainty = 37;
        value = 42;
        vsup_quest_color = 'rgb(51, 99, 141)';
        break;

        case 3:
        uncertainty = 25;
        value = 47;
        vsup_quest_color = 'rgb(31, 160, 136)';
        break;

        case 4:
        uncertainty = 31;
        value = 56;
        vsup_quest_color = 'rgb(132, 212, 75)';
        break;

        case 5:
        uncertainty = 29;
        value = 49;
        vsup_quest_color = 'rgb(63, 188, 115)';
        break;

        case 6:
        uncertainty = 51;
        value = 47;
        vsup_quest_color = 'rgb(109, 195, 158)';
        break;

        case 7:
        uncertainty = 59;
        value = 42;
        vsup_quest_color = 'rgb(103, 147, 169)';
        break;

        case 8:
        uncertainty = 47;
        value = 61;
        vsup_quest_color = 'rgb(197, 229, 109)';
        break;
    }
    return {uncertainty, value, vsup_quest_color};
}

function get_bubble_leaves(bubble_data) {
    const pack = data => d3.pack()
    .size([width, height])(d3.hierarchy({children: bubble_data})
    .sum(d => d.count));
    const root = pack(bubble_data);
    let leaves = root.leaves();
    leaves = leaves.map(item => {
        item.r = item.r * radius_reduce_factor;
        return item;
    });
    return leaves;
}

function add_legend_circle(circle_g, dev_rec, i, k) {
            
    const {radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label} = dev_rec;
    const label_top = 20;

    if (i === 0 && k === 0) {
        let dx = legend_left_start;
        if (type === 'ca-legend') {
            dx += 30;
        }
        circle_g
        .append('text')
        .attr('dx', dx)
        .attr('dy', leg_top_start + label_top)
        .html(legend_caption);
    }

    circle_g
        .append('circle')
        .attr("r", radius)
        .attr("fill", d => bubble_colors[k])
        .attr('class', 'legend-circle-' + label)
        .attr('cx', () => {
            let cx = get_circle_coord('x', k, deviation/aberr_div_factor, padding_left, true);
            if (type === 'ca-legend') {
                cx += i*20;
            }
            return cx;
        })
        .attr('cy', () => {
            let cy = get_circle_coord('y', k, deviation/aberr_div_factor, leg_top_start, true) + 15;
            return cy;
        })
        .style("mix-blend-mode", "darken");

        if (k === 0) {
            circle_g
            .append('text')
            .attr('dx', () => {
                let dx = padding_left - label.toString().length * 4;
                if (type === 'ca-legend') {
                    dx += i*20 ;
                }
                return dx;
            })
            .attr('dy', () => {
                let dy = leg_top_start + label_top;
                return dy;
            })
            .attr("font-size", 18)
            .attr("font-weight", 'bold')
            .attr("fill", '#2b1089')
            .html(label);
        }
}

function get_quantized_data() {
    let data = prepare_bubble_data(prop_pred_data, sel_model);
    data = _.orderBy(data, ['deviation'], ['desc']);
    let bubble_data = [];
    data.forEach(item => {
        if (item.deviation < .5 && bubble_data.length < 25) {
            item.deviation *= 20;
            bubble_data.push(item);
        }
    });

    // Quantization
    const dev_groups = 4;
    const max_deviation = _.maxBy(bubble_data, 'deviation').deviation;
    const min_deviation = _.minBy(bubble_data, 'deviation').deviation;
    const dev_factor = (max_deviation - min_deviation) / dev_groups;

    const val_groups = 8;
    const max_value = _.maxBy(bubble_data, 'count').count;
    const min_value = _.minBy(bubble_data, 'count').count;
    const value_factor = (max_value - min_value) / val_groups;

    // for deviation
    for (let d = 0; d < dev_groups; d++) {
        const group_min = min_deviation + d*dev_factor;
        let group_max = min_deviation + (d + 1)*dev_factor;
        if (d < (dev_groups-1)) {
            group_max -= 0.00000001
        }

        bubble_data.forEach(item => {
            if (item.deviation >= group_min && item.deviation <= group_max) {
                item.deviation = (group_max + group_min) / 2;
            }
        });
    }
    
    // for values
    for (let d = 0; d < val_groups; d++) {
        const group_min = min_value + d*value_factor;
        let group_max = min_value + (d + 1)*value_factor;
        if (d < (val_groups-1)) {
            group_max -= 0.00000001
        }

        bubble_data.forEach(item => {
            if (item.count >= group_min && item.count <= group_max) {
                item.count = (group_max + group_min) / 2;
            }
        });
    }

    bubble_data = bubble_data.map(item => {
        item.deviation = parseInt(item.deviation * 100/max_deviation);
        item.count = parseInt(item.count/10000)
        return item;
    });

    return bubble_data;
}


function show_nav(svg, x, y, gap, font_size) {
    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y)
    .attr("font-size", font_size)
    .attr("fill", (d) => {
        return question_num > 1 ? 'black' : 'gray';
    })
    .on('mousedown', function (ev) {
        if (question_num > 1) {
            show_question(--question_num);
        }
    });

    svg
    .append("text")
    .text('Next')
    .attr("x", x+gap)
    .attr("y", y)
    .attr("font-size", font_size)
    .on('mousedown', function (ev) {
        if (ev.which !== 1) {
            return;
        }
        
        // let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        // chkboxes.forEach(chk => {
        //     const el = d3.select(chk);
        //     const is_checked = el.property('checked');
        //     if (is_checked) {
        //         answers[question_num] = el.property('id');
        //     }
        // });

        // if (answers[question_num] || empty_pass) {
        //     show_question(++question_num);
        // } else {
        //     svg
        //     .append("text")
        //     .text('Please select an option.')
        //     .attr("x", x-q_left)
        //     .attr("y", y + 850)
        //     .attr("font-size", 30)
        //     .attr("fill", 'red');
        // }
    });
}


function transition_question(svg_g, start_x) {
    svg_g
    .attr("transform", `translate(${start_x}, 0)`)
    .transition()             
    .ease(d3.easeLinear)           
    .duration(500)
    .attr("transform", 'translate(0, 0)');
}