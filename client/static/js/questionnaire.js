const answers = {};
const sel_questions = ['ca', 'ca-static', 'blur', 'noise'];

let question_num = 33, sel_country_num;
let empty_pass = true;
let cur_quest_perc;


function show_question() {
    let ex_percents = [0, 25, 50, 75, 100];
    sel_model = models[0];

    let ques_percents;
    let modes;
    if (question_num >= 1 && question_num <= 5) {
        sel_quest_category = sel_questions[0];
    } else if (question_num >= 6 && question_num <= 10) {
        sel_quest_category = sel_questions[1];
    } else if (question_num >= 11 && question_num <= 15) {
        sel_quest_category = sel_questions[2];
    } else if (question_num >= 16 && question_num <= 20) {
        sel_quest_category = sel_questions[3];
    } else if (question_num >= 21 && question_num <= 23) {
        sel_quest_category = 'vsup';
    } else if (question_num >= 24 && question_num <= 26) {
        sel_quest_category = 'drill-models';
    } else if (question_num >= 27 && question_num <= 29) {
        sel_quest_category = 'horizon-chart';
    } else if (question_num >= 30 && question_num <= 32) {
        sel_quest_category = 'usage-chart';
    } else if (question_num >= 33 && question_num <= 35) {
        sel_quest_category = 'impact-chart';
    } else if (question_num >= 36 && question_num <= 39) {
        sel_quest_category = 'star-fish';
    } else {
        return;
    }

    if (sel_questions.indexOf(sel_quest_category) > -1) {
        d3.selectAll('.container-box').classed('whole-width', true);
        d3.selectAll('.left-chart-container svg').remove();
        d3.select('.drill-models-container').style('display', 'none');

        switch (sel_quest_category) {
            case 'ca':
            modes = ['ca', 'ca', 'ca', 'ca', 'ca'];
            ques_percents = [72, 15, 45, 25, 87];
            break;
            
            case 'ca-static':
            modes = ['ca-static', 'ca-static', 'ca-static', 'ca-static', 'ca-static'];
            ques_percents = [23, 18, 70, 40, 85];
            break;
            
            case 'blur':
            modes = ['blur', 'blur', 'blur', 'blur', 'blur'];
            ques_percents = [80, 30, 15, 65, 50];
            break;
            
            case 'noise':
            modes = ['noise', 'noise', 'noise', 'noise', 'noise'];
            ques_percents = [40, 75, 30, 55, 15];
            break;
        }

        modes.forEach((mode, indx) => {
            ex_percents[indx] /= 10;
            draw_bubble_chart(prop_pred_data, {ex_indx: indx, question_circle_mode: mode, type: 'example', percents: ex_percents});
        });

        const indx = (question_num-1)%5;
        cur_quest_perc = ques_percents[indx];
        const ques_perc = [cur_quest_perc/10];
        draw_bubble_chart(prop_pred_data, {question_circle_mode: sel_quest_category, circle_for: 'question', percents: ques_perc});

    } else if (sel_quest_category === 'vsup') {
        d3.selectAll('.left-chart-container .inner-container, .left-chart-container svg').remove();
        
        d3.selectAll('.container-box').classed('whole-width', true);

        show_vsup_questions();
    } else if (sel_quest_category === 'drill-models') {
        drill_country = 'Brazil';
        d3.select('.main-stream-chart').style('display', 'none');
        d3.select('.drill-models-container').style('display', 'block');
        color_or_texture = 'texture';
        control_mode = 'drill-models';
        country_stream_mode = country_stream_modes[0];
        sel_chart_type = chart_types[0];
        
        d3.selectAll('.container-box').classed('whole-width', false);

        create_drill_container();
        add_drill_models_questions();
    } else if (sel_quest_category === 'horizon-chart') {
        d3.select('.drill-models-container').style('display', 'none');
        color_or_texture = 'texture';
        sel_chart_type = chart_types[2];
        
        d3.selectAll('.container-box').classed('whole-width', true);

        draw_horizon_chart(prop_pred_data, color_or_texture);
        show_horizon_chart_questions();

    } else if (sel_quest_category === 'usage-chart') {
        sel_chart_type = chart_types[4];
        d3.selectAll('.left-chart-container .inner-container, .left-chart-container svg').remove();
        d3.selectAll('.container-box').classed('whole-width', true);
        draw_usage_chart();
        show_usage_chart_questions();

    } else if (sel_quest_category === 'impact-chart') {
        sel_chart_type = chart_types[3];
        d3.selectAll('.left-chart-container .inner-container, .left-chart-container svg').remove();
        d3.selectAll('.container-box').classed('whole-width', true);
        draw_impact_chart(prop_pred_data);
        show_impact_chart_questions();

    } else if (sel_quest_category === 'star-fish') {
        const star_countries = [
            {name: 'Argentina', x: 155, y: -280},
            {name: 'Pakistan', x: 590, y: -280},
            {name: 'Iraq', x: -250, y: 270},
            {name: 'Indonesia', x: -140, y: -60},
            {name: 'Japan', x: 480, y: 930},
            {name: 'Italy', x: 1000, y: 230},
            {name: 'Georgia', x: 900, y: 780},
            {name: 'Vietnam', x: -250, y: 700}
        ];
        country_stream_mode = 'Prediction';
        sel_chart_type = chart_types[0];
        drill_country = undefined;
        
        if (question_num === 36) {
            d3.selectAll('.left-chart-container svg').remove();
            d3.selectAll('.container-box').classed('whole-width', true);
            draw_bubble_chart(prop_pred_data, {model: sel_model});
            
            country_streams = [];
            star_countries.forEach(country => {
                country_streams.push(country.name);
                draw_stream_graph({pred_data: prop_pred_data, sel_country: country.name, mode: 'texture'});
            });
        }

        show_star_fish_questions(star_countries);
    }

}


function show_star_fish_questions(star_countries) {
    d3.select('.star-fish-questions').remove();
    const svg = d3.select('.bubble-svg').append('g').attr('class', 'star-fish-questions');
    let question, options;

    svg
    .append('text')
    .attr('x', -330)
    .attr('y', -330)
    .attr('width', 100)
    .attr('height', 20)
    .text('fill', 'red')
    .text('Star Fish Layout')
    .attr("font-size", 50);

    star_countries.forEach((country) => {
        svg
        .append('text')
        .attr('x', country.x)
        .attr('y', country.y)
        .attr('width', 100)
        .attr('height', 20)
        .text('fill', 'red')
        .text(country.name)
        .attr("font-size", 25);
    });

    let x = 1300, y = -220;
    
    if ([36, 37, 38].indexOf(question_num) > -1) {
        const texts = [
            'Hints:',
            'Uncertainty is',
            '* Proportional to the color brightness',
            '* Inversely proportional to the size of the bubbles.',
            '* Independent on column height.'
        ];

        texts.forEach((text, indx) => {
            svg
            .append("text")
            .text(text)
            .attr("x", x)
            .attr("y", y + 45*(indx+1))
            .attr("font-size", 37);
        });
    }

    const submit_num = 39;

    switch (question_num) {
        case 36:
            question = `Question-${question_num}: The layout is easy representation of multiple country Uncertainties.`;
            options = ['Agree', 'Disagree', 'Partially Agree'];
            break;

        case 37:
            question = `Question-${question_num}: Iraq, Indonesia, Pakistan have same uncertainties in marked areas?`;
            options = ['Agree', 'Disagree', 'Partially Agree'];
            const country_polys = [
                "-40,-37 3,-10 -88,110 -130,83", // indonesia
                "-160,270 -110,280 -124,405 -176,405", // iraq
                '571,-57 670,0 650,42 552,-13' // pakistan
            ];
            country_polys.forEach(poly => {
                svg.append('polygon')
                .attr('points', poly)
                .attr('stroke', '#00f')
                .attr('fill', 'none');
            });
            break;

        case 38:
            question = `Question-${question_num}: Which country exposes maximum variations of uncertainty?`;
            options = ['Vietnam', 'Japan', 'Georgia', 'Italy'];
            break;

        case submit_num:
            question = `Thank you for your participation. Please Submit to Finish.`;
            break;
    }

    const q_left = 350;
    const svg_g = svg.append('g');
    if (question) {

        svg_g
        .append("text")
        .attr("x", x-q_left)
        .attr("y", y+700)
        .text(question)
        .attr("font-size", question_num === submit_num ? 50 : 45)
        .attr('fill', 'black');

        if (Array.isArray(options)) {
            options.forEach((value, indx) => {
                const w = 360;
                svg_g
                .append("foreignObject")
                .attr("x", x + indx*w - q_left + 80)
                .attr("y", y + 735)
                .attr("font-size", 45)
                .attr("width", w)
                .attr("height", 55)
                .html(function(d) {
                    const checked = answers[question_num] && answers[question_num] === value ? 'checked' : '';
                    return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk' ${checked}>
                            <label for="${value}"  class='ag-dis-lbl'>${value}</label>`;
                })
                .on('mousedown', function (ev) {
                    const chks = d3.selectAll('.ag-dis-chk').nodes();
                    chks.forEach(chk => {
                        if (chk !== ev.target) {
                            d3.select(chk).property("checked", false);;
                        }
                    });
                });
            });
        }
    }

    transition_question(svg_g, 2800);


    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+1300)
    .attr("font-size", 47)
    .attr("fill", (d) => {
        return question_num > 1 ? 'black' : 'gray';
    })
    .on('mousedown', function (ev) {
        if (question_num > 1) {
            show_question(--question_num);
        }
    });

    const text = question_num === submit_num ? 'Submit' : 'Next';
    svg
    .append("text")
    .text(text)
    .attr("x", x+680)
    .attr("y", y+1300)
    .attr("font-size", 47)
    .on('mousedown', function (ev) {
        if (ev.which !== 1) {
            return;
        }
        if (question_num === submit_num) {
            d3.selectAll('.left-chart-container .inner-container').remove();
            d3.select('.left-chart-container')
                .append('div')
                .attr('class', 'save-container')
                .append('text')
                .attr('class', 'save-msg')
                .text('Your response has been saved. Please contact md313724@dal.ca for any query.');
           
                
        } else {
            let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
            chkboxes.forEach(chk => {
                const el = d3.select(chk);
                const is_checked = el.property('checked');
                if (is_checked) {
                    answers[question_num] = el.property('id');
                }
            });

            if (answers[question_num] || empty_pass) {
                show_question(++question_num);
            } else {
                svg
                .append("text")
                .text('Please select an option.')
                .attr("x", x-q_left)
                .attr("y", y + 850)
                .attr("font-size", 30)
                .attr("fill", 'red');
            }
        }
    });
    
    
}

function show_impact_chart_questions() {
    d3.select('.impact-question-g').remove();

    const svg = d3.select('.rate-svg')
        .append('g')
        .attr('class', 'impact-question-g');
    
    let question, options;

    svg
    .append("text")
    .attr("x", 15)
    .attr("y", 10)
    .text('Impact Chart')
    .attr('class', 'impact-chart-title');

    svg
    .append('rect')
    .attr('x', 82)
    .attr('y', 39)
    .attr('width', 8)
    .attr('height', 7)
    .attr('stroke', '#ec7af1')
    .attr("stroke-width", 0.4)
    .attr("fill", "none");

    svg
    .append('line')
    .style("stroke", "#ec7af1")
    .style("stroke-width", 0.4)
    .attr("x1", 90)
    .attr("y1", 23)
    .attr("x2", 88)
    .attr("y2", 39);

    svg
    .append('text')
    .attr("x", 85)
    .attr("y", 22)
    .attr("fill", "#ec7af1")
    .attr('class', 'perc-hint')
    .text("5% uncertainty");


    svg
    .append('rect')
    .attr('x', 148)
    .attr('y', 44)
    .attr('width', 8)
    .attr('height', 7)
    .attr('stroke', '#ec7af1')
    .attr("stroke-width", 0.4)
    .attr("fill", "none");

    svg
    .append('line')
    .style("stroke", "#ec7af1")
    .style("stroke-width", 0.4)
    .attr("x1", 155)
    .attr("y1", 23)
    .attr("x2", 154)
    .attr("y2", 44);

    svg
    .append('text')
    .attr("x", 145)
    .attr("y", 22)
    .attr("fill", "#ec7af1")
    .attr('class', 'perc-hint')
    .text("100% uncertainty");

    switch (question_num) {

        case 33:
        question = `Question-${question_num}: This uncertainty representation clearly make sense?`;
        options = ['Yes', 'No', 'Partially'];
        break;

        case 34:
        question = `Question-${question_num}: What is the uncertainty of the red marked cell?`;
        options = ['68%', '76%', '84%', '92%'];

        svg
        .append('rect')
        .attr('x', 88)
        .attr('y', 84)
        .attr('width', 8)
        .attr('height', 7)
        .attr('stroke', 'red')
        .attr("stroke-width", 0.6)
        .attr("fill", "none");
        
        break;

        case 35:
        question = `Question-${question_num}: Which cell has maximum uncertainty in the marked area [left-right]?`;
        options = ['First', 'Second', 'Third', 'Fourth'];
        
        svg
        .append('rect')
        .attr('x', 197)
        .attr('y', 79)
        .attr('width', 30)
        .attr('height', 7)
        .attr('stroke', 'red')
        .attr("stroke-width", 0.6)
        .attr("fill", "none");
        break;

    }


    let x = 15, y = 117;
    const svg_g = svg.append('g');

    svg_g
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .text(question)
    .attr("font-size", 18);

    options.forEach((value, indx) => {
        const w = 50;
        svg_g
        .append("foreignObject")
        .attr("x", x + indx*w)
        .attr("y", y-2)
        .attr("width", w)
        .attr("height", 18)
        .attr("font-size", 9)
        .html(function(d) {
            const checked = answers[question_num] && answers[question_num] === value ? 'checked' : '';
            return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk' ${checked}>
                    <label for="${value}"  class='ag-dis-lbl'>${value}</label>`;
        })
        .on('mousedown', function (ev) {
            const chks = d3.selectAll('.ag-dis-chk').nodes();
            chks.forEach(chk => {
                if (chk !== ev.target) {
                    d3.select(chk).property("checked", false);;
                }
            });
        });
    });

    transition_question(svg_g, -800);

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+45)
    .attr("font-size", 20)
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
    .attr("x", x+80)
    .attr("y", y+45)
    .attr("font-size", 20)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = el.property('id');
            }
        });

        if (answers[question_num] || empty_pass) {
            show_question(++question_num);
        } else {
            svg
            .append("text")
            .text('Please Select a Country.')
            .attr("x", x)
            .attr("y", y + 70)
            .attr("font-size", 13)
            .attr("fill", 'red');
        }
    });

}

function show_usage_chart_questions() {
    const svg = d3.select('.rate-svg')
        .append('g')
        .attr('class', 'usage-questions');
    
    let question, options;

    switch (question_num) {
        case 30:
        question = `Question-${question_num}: What is the maximum uncertainty country/column throught the days?`;
        options = ['USA', 'IRQ', 'CZE', 'CAN'];

        const rect_starts = [58, 702, 757, 787];
        rect_starts.forEach((rect_x) => {
            svg
            .append('rect')
            .attr('x', rect_x)
            .attr('y', 48)
            .attr('width', 26)
            .attr('height', 20)
            .attr('stroke', 'red')
            .attr("stroke-width", 1)
            .attr("fill", "none");
        });
        
        break;

        case 31:
        question = `Question-${question_num}: Which cell has maximum uncertainty in the marked area [left-right]?`;
        options = ['First', 'Second', 'Fourth', 'Fifth'];
        
        svg
        .append('rect')
        .attr('x', 671)
        .attr('y', 225)
        .attr('width', 142)
        .attr('height', 15)
        .attr('stroke', 'red')
        .attr("stroke-width", 1)
        .attr("fill", "none");
        break;

        case 32:
        question = `Question-${question_num}: Which cell has minimum uncertainty in the marked area [top-down]?`;
        options = ['First', 'Second', 'Third', 'Fourth'];
        
        svg
        .append('rect')
        .attr('x', 671)
        .attr('y', 165)
        .attr('width', 32)
        .attr('height', 51)
        .attr('stroke', 'red')
        .attr("stroke-width", 1)
        .attr("fill", "none");
        break;
    }

    svg
    .append('line')
    .style("stroke", "#ec7af1")
    .style("stroke-width", 0.4)
    .attr("x1", 200)
    .attr("y1", 38)
    .attr("x2", 185)
    .attr("y2", 75);

    svg
    .append('text')
    .attr("x", 185)
    .attr("y", 35)
    .attr("fill", "#ec7af1")
    .attr("font-size", 11)
    .text("2% uncertainty");

    svg
    .append('line')
    .style("stroke", "#ec7af1")
    .style("stroke-width", 0.4)
    .attr("x1", 565)
    .attr("y1", 48)
    .attr("x2", 549)
    .attr("y2", 75);

    svg
    .append('text')
    .attr("x", 525)
    .attr("y", 45)
    .attr("fill", "#ec7af1")
    .attr("font-size", 11)
    .text("96% uncertainty");


    let x = 30, y = 390;
    const svg_g = svg.append('g');

    svg
    .append("text")
    .attr("x", x)
    .attr("y", 35)
    .text('Usage Chart')
    .attr("font-size", 15);

    svg_g
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .text(question)
    .attr("font-size", 17);

    options.forEach((value, indx) => {
        const w = 140;
        svg_g
        .append("foreignObject")
        .attr("x", x + indx*w + 20)
        .attr("y", y+16)
        .attr("width", w)
        .attr("height", 25)
        .attr("font-size", 17)
        .html(function(d) {
            const checked = answers[question_num] && answers[question_num] === value ? 'checked' : '';
            return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk' ${checked}>
                    <label for="${value}"  class='ag-dis-lbl'>${value}</label>`;
        })
        .on('mousedown', function (ev) {
            const chks = d3.selectAll('.ag-dis-chk').nodes();
            chks.forEach(chk => {
                if (chk !== ev.target) {
                    d3.select(chk).property("checked", false);;
                }
            });
        });
    })

    transition_question(svg_g, -800);

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+80)
    .attr("font-size", 18)
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
    .attr("x", x+220)
    .attr("y", y+80)
    .attr("font-size", 18)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = el.property('id');
            }
        });

        if (answers[question_num] || empty_pass) {
            show_question(++question_num);
        } else {
            svg
            .append("text")
            .text('Please Select a Country.')
            .attr("x", x)
            .attr("y", y + 70)
            .attr("font-size", 13)
            .attr("fill", 'red');
        }
    });

}

function show_horizon_chart_questions() {
    d3.selectAll('.horizon-questions').remove();

    const svg = d3.select('.rate-svg')
        .append('g')
        .attr('class', 'horizon-questions');

    svg
    .append("text")
    .attr("x", 20)
    .attr("y", 25)
    .text('Horizon Chart')
    .attr("font-size", 17);
    
    let rect_x, rect_y, rect_w, rect_h, question, options;

    switch (question_num) {
        case 27:
        rect_x = 558;
        rect_y = 60;
        rect_w = 17;
        rect_h = 55;
        question = `Question-${question_num}: India has higher uncertainty than United States for the marked area.`;
        options = ['Agree', 'Disagree', 'Partially Agree'];
        break;

        case 28:
        rect_x = 453;
        rect_y = 115;
        rect_w = 17;
        rect_h = 93;
        question = `Question-${question_num}: Which country has maximum uncertainty in the marked area?`;
        options = ['Brazil', 'United Kingdom', 'Russia', 'Africa'];
        break;

        case 29:
        rect_x = 463;
        rect_y = 206;
        rect_w = 105;
        rect_h = 97;
        question = `Question-${question_num}: Select the stable uncertainty country from the marked area`;
        options = ['France', 'Turkey', 'Iran', 'Argentina'];
        break;
    }

    svg
    .append('rect')
    .attr('x', rect_x)
    .attr('y', rect_y)
    .attr('width', rect_w)
    .attr('height', rect_h)
    .attr('stroke', 'green')
    .attr("stroke-width", 1)
    .attr("fill", "none");

    let x = 30, y = 390;

    const svg_g = svg.append('g');

    svg_g
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("font-size", 17)
    .text(question)
    ;

    options.forEach((value, indx) => {
        const w = 140;
        svg_g
        .append("foreignObject")
        .attr("x", x + indx*w + 20)
        .attr("y", y+16)
        .attr("width", w)
        .attr("height", 25)
        .attr("font-size", 17)
        .html(function(d) {
            const checked = answers[question_num] && answers[question_num] === value ? 'checked' : '';
            return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk' ${checked}>
                    <label for="${value}"  class='ag-dis-lbl'>${value}</label>`;
        })
        .on('mousedown', function (ev) {
            const chks = d3.selectAll('.ag-dis-chk').nodes();
            chks.forEach(chk => {
                if (chk !== ev.target) {
                    d3.select(chk).property("checked", false);;
                }
            });
        });
    });

    transition_question(svg_g, -800);

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+90)
    .attr("font-size", 17)
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
    .attr("x", x+220)
    .attr("y", y+90)
    .attr("font-size", 17)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = el.property('id');
            }
        });

        if (answers[question_num] || empty_pass) {
            show_question(++question_num);
        } else {
            svg
            .append("text")
            .text('Please Select a Country.')
            .attr("x", x)
            .attr("y", y + 55)
            .attr("font-size", 13)
            .attr("fill", 'red');
        }
    });

}

function add_drill_models_questions() {
    d3.select('.left-chart-container').selectAll('svg, .inner-container').remove();

    const chart_svgs = d3.select('.drill-models-container').selectAll('svg').nodes();
    chart_svgs.forEach((svg, indx) => {
        svg = d3.select(svg);
        if (indx === 0) {
            const hints = [
                {x: 19, y: 15, text: 5},
                {x: 59, y: 15, text: 7},
                {x: 79, y: 15, text: 8},
                {x: 134, y: 15, text: 9},
                {x: 159, y: 15, text: 4},
                {x: 184, y: 15, text: 6},
                {x: 250, y: 15, text: 3},
                {x: 284.5, y: 15, text: 2},
                {x: 404, y: 15, text: 1},
            ];
            hints.forEach(hint => {
                svg.append('text')
                .attr("x", hint.x)
                .attr("y", hint.y - 5)
                .attr('fill', 'blue')
                .attr("font-size", 10)
                .text(hint.text);

                svg
                .append('rect')
                .attr('x', hint.x)
                .attr('y', hint.y)
                .attr('width', 8)
                .attr('height', 105)
                .attr('stroke', 'blue')
                .attr("stroke-width", 1)
                .attr("fill", "none");
            });
            
        } else {
            svg
            .append('rect')
            .attr('x', 240)
            .attr('y', 5)
            .attr('width', 6.5)
            .attr('height', 125)
            .attr('stroke', 'blue')
            .attr("stroke-width", 1)
            .attr("fill", "none");
        }
    });

    const svg = d3.select('.left-chart-container')
        .append('svg')
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('class', 'drill-questions');

    let x = 30, y = 50;
    svg
    .append("text")
    .text('Model predictions for ' + drill_country)
    .attr("x", x)
    .attr("y", y)
    .attr("font-size", 22);

    const texts = [
        'Hints:',
        'Uncertainty is', 
        '* Proportional to the color brightness',
        '* Inversely proportional to the size of the bubbles.',
        '* Independent on column height.'
    ];
    texts.forEach((text, indx) => {
        svg
        .append("text")
        .text(text)
        .attr("x", x)
        .attr("y", y + 25*(indx+1))
        .attr("font-size", 18);
    });

    y += 90;

    let model_name, options;
    switch (question_num) {
        case 24:
        model_name = 'cnn';
        options = [4, 5, 6, 7];
        break;

        case 25:
        model_name = 'lstm';
        options = [0, 1, 2, 3];
        break;

        case 26:
        model_name = 'arima';
        options = [6, 7, 8, 9];
        break;
    }

    const svg_g = svg.append('g');

    const uc_model = model_name.toUpperCase();
    svg_g
    .append("text")
    .attr("x", x)
    .attr("y", y + 235)
    .text(`Question-${question_num}: What is the uncertainty for marked column of '${uc_model}'?`)
    .attr("font-size", 22);
    
    svg_g
    .append("text")
    .attr("x", x)
    .attr("y", y+282)
    .attr("width", 150)
    .attr("height", 5)
    .attr("font-size", 22)
    .text('Answer: ');

    options.forEach((value, indx) => {
        const w = 115;
        svg_g
        .append("foreignObject")
        .attr("x", x + indx*w + 110)
        .attr("y", y+258)
        .attr("width", w)
        .attr("height", 35)
        .attr("font-size", 22)
        .html(function(d) {
            const checked = answers[question_num] && answers[question_num] === value ? 'checked' : '';
            return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk' ${checked}>
                    <label for="${value}"  class='ag-dis-lbl'>${value}</label>`;
        })
        .on('mousedown', function (ev) {
            const chks = d3.selectAll('.ag-dis-chk').nodes();
            chks.forEach(chk => {
                if (chk !== ev.target) {
                    d3.select(chk).property("checked", false);;
                }
            });
        });
    });

    transition_question(svg_g, -800);

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+580)
    .attr("font-size", 24)
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
    .attr("x", x+220)
    .attr("y", y+580)
    .attr("font-size", 24)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = Number(el.property('id'));
            }
        });
        
        if (answers[question_num] || empty_pass) {
            question_num += 1;
            show_question(question_num);
        } else {
            svg
            .append("text")
            .text('Please select an option.')
            .attr("x", x)
            .attr("y", y + 470)
            .attr("font-size", 15)
            .attr("fill", 'red');
        }
    });
}

function show_vsup_questions() {
    const mlp_data = forecast_data["new_cases"]["Canada"]["mlp"];
    const ranges = mlp_data.ranges;
    const preds = mlp_data['y_pred'];
    const cell_width = 56;
    const num_of_days = 10;
    let data = ranges.map((range, indx) => {
        const uncertainty = (range[1] - range[0]) * 3.25/100;
        const pred = preds[indx]*5/100;
        const num_cases = preds[indx];
        let day_of_count = parseInt((indx)/num_of_days);
        const rec = {pred, num_cases, uncertainty, day_of_count};
        return rec;
    });
    
    d3.select('.vsup-svg').remove();
    const svg = d3.select('.left-chart-container')
        .append("svg")
        .attr("width", 900)
        .attr("height", 900)
        .attr('class', 'vsup-svg');

    var vDom = d3.extent(data.map(function(d) { return d.pred; }));
    var uDom = d3.extent(data.map(function(d) { return d.uncertainty; }));

    var quantization = vsup.quantization().branching(2).layers(4).valueDomain(vDom).uncertaintyDomain(uDom);
    var scale = vsup.scale().quantize(quantization).range(d3.interpolateViridis);

    var w = 560;
    var h = 500;

    var x = d3.scaleBand().range([0, w]).domain(data.map(function(d) { return d.num_cases; }));
    var y = d3.scaleBand().range([0, h]).domain(data.map(function(d) { return d.day_of_count; }));

    // special scales for axes
    // var xAxis = d3.scalePoint().range([0, w]).domain([0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    var xAxis = d3.scaleLinear().range([0, w]).domain(d3.extent(data.map(function(d) { return d.num_cases; })));
    const y_domain = [];
    for (let k=1; k<=num_of_days; k++) {
        y_domain.push(k*2);
    }
    var yAxis = d3.scaleBand().range([0, h]).domain(y_domain);

    var heatmap = svg
        .attr("width", w + 940)
        .attr("height", h + 250).append("g")
        .attr("transform", "translate(30,50)");
    
    heatmap.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            const row = i%num_of_days;
            return row*cell_width;
        })
        .attr("y", function(d) { return y(d.day_of_count); })
        .attr("width", cell_width)
        .attr("height", y.bandwidth())
        .attr("title", JSON.stringify)
        .attr("fill", function(d) { return scale(d.pred, d.uncertainty); });

    // axes
    heatmap.append("g")
        .attr("transform", "translate(0," + h + ")")
        .call(d3.axisBottom(xAxis));

    heatmap.append("text")
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .attr("transform", "translate(" + (w / 2) + ", " + (h + 40) + ")")
        .text("Predicted New Cases")

    heatmap.append("g")
        .attr("transform", "translate(" + w + ", 0)")
        .call(d3.axisRight(yAxis));

    heatmap.append("text")
        .style("text-anchor", "middle")
        .style("font-size", 13)
        .attr("transform", "translate(" + (w + 40) + ", " + (h / 2) + ")rotate(90)")
        .text("Days (Each row 10 days)");

    // legend
    var legend = vsup.legend.arcmapLegend();

    legend
        .scale(scale)
        .size(160)
        .x(w + 140)
        .y(60)
        .vtitle("Prediction")
        .utitle("Uncertainty");

    svg.append("g").call(legend);
    d3.select('.legend').attr("transform", "translate(700 130)")


    // Question sections
    x = 30;
    y = 30;

    svg
    .append("text")
    .text('VSUP Palette')
    .attr("x", x)
    .attr("y", y)
    .attr("font-size", 22);

    svg
    .append("text")
    .text('Legend')
    .attr("x", x + 710)
    .attr("y", y + 20)
    .attr("font-size", 18);

    const texts = [
        'Hints:',
        '* Legend is the uncertainty lookup source'
    ];
    texts.forEach((text, indx) => {
        svg
        .append("text")
        .text(text)
        .attr("x", x+1000)
        .attr("y", y + 25*(indx+1))
        .attr("font-size", 18);
    });

    let options, rect_x, rect_y;
    switch (question_num) {
        case 21:
        options = [25, 31, 36, 42];
        rect_x = 141;
        rect_y = 99;
        break;

        case 22:
        options = [6, 11, 16, 21];
        rect_x = 477;
        rect_y = 322;
        break;

        case 23:
        options = [92, 81, 76, 87];
        rect_x = 421;
        rect_y = 398;
        break;
    }

    svg
        .append('rect')
        .attr('x', rect_x)
        .attr('y', rect_y)
        .attr('width', 58)
        .attr('height', 27)
        .attr('stroke', 'red')
        .attr("stroke-width", 3)
        .attr("fill", "none");

    const svg_g = svg.append('g');

    svg_g
    .append("text")
    .attr("x", x + 700)
    .attr("y", y + 400)
    .text(`Question-${question_num}: What is the uncertainty of the red marked cell?`)
    .attr("font-size", 22);
    
    svg_g
    .append("text")
    .attr("x", x + 700)
    .attr("y", y + 450)
    .attr("width", 150)
    .attr("height", 5)
    .attr("font-size", 22)
    .text('Answer: ');

    options.forEach((value, indx) => {
        const w = 115;
        svg_g
        .append("foreignObject")
        .attr("x", x + 700 + indx*w + 110)
        .attr("y", y + 423)
        .attr("width", w)
        .attr("height", 35)
        .attr("font-size", 22)
        .html(function(d) {
            const checked = answers[question_num] && answers[question_num] === value ? 'checked' : '';
            return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk' ${checked}>
                    <label for="${value}"  class='ag-dis-lbl'>${value}</label>`;
        })
        .on('mousedown', function (ev) {
            const chks = d3.selectAll('.ag-dis-chk').nodes();
            chks.forEach(chk => {
                if (chk !== ev.target) {
                    d3.select(chk).property("checked", false);;
                }
            });
        });
    });

    transition_question(svg_g, 3000);

    svg
    .append("text")
    .text('Back')
    .attr("x", x+800)
    .attr("y", y+700)
    .attr("font-size", 24)
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
    .attr("x", x+1350)
    .attr("y", y+700)
    .attr("font-size", 24)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = Number(el.property('id'));
            }
        });
        
        if (answers[question_num] || empty_pass) {
            question_num += 1;
            show_question(question_num);
        } else {
            svg
            .append("text")
            .text('Please select an option.')
            .attr("x", x)
            .attr("y", y + 470)
            .attr("font-size", 15)
            .attr("fill", 'red');
        }
    });

}

function show_circle_questions(svg) {
    svg.select('.circle-questions').remove();

    svg = svg
        .append('g')
        .attr('class', 'circle-questions');

    svg
    .append("text")
    .text("'" + sel_quest_category + "' perceptual examples:")
    .attr("y", 50)
    .attr("x", -350)
    .attr("font-size", 25);

    const svg_g = svg.append('g');

    svg_g
    .append("text")
    .attr("x", -350)
    .attr("y", 350)
    .text('Question-' + question_num + ': Estimate the uncertainty for the following circle in the range 10% to 100%')
    .attr("font-size", 25);

    let x = -150, y = 550;
    svg_g
    .append("text")
    .attr("x", x)
    .attr("y", y + 10)
    .attr("width", 150)
    .attr("height", 25)
    .attr("font-size", 20)
    .text('Answer: ');


    const options = get_perc_options(cur_quest_perc);

    options.forEach((value, indx) => {
        const w = 150;
        svg_g
        .append("foreignObject")
        .attr("x", x + indx*w + 80)
        .attr("y", y - 7)
        .attr("width", w)
        .attr("height", 25)
        .attr("font-size", 10)
        .html(function(d) {
            const checked = answers[question_num] && answers[question_num] === value ? 'checked' : '';
            return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk' ${checked}>
                    <label for="${value}"  class='ag-dis-lbl'>${value}%</label>`;
        })
        .on('mousedown', function (ev) {
            const chks = d3.selectAll('.ag-dis-chk').nodes();
            chks.forEach(chk => {
                if (chk !== ev.target) {
                    d3.select(chk).property("checked", false);;
                }
            });
        });
    });

    transition_question(svg_g, -800);

    svg
    .append("text")
    .text('Back')
    .attr("x", x+50)
    .attr("y", y + 165)
    .attr("font-size", 25)
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
    .attr("x", x + 350)
    .attr("y", y + 165)
    .attr("font-size", 25)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = Number(el.property('id'));
            }
        });

        if (answers[question_num] || empty_pass) {
            show_question(++question_num);
        } else {
            svg
            .append("text")
            .text('Please select an option.')
            .attr("x", x)
            .attr("y", y + 40)
            .attr("font-size", 13)
            .attr("fill", 'red');
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function get_perc_options(quest_perc) {
    const factors = [-1, 1, -1];
    const numbers = [];
    factors.forEach((fact, indx) => {
        let change = (5 * fact * (indx+1));
        let num = quest_perc + change;
        if (num === 0) {
            num = quest_perc * 3;
        }
        numbers.push(num);
    });
    
    const loc = getRandomInt(0, 3);
    numbers.splice(loc, 0, quest_perc);
    
    // console.log(loc, quest_perc, numbers)
    return numbers;
}