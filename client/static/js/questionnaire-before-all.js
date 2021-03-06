const answers = {};
const question_types = ['ca', 'ca-static', 'blur', 'noise'];

// let question_num = 33;
// let cur_section_indx = 5;
let question_num = 1;
let cur_section_indx = 0;
let empty_pass = true;
let bubble_quest_countries, sel_country_num;
let vsup_quest_color;
const dev_groups = 4;
const val_groups = 8;
const radius_reduce_factor = 0.7;
const width = 650;
const height = 585;
const question_x = 700; 
const question_y = 450;
let current_rand_indx;
let is_single_valued;
let vsup_grid_render_colors = [];
const dev_mode = true;

let section_name;
let submitted = false;
const section_session_states = {'ca-bubble': false, 'ca-grid': false, 'vsup-bubble': false, 'vsup-grid': false};
const session_msg = 'To begin the session, please click the Start Button';

const sus_questions = [
    'I think that I would like to use this system frequently.',
    'I found the system unnecessarily complex.',
    'I thought the system was easy to use.',
    'I think that I would need the support of a technical person to be able to use this system.',
    'I found the various functions in this system were well integrated.',
    'I thought there was too much inconsistency in this system.',
    'I would imagine that most people would learn to use this system very quickly.',
    'I found the system very cumbersome to use.',
    'I felt very confident using the system.',
    'I needed to learn a lot of things before I could get going with this system.'
];

const nasa_tlx_questions = [
    {title: 'Mental Demand', question: 'How mentally demanding was the task?'},
    {title: 'Physical Demand', question: 'How physically demanding was the task?'},
    {title: 'Temporal Demand', question: 'How hurried or rushed was the pace of the task?'},
    {title: 'Performance', question: 'How successful were you in accomplishing what you were asked to do?'},
    {title: 'Effort', question: 'How hard did you have to work to accomplish your level of performance?'},
    {title: 'Frustration', question: 'How insecure, discouraged, irritated, stressed, and annoyed were you?'}
];

let email = location.href.indexOf('localhost') > -1 ? 'mrashidbd2000@gmail.com' : undefined;

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

const vsup_all_colors = [
    {uncertainty: [20, 40], colors: ['rgb(72, 24, 106)', 'rgb(66, 64, 134)', 'rgb(51, 99, 141)', 'rgb(38, 130, 142)', 'rgb(31, 160, 136)', 'rgb(63, 188, 115)', 'rgb(132, 212, 75)', 'rgb(216, 226, 25)']},
    {uncertainty: [41, 60], colors: ['rgb(117, 93, 155)', 'rgb(103, 147, 169)', 'rgb(109, 195, 158)', 'rgb(197, 229, 109)']},
    {uncertainty: [61, 80], colors: ['rgb(158, 164, 196)', 'rgb(180, 229, 176)']},
    {uncertainty: [81, 100], colors: ['rgb(205, 227, 225)']}
];
const all_vsups = _.concat(vsup_all_colors[0].colors, vsup_all_colors[1].colors, vsup_all_colors[2].colors, vsup_all_colors[3].colors)

const vsup_data = {
    1: { color: 'rgb(38, 130, 142)', value: 27, uncertainty: 37},
    2: { color: 'rgb(109, 195, 158)', value: 51, uncertainty: 43 },
    3: { color: 'rgb(72, 24, 106)', value: 8, uncertainty: 38 },
    4: { color: 'rgb(180, 229, 176)', value: 66, uncertainty: 78 },
    5: { color: 'rgb(205, 227, 225)', value: 34, uncertainty: 89 },
    6: { color: 'rgb(117, 93, 155)', value: 11, uncertainty: 56 },
    7: { color: 'rgb(51, 99, 141)', value: 19, uncertainty: 33 },
    8: { color: 'rgb(31, 160, 136)', value: 36, uncertainty: 23 }
};

const question_seqs = {
    'ca-bubble': {},
    'ca-grid': {},
    'vsup-bubble': {},
    'vsup-grid': {}
};
const modules = ['ca+bubble', 'ca+grid', 'vsup+bubble', 'vsup+grid']
let start_time, end_time;
const ca_bubble_singles_indxs = get_four_rands();
const ca_grid_singles_indxs = get_four_rands();

function show_question() {
    if (email) {
        sel_model = models[0];

        d3.select('.drill-models-container').style('display', 'none');
        d3.selectAll('.container-box svg').remove();
        d3.select('.section-caption').html('');
        
        let cur_order = cur_session_user_info.orders[cur_section_indx];
        if (question_num%8 === 0 && dev_mode) {
            cur_section_indx++;
        } else if (!dev_mode) {
            if (question_num-1 !== 0 && (question_num-1)%8 === 0) {
                if (!answers[section_name]['sus']) {
                    end_time = new Date();
                    const time_diff = Number((end_time - start_time)/(1000 * 60).toFixed('1'));
                    answers[section_name]['second-half-time'] = time_diff;
                    return show_sus_questions();
                }
            }
        }
        
        switch (cur_order) {
            case 1:
            set_section('ca-bubble');
            draw_ca_bubble_questions();
            break;

            case 2:
            set_section('ca-grid');
            draw_ca_grid_questions();
            break;

            case 3:
            set_section('vsup-bubble');
            draw_vsup_bubble_questions();
            break;

            case 4:
            set_section('vsup-grid');
            draw_vsup_grid_questions();
            break;
        }

        if (!cur_order) {
            show_submission_info();
        }

    } else {
        let x = 575, y = 300;
        const svg = d3.select('.container-box')
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
                return `<input type="text" class='txt-email' placeholder='Enter Your Email' id="txt-email">`;
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
    }


    function validate_email() {
        email = d3.select('.txt-email').property("value");
        const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        if (pattern.test(email)) {
            answers['participant-num'] = cur_session_user_info.index;
            answers['email'] = email;

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

    function set_section(name) {
        section_name = name;
        if (!answers[section_name]) {
            answers[section_name] = {};
        }
    }
}

function show_sus_questions(page=1) {
    const sub_module = 'sus';

    if (!answers[section_name][sub_module]) {
        answers[section_name][sub_module] = {};
    }

    const width = 1500;
    const height = 750;
    
    d3.selectAll('.container-box svg').remove();
    const svg = d3.select('.container-box')
        .append("svg")
        .attr('class', 'sus-svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-10, 0, width, height]);

    d3.select('.section-caption').html('System Usability Scale (SUS)');
    
    const x = 35, y = 40;
    const rect_x = 430;
    const svg_g = svg.append('g');
    const QuestionHeight = 130;

    const num_of_question = 5;

    svg_g
    .append("text")
    .text('Strongly Disagree')
    .attr("x", x + 750)
    .attr("y", y + 5)
    .attr("font-size", 16);

    svg_g
    .append("text")
    .text('Strongly Agree')
    .attr("x", x + 1140)
    .attr("y", y + 5)
    .attr("font-size", 16);
    
    for (let k = 0; k < num_of_question; k++) {
        svg_g.append('line')
        .style("stroke", "#ceccee")
        .style("stroke-width", 1)
        .attr("x1", x)
        .attr("y1", y + 30 + k*QuestionHeight)
        .attr("x2", x + width - 100)
        .attr("y2", y + 30 + k*QuestionHeight);

        draw_row_items(k, x, y, page)
    }

    function draw_row_items(k, x, y, page) {
        let yy = y + k*QuestionHeight;
        const indx = (page-1) * num_of_question + k;
        const q_indx = indx + 1
        const question = 'Q-' + (q_indx) + ': ' + sus_questions[indx];
        svg_g
        .append("text")
        .text(question)
        .attr("x", x + 30)
        .attr("y", yy + 90)
        .attr("font-size", 16);

        yy -= 30

        const w = 100;
        const module_cls = section_name;
        for (let ik = 0; ik < 5; ik++) {
            svg_g
            .append("rect")
            .attr("x", x + 320 + ik * w + rect_x)
            .attr("y", yy + 100 - 10)
            .attr("height", 50)
            .attr("width", w)
            .attr('fill', 'transparent')
            .attr('stroke', 'black');

            svg_g
            .append("foreignObject")
            .attr("x", x + 320 + ((ik+1) * w) - 60 + rect_x)
            .attr("y", yy + 110 - 10)
            .attr("width", 30)
            .attr("height", 30)
            .html(function(d) {
                return `<input type="checkbox" class='sus-chk ${module_cls}-${k}-sus-chk' name='sus-chk'>`;
            })
            .on('mousedown', function (ev) {
                if (ev.which !== 1) {
                    return;
                }
                next_sus_quest(ev, ik+1, k, page, q_indx, module_cls);
            });

            svg_g
            .append("text")
            .text(ik+1)
            .attr("x", x + 320 + ((ik+1) * 100) - 50 + rect_x)
            .attr("y", yy + 175 - 10)
            .attr("font-size", 16);

            transition_question(svg_g, 3000);
        }
    }

    function next_sus_quest(ev, ik, k, page, q_indx, module_cls) {
        let chks = d3.selectAll(`.${module_cls}-${k}-sus-chk`).nodes();
        chks.forEach(chk => {
            if (chk !== ev.target) {
                d3.select(chk).property("checked", false);;
            }
        });
        
        answers[section_name][sub_module][q_indx] = ik;

        setTimeout(() => {
            let answer_count = 0;
            chks = d3.selectAll(`.sus-chk`).nodes();
            chks.forEach(chk => {
                if (d3.select(chk).property("checked")) {
                    answer_count++;
                }
            });
    
            if (answer_count === 5) {
                if (page === 1) {
                    show_sus_questions(page+1);
                } else {
                    show_NASA_TLX_questions();
                }
            }
        }, 300);
    }
}

function show_NASA_TLX_questions(page=1) {
    const sub_module = 'nasa-tlx';

    if (!answers[section_name][sub_module]) {
        answers[section_name][sub_module] = {};
    }

    const width = 1500;
    const height = 750;
    
    d3.selectAll('.container-box svg').remove();
    const svg = d3.select('.container-box')
        .append("svg")
        .attr('class', 'nasa-svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-10, 0, width, height]);

    d3.select('.section-caption').html('NASA TLX Work Load Scale');
    
    const x = 35, y = 20;
    const rect_x = 430;
    const svg_g = svg.append('g');
    const QuestionHeight = 125;

    const q_indx = question_num - 32;
    const num_of_question = 6;
    
    for (let k = 0; k < num_of_question; k++) {
        if (k > 0) {
            svg_g.append('line')
            .style("stroke", "#ff86e3")
            .style("stroke-width", 1)
            .attr("x1", x)
            .attr("y1", y - 20 + k*QuestionHeight)
            .attr("x2", x + width - 100)
            .attr("y2", y - 20 + k*QuestionHeight);
        }

        draw_row_items(k, x, y, page)
    }

    function draw_row_items(k, x, y, page) {
        let yy = y + k*QuestionHeight - 150;

        const data = nasa_tlx_questions[k];
        const q_indx = k + 1
        const title = 'Question-' +  (q_indx) + '. ' + data.title + ':';
        svg_g
        .append("text")
        .text(title)
        .attr("x", x + 30)
        .attr("y", yy + 155)
        .attr("font-size", 16)
        .attr("font-weight", 'bold');
        
        svg_g
        .append("text")
        .text(data.question)
        .attr("x",  x + 80 + ((title.length+2) * 7))
        .attr("y", yy + 155)
        .attr("font-size", 16);

        const row_neg = 75;

        svg_g
        .append("text")
        .text('Very Low')
        .attr("x", x + 175)
        .attr("y", yy + 312 - row_neg)
        .attr("font-size", 16);

        svg_g
        .append("text")
        .text('Very High')
        .attr("x", x + 1310)
        .attr("y", yy + 312 - row_neg)
        .attr("font-size", 16);

        const xx = x + 170;
        const module_cls = section_name;
        for (let ik = 0; ik < 22; ik++) {
            const w = 55;
            svg_g
            .append("rect")
            .attr("x", xx + ik * w + 5)
            .attr("y", yy + 258 - row_neg)
            .attr("height", 35)
            .attr("width", w)
            .attr('fill', 'transparent')
            .attr('stroke', 'black');

            svg_g
            .append("foreignObject")
            .attr("x", xx + ((ik+1) * w) - (w-18))
            .attr("y", yy + 261 - row_neg)
            .attr("width", 30)
            .attr("height", 30)
            .html(function(d) {
                return `<input type="checkbox" class='nasa-chk ${module_cls}-nasa-chk' name='nasa-chk'>`;
            })
            .on('mousedown', function (ev) {
                if (ev.which !== 1) {
                    return;
                }
                next_nasa_quest(ev, ik, k, q_indx, module_cls);
            });

            transition_question(svg_g, 2000);
        }

        svg_g
        .append("line")
        .attr("x1", xx)
        .attr("y1", yy + 258 - row_neg)
        .attr("x2", xx + 1400)
        .attr("y2", yy + 258 - row_neg)
        .attr('stroke', 'white')
        .attr("stroke-width", 1);

        // mid-bar
        svg_g
        .append("line")
        .attr("x1", 695 + 120)
        .attr("y1", yy - 59 + 300 - row_neg)
        .attr("x2", 695 + 120)
        .attr("y2", yy + 293 - row_neg)
        .attr('stroke', 'black')
        .attr("stroke-width", 1.5);
    }

    function next_nasa_quest(ev, ik, k, q_indx, module_cls) {
        let chks = d3.selectAll(`.${module_cls}-${k}-nasa-chk`).nodes();
        chks.forEach(chk => {
            if (chk !== ev.target) {
                d3.select(chk).property("checked", false);;
            }
        });
        
        answers[section_name][sub_module][q_indx] = ik;

        setTimeout(() => {
            let answer_count = 0;
            chks = d3.selectAll(`.nasa-chk`).nodes();
            chks.forEach(chk => {
                if (d3.select(chk).property("checked")) {
                    answer_count++;
                }
            });
    
            if (answer_count === 6) {
                cur_section_indx++;
                show_question();
            }
        }, 300);
    }
}


function show_submission_info() {
    d3.select('.container-box svg').remove();
    const svg = d3.select('.container-box')
        .append("svg")
        .attr('class', 'bubble-svg')
        .attr("width", 1500)
        .attr("height", 800);

    cur_session_user_info.submitted = true;

    $.post('./save-feedback', {
        cb_user_data: JSON.stringify(cb_user_info),
        answers: JSON.stringify(answers),
        email
    },
    () => {
        svg
        .append("text")
        .text(`Done!`)
        .attr("x", 640)
        .attr("y", 170)
        .attr("font-size", 35);

        svg
        .append("text")
        .text(`Thank you for your participation.`)
        .attr("x", 430)
        .attr("y", 230)
        .attr("font-size", 30);
        
        svg
        .append("text")
        .text(`Your response has been saved. Please contact md313724@dal.ca for any query.`)
        .attr("x", 220)
        .attr("y", 300)
        .attr("font-size", 25);
    });
}

function draw_ca_bubble_questions() {

    let bubble_data = get_quantized_data();
    const leaves = get_bubble_leaves(bubble_data);

    const dev_radiis = Array(dev_groups).fill(leaves[0].r);
    let dev_deviations = bubble_data.map(item => item.deviation);
    const ordered_devs = dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = leaves.map(item => item.data.r_indx);
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


    var vDom = d3.extent(bubble_data.map(function(d) { return d.vsup_r; }));
    var uDom = d3.extent(bubble_data.map(function(d) { return d.deviation; }));
    var quantization = vsup.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
    var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);

    var legend = vsup.legend.arcmapLegend();
    legend
        .scale(scale)
        .size(160)
        .vtitle("Value")
        .utitle("");

    svg.append("g").call(legend);
    d3.select('.legend').attr("transform", "translate(850 160)");
    
    // update vsup items
    show_vsup_value_only();

    // draw_legend(svg, val_conf, max_radius);
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
            start_time = new Date();
            d3.selectAll('.txt-session').remove();
            section_session_states['ca-bubble'] = true;
            draw_question(svg, question_data, val_conf.radiis);
        });
    }


    function draw_chart(k, leaves) {
        let svg;
        if (k === 0) {
            svg = d3.select('.container-box')
            .append("svg")
            .attr('class', 'bubble-svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-10, 0, width, height]);

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
                        answers[section_name][question_num] = true;
                        // console.log('true')
                    }
                });

                if (!answers[section_name][question_num]) {
                    answers[section_name][question_num] = false;
                    // console.log('false')
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
            leg_top_start = 2*max_radius + 300;
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

        const base_num = (question_num-1) % 8;
        is_single_valued = base_num <= 3;

        if (base_num === 4) {
            set_first_half_time();
        }

        let ca, radius;
        if (is_single_valued) {
            const indx = ca_bubble_singles_indxs[base_num];
            const devs = _.uniq(question_data.map(item => item.deviation));
            ca = devs[indx];
            bubble_quest_countries = question_data.filter(item => item.deviation === ca);
        } else {
            // don't parseInt here as used in next line
            const rand_indx = get_next_index();
            radius = radiis[rand_indx]; // radius means color
            // radius, r_indx represents value(number_of_cases_count)
            // for user study forcefully we draw all circle with same radius
            bubble_quest_countries = question_data.filter(item => item.r_indx === radius);
            ca = parseInt(bubble_quest_countries[0].deviation);
            bubble_quest_countries = bubble_quest_countries.filter(item => item.deviation === ca);
        }

        let question = `Question-${question_num}: Click on bubble chart where $$ <CA=${parseInt(ca)}>`;
        if (is_single_valued) {
            question = question.replace('$$', ``);
        } else {
            question = question.replace('$$', `<Value=${parseInt(radius*8)}> and `);
        }

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

function get_14_random() {
    while (true) {
        const rand = _.random(1, 4);
        if (!answers[section_name].hasOwnProperty(rand)) {
            return rand;
        }
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
    const svg = d3.select('.container-box')
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

    var vDom = d3.extent(data.map(function(d) { return d.vsup_r; }));
    var uDom = d3.extent(data.map(function(d) { return d.deviation; }));
    var quantization = vsup.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
    var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);

    var legend = vsup.legend.arcmapLegend();
    legend
        .scale(scale)
        .size(160)
        .vtitle("Value")
        .utitle("");

    svg.append("g").call(legend);
    d3.select('.legend').attr("transform", "translate(850 180)");

    // update vsup items
    show_vsup_value_only();

    var heatmap = svg
        .attr("width", w)
        .attr("height", h).append("g")
        .attr("transform", "translate(60,170)");

    const dev_radiis = Array(dev_groups).fill(55);
    let dev_deviations = data.map(item => item.deviation);
    const ordered_devs = dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = data.map(item => item.r_indx);
    const ordered_values = val_radiis = _.sortBy(_.uniq(val_radiis));
    const val_deviations = Array(val_groups).fill(0);

    
    draw_grid(0, dev_deviations, ordered_values);
    draw_grid(1, dev_deviations, ordered_values);
    draw_grid(2, dev_deviations, ordered_values);


    // used for legend drawing
    const dev_conf = {groups: dev_groups, deviations: dev_deviations, radiis: dev_radiis, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, deviations: val_deviations, radiis: val_radiis,  type: 'value-legend', legend_caption: 'Value'};

    // draw_legend(svg, val_conf, max_radius, x, y);
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
            start_time = new Date();
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
                        answers[section_name][question_num] = true;
                        // console.log('true');
                    }
                });

                if (!answers[section_name][question_num]) {
                    answers[section_name][question_num] = false;
                    // console.log('false');
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
            leg_top_start = 315;
            legend_left_start = 300;
        }

        let padding_left = legend_left_start;

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
                dx = legend_left_start + 420;
                dy -= 10;
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
                    let dx = padding_left - label.toString().length * 6 + (x.bandwidth() - cell_width)/2;
                    return dx;
                })
                .attr('dy', () => {
                    let dy = leg_top_start + label_top + radius/4 + deviation/6;
                    // if (type === 'ca-legend') {
                    //     dy -= 16;
                    // }
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

        const base_num = (question_num-1) % 8;
        is_single_valued = base_num <= 3;

        if (base_num === 4) {
            set_first_half_time();
        }

        let ca, radius;
        if (is_single_valued) {
            const indx = ca_grid_singles_indxs[base_num];
            const devs = _.uniq(question_data.map(item => item.deviation));
            ca = devs[indx];
            bubble_quest_countries = question_data.filter(item => item.deviation === ca);
        } else {
            // don't parseInt here as used in next line
            const rand_indx = get_next_index();
            radius = radiis[rand_indx]; // radius means color
            // radius, r_indx represents value(number_of_cases_count)
            // for user study forcefully we draw all circle with same radius
            bubble_quest_countries = question_data.filter(item => item.r_indx === radius);
            ca = parseInt(bubble_quest_countries[0].deviation);
            bubble_quest_countries = bubble_quest_countries.filter(item => item.deviation === ca);
        }

        let question = `Question-${question_num}: Click on grid chart where $$ <CA=${parseInt(ca)}>`;
        if (is_single_valued) {
            question = question.replace('$$', ``);
        } else {
            question = question.replace('$$', `<Value=${parseInt(radius*8)}> and `);
        }

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

    const dev_radiis = Array(dev_groups).fill(leaves[0].r);
    let dev_deviations = bubble_data.map(item => {
        item.deviation = 0;
        return item;
    });
    const ordered_devs = dev_deviations = _.sortBy(_.uniq(dev_deviations));

    let val_radiis = leaves.map(item => item.data.r_indx);
    const ordered_vals = val_radiis = _.sortBy(_.uniq(val_radiis));
    const val_deviations = Array(val_groups).fill(0);

    // used for legend drawing
    const dev_conf = {groups: dev_groups, deviations: dev_deviations, radiis: dev_radiis, type: 'ca-legend', legend_caption: 'CA'};
    const val_conf = {groups: val_groups, deviations: val_deviations, radiis: val_radiis,  type: 'value-legend', legend_caption: 'Value'};

    const max_radius = _.max(val_conf.radiis);
   
    // define legend settings
    var vDom = d3.extent(question_data.map(function(d) { return d.vsup_r; }));
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
        .vtitle("Value")
        .utitle("Uncertainty");
    svg.append("g").call(legend);
    d3.select('.legend').attr("transform", "translate(860 180)");

    move_value_legend_upward();

    // draw_legend(svg, val_conf, max_radius);
    // draw_legend(svg, dev_conf, max_radius);

    // remove pred scales
    // const legend_comp = d3.select('.legend');
    // const g_tags = legend_comp.selectAll("g").filter(function() { 
    //     return this.parentNode == legend_comp.node();
    // });
    // d3.select(g_tags.nodes()[1]).remove();
    
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
            if (ev.which !== 1) {
                return;
            }
            start_time = new Date();
            d3.selectAll('.txt-session').remove();
            section_session_states['vsup-bubble'] = true;
            draw_question(svg, question_data, val_conf.radiis, dev_conf.deviations);
        });
    }

    function draw_chart(k, leaves) {
        let svg;
        if (k === 0) {
            svg = d3.select('.container-box')
            .append("svg")
            .attr('class', 'bubble-svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-10, 0, width, height]);

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
            // .attr("r", d => 30)
            .attr('info', (d) => {
                return 'value=' + d.r + ', unc=' + d.data.deviation;
            })
            .style("mix-blend-mode", "darken")
            .attr('class', (d)=> {
                return 'abberation ' + 'vsup-bubble-' + d.data.name;
            })
            .attr("fill", function(d) { 
                const color = get_vsup_bubble_color(k, d, ordered_vals);
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
                const nodes = d3.selectAll('.vsup-bubble-' + d.data.name).nodes();
                let color = [];
                nodes.forEach(node => {
                    const c = d3.select(node).attr('fill').replace(/(rgb)|,|(255)|\(|\)|\s/g, '');
                    color.push(c);
                });
                
                const selected_color = 'rgb(' + color.join(', ') + ')';
                if (is_single_valued) {
                    const color_item = vsup_all_colors.find(item => {
                        return item.uncertainty[0] <= vsup_quest_uncertainty && item.uncertainty[1] >= vsup_quest_uncertainty;
                    });
                    answers[section_name][question_num] = false;
                    color_item.colors.forEach(vsup_color => {
                        if (vsup_color === selected_color) {
                            answers[section_name][question_num] = true;
                        }
                    })
                } else {
                    answers[section_name][question_num] = vsup_quest_color === selected_color;
                }
                
                // console.log(vsup_quest_color, fill_color, answers[section_name][question_num])

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

        const base_num = (question_num-1) % 8;
        is_single_valued = base_num <= 3;

        if (base_num === 4) {
            set_first_half_time();
        }

        const {value, uncertainty} = get_vsup_conf();
        let question = `Question-${question_num}: Click on bubble chart where $$ <Uncertainty=${uncertainty}>`;
        if (is_single_valued) {
            question = question.replace('$$', ``);
        } else {
            question = question.replace('$$', `<Value=${value}> and `);
        }

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
    const svg = d3.select('.container-box')
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr('class', 'vsup-svg');

    var vDom = d3.extent(data.map(function(d) { return d.vsup_r; }));
    var uDom = d3.extent(data.map(function(d) { return d.deviation; }));

    var quantization = vsup.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
    var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);

    var x = d3.scaleBand().range([0, w]).domain(data.map(function(d) { return d.r; }));
    var y = d3.scaleBand().range([0, h]).domain(data.map(function(d) { return d.position_indx; }));

    // special scales for axes
    var xAxis = d3.scaleLinear().range([0, w]).domain(d3.extent(data.map(function(d) { return d.vsup_r; })));
    const y_domain = [];
    for (let k=1; k<=cell_per_row; k++) {
        y_domain.push(k);
    }
    var yAxis = d3.scaleBand().range([0, h]).domain(y_domain);

    var heatmap = svg
        .attr("width", w)
        .attr("height", h).append("g")
        .attr("transform", "translate(230,250)");
    
    let used_colors = [];
    
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
        .attr("fill", function(d, indx) {
            return vsup_grid_render_colors.length === 25 ? vsup_grid_render_colors[indx] : get_color();

            function get_color() {
                while (true) {
                    const rand = _.random(0, 14);
                    if (used_colors.indexOf(rand) === -1) {
                        const color = all_vsups[rand];
                        used_colors.push(rand);
                        if (used_colors.length === all_vsups.length) {
                            used_colors = [];
                        }
                        vsup_grid_render_colors.push(color);
                        return color;
                    }
                }
                
            }
        })
        .on('mousedown', function (ev) {
            if (ev.which !== 1 || !section_session_states['vsup-grid']) {
                return;
            }
            const selected_color = d3.select(this).attr('fill');
            // answers[section_name][question_num] = vsup_quest_color === fill_color;
            // const selected_color = 'rgb(' + color.join(', ') + ')';
            if (is_single_valued) {
                const color_item = vsup_all_colors.find(item => {
                    return item.uncertainty[0] <= vsup_quest_uncertainty && item.uncertainty[1] >= vsup_quest_uncertainty;
                });
                answers[section_name][question_num] = false;
                color_item.colors.forEach(vsup_color => {
                    if (vsup_color === selected_color) {
                        answers[section_name][question_num] = true;
                    }
                })
            } else {
                answers[section_name][question_num] = vsup_quest_color === selected_color;
            }


            // console.log(answers[section_name][question_num]);
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

    const conf = get_vsup_conf();
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
            start_time = new Date();
            d3.selectAll('.txt-session').remove();
            section_session_states['vsup-grid'] = true;
            draw_question(svg_g, question_x, question_y, conf);
        });
    }

    function draw_question(svg_g, question_x, question_y, conf) {
        const base_num = (question_num-1) % 8;
        is_single_valued = base_num <= 3;

        if (base_num === 4) {
            set_first_half_time();
        }

        let question = `Question-${question_num}: Click on grid chart where $$ <Uncertainty=${conf.uncertainty}>`;
        if (is_single_valued) {
            question = question.replace('$$', ``);
        } else {
            question = question.replace('$$', `<Value=${conf.value}> and`);
        }
        
        svg_g
        .append("text")
        .attr("x", question_x-50)
        .attr("y", question_y)
        .text(question)
        .attr("font-size", 22);

        transition_question(svg_g, 3000);
    }
}

function get_vsup_conf() {
    const indx = get_next_index();
    const cell_data = vsup_data[indx+1];
    
    vsup_quest_color = cell_data.color;
    const value = cell_data.value;
    const uncertainty = cell_data.uncertainty;
    vsup_quest_uncertainty = uncertainty;

    return {uncertainty, value, vsup_quest_color};
}

function get_bubble_leaves(bubble_data) {
    const pack = data => d3.pack()
    .size([width, height])(d3.hierarchy({children: bubble_data})
    .sum(d => d.count_r));
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
        // item.count = parseInt(item.count/10000);
        item.r_indx = parseInt((item.count-min_value)/value_factor) + 1;
        item.vsup_r = item.r_indx*8;
        // console.log(item.count, min_value, value_factor, item.r_indx)
        item.count_r = 1000; // For radius
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
    const dev = d.data ? d.data.r_indx : d.r_indx;
    const dev_indx = _.indexOf(ordered_values, dev);
    let vsup_colr = vsup_top_colors[dev_indx+1];
    return get_channel_color(vsup_colr, k);
}

function get_vsup_bubble_color(k, d, ordered_values) {
    const dev = d.data ? d.data.r_indx : d.r_indx;
    const dev_indx = _.indexOf(ordered_values, dev);
    let vsup_colr = vsup_data[dev_indx+1].color;
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

function show_vsup_value_only() {
    const remove_items = [];
    const legend_comp = d3.select('.legend');
    const g_tags = legend_comp.selectAll("g").filter(function() { 
        return this.parentNode == legend_comp.node();
    });
    remove_items.push(d3.select(g_tags.nodes()[0]));

    const bottom_cells = g_tags.nodes()[2].children;
    for (let k = 1; k <= 4; k++) {
        remove_items.push(d3.select(bottom_cells[k]));
    }
    remove_items.forEach(item => {
        item.remove();
    });
    move_value_legend_upward();
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

function get_next_index() {
    while (true) {
        const rand = _.random(0, 7);
        if (!question_seqs[section_name][rand]) {
            question_seqs[section_name][rand] = true;
            current_rand_indx = rand;
            return rand;
        }
    }
}

function get_four_rands() {
    const rands = [];
    while (true) {
        const rand = _.random(0, 3);
        if (rands.indexOf(rand) === -1) {
            rands.push(rand);
        }
        if (rands.length === 4) {
            return rands;
        }
    }
}


function set_first_half_time() {
    end_time = new Date();
    const time_diff = Number((end_time - start_time)/(1000 * 60).toFixed('1'));
    answers[section_name]['first-half-time'] = time_diff;
    start_time = new Date();
}
