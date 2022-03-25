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
const width = 1500;
const height = 800;
const question_x = 700; 
const question_y = 450;

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

let email = location.href.indexOf('localhost') > -1 ? 'mrashidbd2000@gmail.com' : '';

const modules = ['ca+bubble', 'ca+grid', 'vsup+bubble', 'vsup+grid']

window.onload = take_feedback;

function take_feedback() {
    let x = 475, y = 300;
    const svg = d3.select('.svg-container')
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
        .attr("width", 450)
        .attr("height", 75)
        .html(function(d) {
            return `<input type="text" class='txt-email' placeholder='Enter Your Email' id="txt-email" value=${email}>`;
        });

        d3.select('.txt-email').on('keyup', (ev) => {
            if (ev.keyCode === 13) {
                validate_email();
            }
        });

    svg
    .append("text")
    .text('Next')
    .attr("x", x + 395)
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
            let chkboxes = d3.selectAll('.comp-prof-chk').nodes();
            chkboxes.forEach(chk => {
                const el = d3.select(chk);
                const is_checked = el.property('checked');
                if (is_checked) {
                    answers['computer-skill'] = el.property('id');
                }
            });
            answers['email'] = email;
            d3.select('.email-panel').remove();

            section_name = 'sus';
            show_sus_questions();
        } else {
            svg
            .append("text")
            .text('Please enter your email')
            .attr("x", x)
            .attr("y", y + 80)
            .attr("font-size", 14)
            .attr("fill", 'red');
        }
    }

}

function show_sus_questions() {
    
    if (!answers[section_name]) {
        answers[section_name] = {};
        modules.forEach(module_name => {
            answers[section_name][module_name] = {}
        })
    }

    d3.select('.svg-container svg').remove();
    d3.select('.section-caption').html('System Usability Scale (SUS)')

    const width = 1500;
    const height = 750;
    const svg = d3.select('.svg-container')
    .append("svg")
    .attr('class', 'sus-svg')
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-10, 0, width, height]);

    const x = 35, y = 40;

    const svg_g = svg.append('g');
    const moduleGap = 170;

    const q_indx = question_num;
    const text = 'Question-' +  question_num + '. ' + sus_questions[q_indx-1];
    svg_g
    .append("text")
    .text(text)
    .attr("x", x + 400)
    .attr("y", y)
    .attr("font-size", 20);

    svg
    .append("text")
    .text('System')
    .attr("x", x + 40)
    .attr("y", y + 30)
    .attr("font-size", 20);
    
    for (let k = 0; k < modules.length; k++) {
        svg.append('line')
        .style("stroke", "#ceccee")
        .style("stroke-width", 1)
        .attr("x1", x)
        .attr("y1", y + 45 + k*moduleGap)
        .attr("x2", x + width - 100)
        .attr("y2", y + 45 + k*moduleGap); 
    }


    for (let k = 0; k < modules.length; k++) {
        draw_module_items(k, x, y, modules[k])
    }

    function draw_module_items(k, x, y, module_name) {
        const rect_x = 430;
        let yy = y + k*moduleGap;

        let sysLabelY = yy + 200
        if (k===3) {
            sysLabelY -= 12;
        }

        svg
        .append("text")
        .text(module_name)
        .attr("x", x + 30)
        .attr("y", sysLabelY)
        .attr("font-size", 16);

        svg
        .append("image")
        .attr("height", 130)
        .attr("width", 130)
        .attr("x", x)
        .attr("y", yy + 50)
        .attr('href',  `../static/fb-images/${module_name}.png`);

        yy -= 130
        svg_g
        .append("text")
        .text('Strongly')
        .attr("x", x -220 + rect_x)
        .attr("y", yy + 200)
        .attr("font-size", 16);

        svg_g
        .append("text")
        .text('Disagree')
        .attr("x", x - 220 + rect_x)
        .attr("y", yy + 225)
        .attr("font-size", 16);

        svg_g
        .append("text")
        .text('Strongly')
        .attr("x", x + 195 + rect_x)
        .attr("y", yy + 200)
        .attr("font-size", 16);

        svg_g
        .append("text")
        .text('Agree')
        .attr("x", x + 200 + rect_x)
        .attr("y", yy + 225)
        .attr("font-size", 16);

        const w = 100;
        const module_cls = module_name.replace('+', '-')
        for (let ik = 0; ik < 5; ik++) {
            svg_g
            .append("rect")
            .attr("x", x - 230 + ik * w + rect_x)
            .attr("y", yy + 240)
            .attr("height", 50)
            .attr("width", w)
            .attr('fill', 'transparent')
            .attr('stroke', 'black');

            svg_g
            .append("foreignObject")
            .attr("x", x - 230 + ((ik+1) * w) - 60 + rect_x)
            .attr("y", yy + 250)
            .attr("width", 30)
            .attr("height", 30)
            .html(function(d) {
                return `<input type="checkbox" class='sus-chk ${module_cls}-sus-chk' name='sus-chk'>`;
            })
            .on('mousedown', function (ev) {
                if (ev.which !== 1) {
                    return;
                }
                next_sus_quest(ev, ik+1, q_indx, module_name, module_cls);
            });

            svg_g
            .append("text")
            .text(ik+1)
            .attr("x", x - 230 + ((ik+1) * 100) - 50 + rect_x)
            .attr("y", yy + 315)
            .attr("font-size", 16);

            transition_question(svg_g, 3000);
        }
    }

    function next_sus_quest(ev, ik, q_indx, module_name, module_cls) {
        const chks = d3.selectAll(`.${module_cls}-sus-chk`).nodes();
        chks.forEach(chk => {
            if (chk !== ev.target) {
                d3.select(chk).property("checked", false);;
            }
        });
        
        answers[section_name][module_name][question_num] = ik;

        let answer_count = 0;
        modules.forEach(module_name => {
            if (answers[section_name][module_name][question_num]) {
                answer_count++;
            }
        })

        if (answer_count === 4) {
            question_num++;
            setTimeout(() => {
                if (q_indx < 10) {
                    show_sus_questions();
                } else {
                    section_name = 'nasa-tlx';
                    show_NASA_TLX_questions();
                }
            }, 300);
        }
    }
}

function show_NASA_TLX_questions() {
    if (!answers[section_name]) {
        answers[section_name] = {};
        modules.forEach(module_name => {
            answers[section_name][module_name] = {}
        })
    }
    
    const svg = d3.select('.svg-container svg')
    svg.select('g').remove();
    d3.select('.section-caption').html('NASA TLX Work Load')

    const x = 35, y = 40;

    const svg_g = svg.append('g');
    const moduleGap = 170;

    const q_indx = question_num - 10;
    const data = nasa_tlx_questions[q_indx];

    for (let k = 0; k < modules.length; k++) {
        svg.append('line')
        .style("stroke", "#ceccee")
        .style("stroke-width", 1)
        .attr("x1", x)
        .attr("y1", y + 45 + k*moduleGap)
        .attr("x2", x + width - 100)
        .attr("y2", y + 45 + k*moduleGap); 
    }

    const title = 'Question-' +  question_num + '. ' + data.title + ':';
    svg_g
    .append("text")
    .text(title)
    .attr("x", x + 400)
    .attr("y", y)
    .attr("font-size", 22)
    .attr("font-weight", 'bolder');
    
    svg_g
    .append("text")
    .text(data.question)
    .attr("x",  x + 290 + ((title.length+2) * 15))
    .attr("y", y)
    .attr("font-size", 20);

    for (let k = 0; k < modules.length; k++) {
        draw_module_items(k, x, y, modules[k])
    }

    function draw_module_items(k, x, y, module_name) {
        let yy = y + k*moduleGap - 150;

        svg_g
        .append("text")
        .text('Very Low')
        .attr("x", x + 175)
        .attr("y", yy + 312)
        .attr("font-size", 16);

        svg_g
        .append("text")
        .text('Very High')
        .attr("x", x + 1310)
        .attr("y", yy + 312)
        .attr("font-size", 16);

        const xx = x + 170;
        const module_cls = module_name.replace('+', '-')
        for (let ik = 0; ik < 22; ik++) {
            const w = 55;
            svg_g
            .append("rect")
            .attr("x", xx + ik * w + 5)
            .attr("y", yy + 258)
            .attr("height", 35)
            .attr("width", w)
            .attr('fill', 'transparent')
            .attr('stroke', 'black');

            svg_g
            .append("foreignObject")
            .attr("x", xx + ((ik+1) * w) - (w-18))
            .attr("y", yy + 261)
            .attr("width", 30)
            .attr("height", 30)
            .html(function(d) {
                return `<input type="checkbox" class='nasa-chk ${module_cls}-nasa-chk' name='nasa-chk'>`;
            })
            .on('mousedown', function (ev) {
                if (ev.which !== 1) {
                    return;
                }
                next_nasa_quest(ev, ik, q_indx, module_name, module_cls);
            });

            transition_question(svg_g, 2000);
        }

        svg_g
        .append("line")
        .attr("x1", xx)
        .attr("y1", yy + 258)
        .attr("x2", xx + 1400)
        .attr("y2", yy + 258)
        .attr('stroke', 'white')
        .attr("stroke-width", 1);

        // mid-bar
        svg_g
        .append("line")
        .attr("x1", 695 + 120)
        .attr("y1", yy - 59 + 300)
        .attr("x2", 695 + 120)
        .attr("y2", yy + 300)
        .attr('stroke', 'black')
        .attr("stroke-width", 1.5);
    }


    function next_nasa_quest(ev, ik, q_indx, module_name, module_cls) {
        const chks = d3.selectAll(`.${module_cls}-nasa-chk`).nodes();
        chks.forEach(chk => {
            if (chk !== ev.target) {
                d3.select(chk).property("checked", false);;
            }
        });
        
        answers[section_name][module_name][question_num] = ik;

        let answer_count = 0;
        modules.forEach(module_name => {
            if (answers[section_name][module_name][question_num]) {
                answer_count++;
            }
        })

        if (answer_count === 4) {
            question_num++;
            setTimeout(() => {
                if (q_indx < 5) {
                    show_NASA_TLX_questions();
                } else {
                    d3.select('.svg-container svg').remove();
                    show_submission_info();
                }
            }, 300);
        }
    }
}

function show_submission_info() {
    
    const svg = d3.select('.svg-container')
        .append("svg")
        .attr('class', 'bubble-svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-10, 0, width, height]);
    
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


function transition_question(svg_g, start_x) {
    svg_g
    .attr("transform", `translate(${start_x}, 0)`)
    .transition()             
    .ease(d3.easeLinear)           
    .duration(500)
    .attr("transform", 'translate(0, 0)');
}
