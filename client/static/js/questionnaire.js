const answers = {};
const question_types = ['ca', 'ca-static', 'blur', 'noise'];

let question_num = 1, sel_country_num;
let empty_pass = true;
let cur_quest_perc;
let question_per_sec = 2;
let bubble_quest_countries;


function show_question() {
    sel_model = models[0];

    d3.select('.drill-models-container').style('display', 'none');
    d3.selectAll('.left-chart-container svg').remove();

    if (question_num <= 8) {
        draw_bubble_chart_questions();
    } else if (question_num > 8 && question_num <= 16) {
        draw_usage_chart_questions();
    }

}

function draw_usage_chart_questions() {
    const data = draw_usage_chart();
    // Draw rects
    const svg = d3.select('.rate-svg');
    show_usage_chart_legend(svg, data);

    show_nav(svg, 1071, 776, 214, 27);


    function show_usage_chart_legend(svg, legend_data) {

        const perc_count = 5;
        
        const max_deviation = _.maxBy(legend_data, 'uncertainty').uncertainty;
        const min_deviation = _.minBy(legend_data, 'uncertainty').uncertainty;
        const dev_factor = (max_deviation - min_deviation)/(perc_count-1);
    
        const max_rate = _.maxBy(legend_data, 'infection_rate').infection_rate;
        const min_rate = _.minBy(legend_data, 'infection_rate').infection_rate;;
        const size_factor = (max_rate - min_rate)/(perc_count-1);
    
        let data = [];
        
    
        let padding_left = 20;
        for (let k = 0; k < 5; k++) {
            const dev = (min_deviation + k * dev_factor)/10;
            const width = usage_cell_width * (k+1)/perc_count;
            padding_left += width + 10;
            const height = usage_cell_height * (k+1)/perc_count;
            const value = (min_rate + size_factor*k) * 1000;

            data.push({deviation: dev, width, height, value, padding_left});
        }

        svg
        .append("text")
        .text('CA + Grid')
        .attr("x", 20)
        .attr("y", 50)
        .attr("font-size", 25)
        .attr("fill", 'black');

        const x_pos = 30;
        const y_pos = 125;
        data.forEach((dev_rec, i) => {
            const rect_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                draw_legend_rect(rect_g, dev_rec, x_pos, y_pos, i, k, 'Value');

                draw_legend_rect(rect_g, dev_rec, x_pos, y_pos + usage_cell_height + 35, i, k, 'CA');
            }
        });
    
    
        function draw_legend_rect(rect_g, dev_rec, x_pos, y_pos, i, k, text) {
            const format_num = d3.format(",.1f");

            if (i === 0 && k===0) {
                rect_g.append("text")
                .text(text)
                .attr("x", x_pos)
                .attr("y", y_pos)
                .attr("font-size", 20)
                .attr("fill", 'black');
            }

            y_pos -= 25;

            rect_g
            .append("rect")
            .attr('class', (d, i) => {
                return 'usage-rect' + ' urect-' + i;
            })
            .attr("x", () => {
                let x;
                if (text === 'Value') {
                    x = x_pos + dev_rec.padding_left + usage_cell_width/2 + i*40;
                } else {
                    x = x_pos + dev_rec.padding_left + usage_cell_width/2 + i*40;
                }
                return x;
            })
            .attr("width", () => {
                const width = text === 'Value' ? dev_rec.width : usage_cell_width/3;
                return width;
            })
            .attr("y", () => {
                let y;
                if (text === 'Value') {
                    y = y_pos + (usage_cell_height - dev_rec.height)/2;
                } else {
                    y = y_pos + (usage_cell_height - dev_rec.height)/2 + dev_rec.height/2;
                }
                return y;
            })
            .attr("height", () => {
                const height = text === 'Value' ? dev_rec.height : usage_cell_height/2;
                return height;
            })
            .style("mix-blend-mode", "darken")
            .attr("fill", () => {
                const unc =  parseInt(dev_rec.uncertainty*255/100); // percentage to FF scale
                let hex_code = unc.toString(16);
                if (hex_code.length === 1) {
                    hex_code = 0 + hex_code;
                }
                let colr = bubble_colors[k];
                // const rgb_part = colr.replace(/[(#)(ff)]/g, '');
                
                // // colr = colr.replace(rgb_part, hex_code);
    
                return colr;
            });


            if (k === 0) {
                const label = text === 'Value' ? format_num(dev_rec.value) : format_num(dev_rec.deviation);
                rect_g
                .append('text')
                .attr('dx', () => {
                    // return x_pos + dev_rec.padding_left + dev_rec.width/2 - 10  + i*40;
                    return x_pos + dev_rec.padding_left + usage_cell_width/2 + i*40 + dev_rec.width/2;
                })
                .attr('dy', () => {
                    return y_pos + (usage_cell_height - dev_rec.height)/2 + dev_rec.height + 15;
                })
                .attr("font-size", 13)
                .attr("fill", '#2b1089')
                .html(label);
            }
        }
    }
}

function draw_bubble_chart_questions() {
    const width = 650;
    const height = 585;

    let data = prepare_bubble_data(prop_pred_data, sel_model);
    data = _.orderBy(data, ['deviation'], ['desc']);
    const bubble_data = [];
    data.forEach(item => {
        if (item.deviation < .5 && bubble_data.length < 25) {
            item.deviation *= 20;
            bubble_data.push(item);
        }
    });

    const radius_reduce_factor = 0.8;


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

    // used for legend drawing
    const dev_conf = {groups: dev_groups, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, type: 'value-legend', legend_caption: 'Value'};
   
    const leaves = get_bubble_leaves(bubble_data);
    for (let k = 0; k < 3; k++) {
        draw_chart(k, leaves);
    }
    const svg = d3.select('.bubble-svg');

    dev_conf.radiis = Array(dev_groups).fill(35);
    dev_conf.deviations = bubble_data.map(item => item.deviation);
    dev_conf.deviations = _.sortBy(_.uniq(dev_conf.deviations));

    val_conf.radiis = leaves.map(item => {
        return item.r * radius_reduce_factor;
    });
    val_conf.radiis = _.sortBy(_.uniq(val_conf.radiis));
    val_conf.deviations = Array(val_groups).fill(0);

    const max_radius = _.max(val_conf.radiis);

    draw_legend(svg, val_conf, max_radius);
    draw_legend(svg, dev_conf, max_radius);

    const question_data = leaves.map(item => {
        return Object.assign({r: item.r * radius_reduce_factor}, item.data);
    });

    draw_question(svg, 700, 450, question_data, val_conf.radiis, dev_conf.deviations);

    // show_nav(svg, 1000, 710, 200, 25);


    function get_bubble_leaves(bubble_data) {
        const pack = data => d3.pack()
        .size([width, height])(d3.hierarchy({children: bubble_data})
        .sum(d => d.count));
        const root = pack(bubble_data);
        const leaves = root.leaves();
        return leaves;
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
            .attr("r", d => d.r * radius_reduce_factor)
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
                return get_circle_coord('x', k, d.data.deviation, 0, true);
            })
            .attr("cy", d => {
                return get_circle_coord('y', k, d.data.deviation, 0, true);
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

                show_question(++question_num);

            });
            if (k === 0) {
                add_country_code(circle_g, false, true, '#000');
            }
    }

    function draw_legend(svg, conf, max_radius) {
        const {groups, type, radiis, deviations, legend_caption} = conf;
        const format_num = d3.format(",.1f");

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
            const label = type === 'value-legend' ? format_num(radius) : format_num(deviation);
            data.push({radius, deviation, padding_left, legend_left_start, leg_top_start, type, legend_caption, label});
        }
    
        // Draw circles
        data.forEach((dev_rec, i) => {
            const circle_g = svg.append('g');
            for(let k = 0; k < 3; k++) {
                add_legend_circle(circle_g, dev_rec, i, k);
            }
        });

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
                .attr('class', 'legend-circle-' + label.replace('.', '-'))
                .attr('cx', () => {
                    let cx = get_circle_coord('x', k, deviation, padding_left, true);
                    if (type === 'ca-legend') {
                        cx += i*20;
                    }
                    return cx;
                })
                .attr('cy', () => {
                    let cy = get_circle_coord('y', k, deviation, leg_top_start, true) + 15;
                    return cy;
                })
                .style("mix-blend-mode", "darken");
    
                if (k === 0) {
                    circle_g
                    .append('text')
                    .attr('dx', () => {
                        let dx = padding_left - label.length * 4;
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

    function draw_question(svg, x, y, question_data, radiis, deviations) {
        const question_g_sel = 'bubble-ca-question-g';
        d3.select('.' + question_g_sel).remove();

        const svg_g = svg
            .append('g')
            .attr('class', question_g_sel);

        let question;
        const format_num = d3.format(",.1f");

        const radius = radiis[question_num-1];
        bubble_quest_countries = question_data.filter(item => item.r === radius);
        

        question = `Question-${question_num}: Click on a Country where "Value=${format_num(radius)}" and "CA=${format_num(bubble_quest_countries[0].deviation)}".`;


        svg_g
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .text(question)
        .attr("font-size", 20)
        .attr('fill', 'black');

        transition_question(svg_g, 2800);
    }

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