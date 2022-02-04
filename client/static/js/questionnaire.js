const answers = {};
const question_types = ['ca', 'ca-static', 'blur', 'noise'];

let question_num = 1, sel_country_num;
let empty_pass = true;
let cur_quest_perc;
let question_per_sec = 2;
let bubble_quest_countries;
let vsup_quest_color;
const dev_groups = 4;
const val_groups = 8;
const radius_reduce_factor = 0.8;
const width = 650;
const height = 585;

const question_x = 700; 
const question_y = 450;
let cur_section_indx = 0;
let submitted = false;
const section_session_states = {'ca-bubble': false, 'ca-grid': false, 'vsup-bubble': false, 'vsup-grid': false};
const session_msg = 'To begin the session, please click the Start Button';
let email;
// let email = 'mrashidbd2000@gmail.com';

const vsup_top_colors = {
    1: 'rgb(72, 24, 106)',
    2: 'rgb(66, 64, 134)',
    3: 'rgb(51, 99, 141)',
    4: 'rgb(38, 130, 142)',
    5: 'rgb(31, 160, 136)',
    6: 'rgb(63, 188, 115)',
    7: 'rgb(132, 212, 75)',
    8: 'rgb(216, 226, 25)'
};


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
    if (email) {
        sel_model = models[0];

        d3.select('.drill-models-container').style('display', 'none');
        d3.selectAll('.left-chart-container svg').remove();
        
        let cur_order = cur_session_user_info.orders[cur_section_indx];

        if (question_num%8 === 0) {
            cur_section_indx++;
        }
        // cur_order = 2;

        switch (cur_order) {
            case 1:
            draw_ca_bubble_questions();
            break;

            case 2:
            draw_ca_grid_questions();
            break;

            case 3:
            draw_vsup_bubble_questions();
            break;

            case 4:
            draw_vsup_grid_questions();
            break;
        }
        show_submission_info();

    } else {
        let x = 575, y = 300;
        const svg = d3.select('.left-chart-container')
            .append("svg")
            .attr('class', 'email-panel')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        svg
            .append("foreignObject")
            .attr("x", x)
            .attr("y", y)
            .attr("font-size", 45)
            .attr("width", 300)
            .attr("height", 75)
            .html(function(d) {
                return `<input type="text" class='txt-email' placeholder='Enter Email' id="txt-email">`;
            });

            d3.select('.txt-email').on('keyup', (ev) => {
                if (ev.keyCode === 13) {
                    validate_email();
                }
            });

        svg
            .append("text")
            .text('Next')
            .attr("x", x + 295)
            .attr("y", y + 50)
            .attr("font-size", 30)
            .attr("fill", 'black')
            .on('mousedown', function (ev) {
                validate_email();
            });


        function validate_email() {
            email = d3.select('.txt-email').property("value");
            const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

            if (pattern.test(email)) {
                d3.select('.email-panel').remove();
                show_question();
            } else {
                svg
                .append("text")
                .text('Invalid email')
                .attr("x", x)
                .attr("y", y + 80)
                .attr("font-size", 14)
                .attr("fill", 'red');
            }
        }
        
    }
}

function show_submission_info() {
    if (question_num === 33) {
        const svg = d3.select('.left-chart-container')
            .append("svg")
            .attr('class', 'bubble-svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);
        
        svg
        .append("text")
        .text('Submit')
        .attr("x", 655)
        .attr("y", 300)
        .attr('class', 'btn-submit')
        .attr("font-size", 47)
        .on('mousedown', function (ev) {
            cur_session_user_info.submitted = true;

            $.post('./save-feedback', {
                cb_user_data: JSON.stringify(cb_user_info),
                answers: JSON.stringify(answers),
                email
            },
            () => {
                d3.select('.btn-submit').remove();
                svg
                .append("text")
                .text(`Thank you for your participation.`)
                .attr("x", 430)
                .attr("y", 230)
                .attr("font-size", 35);
                
                svg
                .append("text")
                .text(`Your response has been saved. Please contact md313724@dal.ca for any query.`)
                .attr("x", 220)
                .attr("y", 300)
                .attr("font-size", 25);
            });
        });
    }
}

function draw_ca_bubble_questions() {

    let bubble_data = get_quantized_data();
    const leaves = get_bubble_leaves(bubble_data);

    const dev_radiis = Array(dev_groups).fill(35);
    let dev_deviations = bubble_data.map(item => item.deviation);
    const ordered_devs = dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = leaves.map(item => item.r);
    const ordered_vals = val_radiis = _.sortBy(_.uniq(val_radiis));
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

    if (section_session_states['ca-bubble']) {
        draw_question(svg, question_data, val_conf.radiis);
    } else {

        svg
        .append("text")
        .attr("x", question_x)
        .attr("y", question_y)
        .text(session_msg)
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'black');

        svg
        .append("text")
        .attr("x", question_x + 250)
        .attr("y", question_y + 100)
        .text('Start')
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'blue')
        .on('mousedown', function (ev) {
            d3.selectAll('.txt-session').remove();
            section_session_states['ca-bubble'] = true;
            draw_question(svg, question_data, val_conf.radiis);
        });
    }
    

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
                // let color = bubble_colors[k];
                const color = get_top_vsup_color(k, d, ordered_vals);
                return color;
            })
            .attr("cx", d => {
                const ca_space = get_ca_space(d.data, ordered_devs);
                return get_circle_coord('x', k, ca_space, 0, true);
            })
            .attr("cy", d => {
                const ca_space = get_ca_space(d.data, ordered_devs);
                return get_circle_coord('y', k, ca_space, 0, true);
            })
            .on('mousedown', function (ev, d) {
                if (ev.which !== 1 || !section_session_states['ca-bubble']) {
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

                show_question(++question_num);
            });
    }

    function draw_legend(svg, conf, max_radius) {
        const {groups, type, radiis, deviations, legend_caption} = conf;

        let data = [];
        let legend_left_start = 520;
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
            let colr = type === 'value-legend' ? vsup_top_colors[k+1] : undefined;
            data.push({radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label, color: colr});
        }
    
        // Draw circles
        data.forEach((dev_rec, i) => {
            const circle_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_circle(circle_g, dev_rec, i, k, ordered_devs);
            }
        }); 
    
    }

    function draw_question(svg, question_data, radiis) {
        const question_g_sel = 'bubble-ca-question-g';
        d3.select('.' + question_g_sel).remove();

        const svg_g = svg
            .append('g')
            .attr('class', question_g_sel);

        // don't parseInt here as used in next line
        const radius = radiis[(question_num-1)%8];
        bubble_quest_countries = question_data.filter(item => item.r === radius);

        const ca = parseInt(bubble_quest_countries[0].deviation);
        const question = `Question-${question_num}: Click on chart where <Value=${parseInt(radius)}> and <CA=${parseInt(ca)}>`;

        svg_g
        .append("text")
        .attr("x", question_x)
        .attr("y", question_y)
        .text(question)
        .attr("font-size", 20)
        .attr('fill', 'black');

        transition_question(svg_g, 2800);
    }
}

function draw_ca_grid_questions() {
    const cell_width = 52;
    const cell_height = 40;
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

    const max_radius = _.maxBy(data, 'r').r;
    
    d3.select('.vsup-svg').remove();

    var w = width;
    var h = height;
    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr('class', 'vsup-svg');

    svg
        .append("text")
        .text('CA + Grid')
        .attr("x", 20)
        .attr("y", 40)
        .attr("font-size", 25)
        .attr("fill", 'black');

    var x = d3.scaleBand().range([0, 800]).domain(data.map(function(d) { return d.r; }));
    var y = d3.scaleBand().range([0, 500]).domain(data.map(function(d) { return d.position_indx; }));

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

    // var legend = vsup.legend.arcmapLegend();
    // legend
    //     .scale(scale)
    //     .size(160)
    //     .vtitle("Value")
    //     .utitle("");

    // svg.append("g").call(legend);
    // d3.select('.legend').attr("transform", "translate(850 80)");

    // // remove pred scales
    // const legend_comp = d3.select('.legend');
    // const g_tags = legend_comp.selectAll("g").filter(function() { 
    //     return this.parentNode == legend_comp.node();
    // });
    // d3.select(g_tags.nodes()[0]).remove();
    // move_value_legend_upward();

    var heatmap = svg
        .attr("width", w)
        .attr("height", h).append("g")
        .attr("transform", "translate(50,170)");

    const dev_radiis = Array(dev_groups).fill(55);
    let dev_deviations = data.map(item => item.deviation);
    const ordered_devs = dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = data.map(item => item.r);
    const ordered_values = val_radiis = _.sortBy(_.uniq(val_radiis));
    const val_deviations = Array(val_groups).fill(0);

    
    draw_grid(0, dev_deviations, ordered_values);
    draw_grid(1, dev_deviations, ordered_values);
    draw_grid(2, dev_deviations, ordered_values);


    // used for legend drawing
    const dev_conf = {groups: dev_groups, deviations: dev_deviations, radiis: dev_radiis, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, deviations: val_deviations, radiis: val_radiis,  type: 'value-legend', legend_caption: 'Value'};

    draw_legend(svg, val_conf, max_radius, x, y);
    draw_legend(svg, dev_conf, max_radius, x, y);

    
    if (section_session_states['ca-grid']) {
        draw_question(svg, data, val_conf.radiis);
    } else {
        svg
        .append("text")
        .attr("x", question_x)
        .attr("y", question_y)
        .text(session_msg)
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'black');

        svg
        .append("text")
        .attr("x", question_x + 250)
        .attr("y", question_y + 100)
        .text('Start')
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'blue')
        .on('mousedown', function (ev) {
            d3.selectAll('.txt-session').remove();
            section_session_states['ca-grid'] = true;
            draw_question(svg, data, val_conf.radiis);
        });
    }

    function draw_grid(k, ordered_devs, ordered_values) {
        let ca_space;

        heatmap.append("g")
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr('class', (d, i) => {
                return 'rect-' + i;
            })
            .attr("x", function(d, i) {
                let x_pos = (i%cell_per_row);
                x_pos = x_pos* (cell_width + 30);
                ca_space = get_ca_space(d, ordered_devs);
                
                const change = get_rect_coord_change('x', k, ca_space);
                x_pos = x_pos + ca_space + change;

                return x_pos;
            })
            .attr("width", cell_width)
            .attr("y", function(d, i) {
                let y_pos = y_base = y(d.position_indx) - d.position_indx*30;
                ca_space = get_ca_space(d, ordered_devs);
                const change = get_rect_coord_change('y', k, ca_space);
                y_pos = y_pos + ca_space + change;

                if (y_pos < 0) {
                    y_pos = 0;
                }
                return y_pos;
            })
            .attr("height", cell_height)
            .style("mix-blend-mode", "darken")
            .attr("fill", (d) => {
                const colr = get_top_vsup_color(k, d, ordered_values);
                return colr;
            })
            .on('mousedown', function (ev, d) {
                if (ev.which !== 1 || !section_session_states['ca-grid']) {
                    return;
                }

                bubble_quest_countries.forEach(country => {
                    if (country.name === d.name) {
                        answers[question_num] = true;
                    }
                });

                if (!answers[question_num]) {
                    answers[question_num] = false;
                }

                show_question(++question_num);
            });

    }

    function draw_legend(svg, conf, max_radius, x, y) {
        const {groups, type, radiis, deviations, legend_caption} = conf;

        let data = [];
        let legend_left_start = 500;
        let leg_top_start = 70;

        if (type === 'ca-legend') {
            leg_top_start = 170;
            legend_left_start += 160;
        }

        let padding_left = legend_left_start + 35;

        for (let k = 0; k < groups; k++) {
            const radius = 55;
            padding_left += 2 * radius ;
            const deviation = deviations[k];
            const rec = {radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, max_radius};
            let label;
            if (type === 'value-legend') {
                label = radiis[k];
                rec.r = radiis[k];
            } else {
                label = deviation;
            }
            rec.label = parseInt(label).toString();
            data.push(rec);
        }
    
        // Draw dev-group circles
        data.forEach((dev_rec, i) => {
            const rect_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_rect(rect_g, dev_rec, i, k, x, y, radiis);
            }
        });
    }

    function add_legend_rect(rect_g, d, i, k, x, y, ordered_radiis) {
            
        const {radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label, max_radius} = d;
        const label_top = 0;
        let ca_space;
    
        if (i === 0 && k === 0) {
            let dx;
            let dy = leg_top_start + label_top + radius/2 + 3;
            if (type === 'ca-legend') {
                dx = legend_left_start + 65;
            } else {
                dx = legend_left_start + 45;
            }
            rect_g
            .append('text')
            .attr('dx', dx)
            .attr('dy', dy)
            .html(legend_caption);
        }

        rect_g
            .append('rect')
            .attr('class', 'legend-rect-' + label)
            .attr("x", function() {
                let x_pos = 0;
                const width = x.bandwidth() - 1;
                x_pos = x_pos*width;
                ca_space = get_ca_space(d, ordered_devs);
                
                const change = get_rect_coord_change('x', k, ca_space);
                x_pos = x_pos + ca_space + change;

                x_pos = padding_left - max_radius + x_pos + (width - cell_width)/2;
                if (type === 'value-legend') {
                    x_pos += 5;
                }
                return x_pos;
            })
            .attr("width", cell_width)
            .attr("y", function() {
                let y_pos = leg_top_start;
                ca_space = get_ca_space(d, ordered_devs);
                const change = get_rect_coord_change('y', k, ca_space);

                y_pos = y_pos + ca_space + change;

                y_pos = y_pos + (max_radius - radius)/2;
                
                return y_pos;
            })
            .attr("height", cell_height)
            .style("mix-blend-mode", () => {
                return "darken";
            })
            .attr("fill", () => {
                let colr;
                if (type === 'ca-legend') {
                    colr = bubble_colors[k];
                } else {
                    colr = get_top_vsup_color(k, d, ordered_radiis);
                }
                return colr;
            });
    
            if (k === 2) {
                rect_g
                .append('text')
                .attr('dx', () => {
                    let dx = padding_left - label.toString().length * 6 - 7;
                    return dx;
                })
                .attr('dy', () => {
                    let dy = leg_top_start + label_top + radius/4 + 18 + deviation/6;
                    if (type === 'ca-legend') {
                        dy -= 2;
                    }
                    return dy;
                })
                .attr("font-size", 18)
                .attr("font-weight", 'bold')
                .attr("fill", '#fff')
                .html(label);
            }
    }

    function draw_question(svg, question_data, radiis) {
        const question_g_sel = 'bubble-ca-question-g';
        d3.select('.' + question_g_sel).remove();

        const svg_g = svg
            .append('g')
            .attr('class', question_g_sel);

        // don't parseInt here as used in next line
        const radius = radiis[(question_num-1)%8];
        bubble_quest_countries = question_data.filter(item => item.r === radius);

        const ca = parseInt(bubble_quest_countries[0].deviation);
        const question = `Question-${question_num}: Click on chart where <Value=${parseInt(radius)}> and <CA=${parseInt(ca)}>`;

        svg_g
        .append("text")
        .attr("x", question_x)
        .attr("y", question_y)
        .text(question)
        .attr("font-size", 20)
        .attr('fill', 'black');

        transition_question(svg_g, 2800);
    }

}

function draw_vsup_bubble_questions() {

    let bubble_data = get_quantized_data();
    const leaves = get_bubble_leaves(bubble_data);
    const question_data = leaves.map(item => {
        return Object.assign({r: item.r}, item.data);
    });

    const dev_radiis = Array(dev_groups).fill(35);
    let dev_deviations = bubble_data.map(item => {
        item.deviation = 0;
        return item;
    });
    const ordered_devs = dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = leaves.map(item => item.r);
    const ordered_vals = val_radiis = _.sortBy(_.uniq(val_radiis));
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

    for (let k = 0; k < 3; k++) {
        draw_chart(k, leaves);
    }
    const svg = d3.select('.bubble-svg');

    legend
        .scale(scale)
        .size(160)
        .vtitle("")
        .utitle("Uncertainty");
    svg.append("g").call(legend);
    d3.select('.legend').attr("transform", "translate(860 180)");

    draw_legend(svg, val_conf, max_radius);
    // draw_legend(svg, dev_conf, max_radius);

    // remove pred scales
    const legend_comp = d3.select('.legend');
    const g_tags = legend_comp.selectAll("g").filter(function() { 
        return this.parentNode == legend_comp.node();
    });
    d3.select(g_tags.nodes()[1]).remove();
    
    if (section_session_states['vsup-bubble']) {
        draw_question(svg, question_data, val_conf.radiis, dev_conf.deviations);
    } else {
        svg
        .append("text")
        .attr("x", question_x)
        .attr("y", question_y + 50)
        .text(session_msg)
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'black');

        svg
        .append("text")
        .attr("x", question_x + 250)
        .attr("y", question_y + 150)
        .text('Start')
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'blue')
        .on('mousedown', function (ev) {
            d3.selectAll('.txt-session').remove();
            section_session_states['vsup-bubble'] = true;
            draw_question(svg, question_data, val_conf.radiis, dev_conf.deviations);
        });
    }

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
            .attr("fill", function(d) { 
                // return scale(d.r, d.data.deviation);
                const color = get_top_vsup_color(k, d, ordered_vals);
                return color;
            })
            .attr("cx", d => {
                const ca_space = get_ca_space(d.data, ordered_devs);
                return get_circle_coord('x', k, ca_space, 0, true);
            })
            .attr("cy", d => {
                const ca_space = get_ca_space(d.data, ordered_devs);
                return get_circle_coord('y', k, ca_space, 0, true);
            })
            .on('mousedown', function (ev, d) {
                if (ev.which !== 1 || !section_session_states['vsup-bubble']) {
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
            let colr = type === 'value-legend' ? vsup_top_colors[k+1] : undefined;
            data.push({radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label, color: colr});
        }
    
        // Draw dev-group circles
        data.forEach((dev_rec, i) => {
            const circle_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_circle(circle_g, dev_rec, i, k, ordered_devs);
            }
        });
    
    }

    function draw_question(svg, question_data, radiis) {
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
        .attr("x", question_x)
        .attr("y", question_y + 50)
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
        .attr("fill", function(d) { return scale(d.r, d.deviation); })
        .on('mousedown', function (ev) {
            if (ev.which !== 1 || !section_session_states['vsup-grid']) {
                return;
            }
            const fill_color = d3.select(this).attr('fill');
            answers[question_num] = vsup_quest_color === fill_color;

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
    d3.select('.legend').attr("transform", "translate(900 130)");

    move_value_legend_upward();

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
    
    const svg_g = svg.append('g');

    if (section_session_states['vsup-grid']) {
        draw_question(svg_g, question_x, question_y, conf);
    } else {
        svg_g
        .append("text")
        .attr("x", question_x)
        .attr("y", question_y)
        .text(session_msg)
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'black');

        svg_g
        .append("text")
        .attr("x", question_x + 250)
        .attr("y", question_y + 100)
        .text('Start')
        .attr('class', 'txt-session')
        .attr("font-size", 25)
        .attr('fill', 'blue')
        .on('mousedown', function (ev) {
            d3.selectAll('.txt-session').remove();
            section_session_states['vsup-grid'] = true;
            draw_question(svg_g, question_x, question_y, conf);
        });
    }

    function draw_question(svg_g, question_x, question_y, conf) {
        const question = `Question-${question_num}: Click on grid-cell where <Value=${conf.value}> and <Uncertainty=${conf.uncertainty}>`;
        svg_g
        .append("text")
        .attr("x", question_x-50)
        .attr("y", question_y)
        .text(question)
        .attr("font-size", 22);

        transition_question(svg_g, 3000);
    }
}

function get_vsup_grid_conf() {
    let uncertainty, value;
    const indx = (question_num-1)%8;
    const question_colors = {
        1: 'rgb(103, 147, 169)',
        2: 'rgb(66, 64, 134)',
        3: 'rgb(51, 99, 141)',
        4: 'rgb(38, 130, 142)',
        5: 'rgb(31, 160, 136)',
        6: 'rgb(63, 188, 115)',
        7: 'rgb(132, 212, 75)',
        8: 'rgb(109, 195, 158)'
    };
    
    vsup_quest_color = question_colors[indx+1];
    switch (indx) {
        case 0:
        uncertainty = 25;
        value = 42;
        break;

        case 1:
        uncertainty = 37;
        value = 42;
        break;

        case 2:
        uncertainty = 25;
        value = 47;
        break;

        case 3:
        uncertainty = 31;
        value = 56;
        break;

        case 4:
        uncertainty = 29;
        value = 49;
        break;

        case 5:
        uncertainty = 51;
        value = 47;
        break;

        case 6:
        uncertainty = 59;
        value = 42;
        break;

        case 7:
        uncertainty = 47;
        value = 61;
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

function add_legend_circle(circle_g, dev_rec, i, k, ordered_devs) {
            
    const {radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label, color} = dev_rec;
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

    const bubble_color = type === 'ca-legend' ? bubble_colors[k] : get_channel_color(color, k);

    circle_g
        .append('circle')
        .attr("r", radius)
        .attr("fill", bubble_color)
        .attr('class', 'legend-circle-' + label)
        .attr('cx', () => {
            const ca_space = get_ca_space({deviation}, ordered_devs);
            let cx = get_circle_coord('x', k, ca_space, padding_left, true);
            if (type === 'ca-legend') {
                cx += i*20;
            }
            return cx;
        })
        .attr('cy', () => {
            const ca_space = get_ca_space({deviation}, ordered_devs);
            let cy = get_circle_coord('y', k, ca_space, leg_top_start, true) + 15;
            return cy;
        })
        .style("mix-blend-mode", "darken");

        if (k === 2) {
            const perc = Number(label);
            circle_g
            .append('text')
            .attr('dx', () => {
                let dx = padding_left - label.toString().length * 4;
                if (type === 'ca-legend') {
                    dx += i*20;
                }
                if (perc === 20) {
                    dx -= 2;
                }
                return dx;
            })
            .attr('dy', () => {
                let dy = leg_top_start + label_top;
                return dy;
            })
            .attr("font-size", 18)
            .attr("font-weight", 'bold')
            .attr("fill", 'white')
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

function get_ca_space(d, ordered_devs) {
    const dev_indx = get_dev_index(d, ordered_devs);
    const ca_space = (dev_indx + 1) * 3;
    return ca_space;
}

function get_dev_index(d, ordered_devs) {
    return ordered_devs.indexOf(d.deviation);
}

function get_top_vsup_color(k, d, ordered_values) {
    const dev_indx = _.indexOf(ordered_values, d.r);
    let vsup_colr = vsup_top_colors[dev_indx+1];
    return get_channel_color(vsup_colr, k);
}

function get_channel_color(given_color, chan_indx) {
    const col_base = given_color.replace(/(rgb)|\s|\(|\)/g, '').split(',')[chan_indx];
    let colr;
    switch (chan_indx) {
        case 0:
        colr = 'rgb(' + col_base + ',255,255)';
        break;
        
        case 1:
        colr = 'rgb(255,' + col_base + ',255)';
        break;

        case 2:
        colr = 'rgb(255,255,' + col_base + ')';
        break;
    }
    return colr;
}

// move Value label a bit upward
function move_value_legend_upward() {
    const legend_comp = d3.select('.legend');
    const value_label = legend_comp
    .selectAll('text').filter(function(){ 
        return d3.select(this).text() === 'Value';
    });
    if (value_label) {
        const txt = value_label.nodes()[0];
        const y = d3.select(txt).attr('y');
        d3.select(txt).attr('y', Number(y) - 10);
    }
}