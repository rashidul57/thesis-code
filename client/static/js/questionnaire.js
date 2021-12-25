const answers = {};
const sel_questions = ['ca', 'ca-static', 'blur', 'noise'];
let sel_quest_circle_mode;
let question_num = 31, sel_country_num;


function show_question() {
    let ex_percents = [0, 25, 50, 75, 100];
    sel_model = models[0];

    let ques_percents;
    let modes;
    if (question_num >= 1 && question_num <= 5) {
        sel_quest_circle_mode = sel_questions[0];
    } else if (question_num >= 6 && question_num <= 10) {
        sel_quest_circle_mode = sel_questions[1];
    } else if (question_num >= 11 && question_num <= 15) {
        sel_quest_circle_mode = sel_questions[2];
    } else if (question_num >= 16 && question_num <= 20) {
        sel_quest_circle_mode = sel_questions[3];
    } else if (question_num >= 21 && question_num <= 24) {
        sel_quest_circle_mode = 'drill-models';
    } else if (question_num >= 25 && question_num <= 27) {
        sel_quest_circle_mode = 'horizon-chart';
    } else if (question_num >= 28 && question_num <= 30) {
        sel_quest_circle_mode = 'usage-chart';
    } else if (question_num >= 31 && question_num <= 33) {
        sel_quest_circle_mode = 'star-fish';
    } else {
        return;
    }

    if (sel_questions.indexOf(sel_quest_circle_mode) > -1) {
        switch (sel_quest_circle_mode) {
            case 'ca':
            modes = ['ca', 'ca', 'ca', 'ca', 'ca'];
            ques_percents = [72, 15, 45, 25, 87];
            break;
            
            case 'ca-static':
            modes = ['ca-static', 'ca-static', 'ca-static', 'ca-static', 'ca-static'];
            ques_percents = [25, 15, 72, 45, 87];
            break;
            
            case 'blur':
            modes = ['blur', 'blur', 'blur', 'blur', 'blur'];
            ques_percents = [87, 25, 45, 72, 15];
            break;
            
            case 'noise':
            modes = ['noise', 'noise', 'noise', 'noise', 'noise'];
            ques_percents = [45, 25, 72, 87, 15];
            break;
        }
        modes.forEach((mode, indx) => {
            ex_percents[indx] /= 10;
            draw_bubble_chart(prop_pred_data, {ex_indx: indx, question_circle_mode: mode, type: 'example', percents: ex_percents});
        });

        const ques_perc = [ques_percents[question_num-1]/10];
        draw_bubble_chart(prop_pred_data, {question_circle_mode: sel_quest_circle_mode, circle_for: 'question', percents: ques_perc});
    } else if (sel_quest_circle_mode === 'drill-models') {
        drill_country = 'Brazil';
        d3.select('.main-stream-chart').style('display', 'none');
        d3.select('.drill-models-container').style('display', 'block');
        color_or_texture = 'texture';
        control_mode = 'drill-models';
        country_stream_mode = country_stream_modes[0];
        sel_chart_type = chart_types[0];
        create_drill_container();
        add_drill_models_questions();
    } else if (sel_quest_circle_mode === 'horizon-chart') {
        color_or_texture = 'texture';
        sel_chart_type = chart_types[2];
        change_layout();
        draw_horizon_chart(prop_pred_data, color_or_texture);
        show_horizon_chart_questions();
    } else if (sel_quest_circle_mode === 'usage-chart') {
        d3.selectAll('.left-chart-container svg').remove();
        change_layout();
        draw_usage_chart();
        show_usage_chart_questions();
    } else if (sel_quest_circle_mode === 'star-fish') {
        d3.selectAll('.left-chart-container svg').remove();
        change_layout();
        draw_bubble_chart(prop_pred_data, {model: sel_model});
        country_stream_mode = 'Prediction';
        sel_chart_type = chart_types[0];
        drill_country = undefined;
        draw_stream_graph({pred_data: prop_pred_data, sel_country: 'Russia', mode: 'texture'});
        draw_stream_graph({pred_data: prop_pred_data, sel_country: 'Argentina', mode: 'texture', q_country_index: 1});
        // draw_stream_graph({pred_data: prop_pred_data, sel_country: 'Iraq', mode: 'texture'});
        // draw_stream_graph({pred_data: prop_pred_data, sel_country: 'Italy', mode: 'texture'});
        // draw_stream_graph({pred_data: prop_pred_data, sel_country: 'Brazil', mode: 'texture'});
        // draw_stream_graph({pred_data: prop_pred_data, sel_country: 'India', mode: 'texture'});
        // draw_stream_graph({pred_data: prop_pred_data, sel_country: 'United States', mode: 'texture'});
        // show_textures();
        // show_usage_chart_questions();
    }

}

function show_usage_chart_questions() {
    const svg = d3.select('.rate-svg');
    
    let question, options;

    switch (question_num) {
        case 28:
        question = `Question-${question_num}: What is the maximum uncertainty country/column throught the days?`;
        options = ['USA', 'IRQ', 'CZE', 'CAN'];

        const rect_starts = [58, 702, 757, 787];
        rect_starts.forEach((rect_x) => {
            svg
            .append('rect')
            .attr('x', rect_x)
            .attr('y', 18)
            .attr('width', 26)
            .attr('height', 20)
            .attr('stroke', 'red')
            .attr("stroke-width", 1)
            .attr("fill", "none");
        });
        
        break;

        case 29:
        question = `Question-${question_num}: Which cell has maximum uncertainty in the marked area [left-right]?`;
        options = ['First', 'Second', 'Fourth', 'Fifth'];
        
        svg
        .append('rect')
        .attr('x', 671)
        .attr('y', 195)
        .attr('width', 142)
        .attr('height', 15)
        .attr('stroke', 'red')
        .attr("stroke-width", 1)
        .attr("fill", "none");
        break;

        case 30:
        question = `Question-${question_num}: Which cell has minimum uncertainty in the marked area [top-down]?`;
        options = ['First', 'Second', 'Third', 'Fourth'];
        
        svg
        .append('rect')
        .attr('x', 671)
        .attr('y', 135)
        .attr('width', 32)
        .attr('height', 51)
        .attr('stroke', 'red')
        .attr("stroke-width", 1)
        .attr("fill", "none");
        break;
    }

    

    let x = 30, y = 360;

    svg
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .text(question)
    .attr("font-size", 15);

    options.forEach((value, indx) => {
        const w = 140;
        svg
        .append("foreignObject")
        .attr("x", x + indx*w + 20)
        .attr("y", y+16)
        .attr("width", w)
        .attr("height", 25)
        .attr("font-size", 15)
        .html(function(d) {
            return `<input type="checkbox" class='ag-dis-chk' id="${value}" name='ag-dis-chk'>
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

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+120)
    .attr("font-size", 15)
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
    .attr("y", y+120)
    .attr("font-size", 15)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = el.property('id');
            }
        });

        if (answers[question_num]) {
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
    
    let rect_x, rect_y, rect_w, rect_h, question, options;

    switch (question_num) {
        case 25:
        rect_x = 558;
        rect_y = 30;
        rect_w = 17;
        rect_h = 55;
        question = `Question-${question_num}: India has higher uncertainty than United States for the marked area.`;
        options = ['Agree', 'Disagree', 'Partially Agree'];
        break;

        case 26:
        rect_x = 453;
        rect_y = 85;
        rect_w = 17;
        rect_h = 93;
        question = `Question-${question_num}: Which country has maximum uncertainty in the marked area?`;
        options = ['Brazil', 'United Kingdom', 'Russia', 'Africa'];
        break;

        case 27:
        rect_x = 463;
        rect_y = 176;
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

    let x = 30, y = 360;

    svg
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .text(question)
    .attr("font-size", 15);

    options.forEach((value, indx) => {
        const w = 140;
        svg
        .append("foreignObject")
        .attr("x", x + indx*w + 20)
        .attr("y", y+16)
        .attr("width", w)
        .attr("height", 25)
        .attr("font-size", 15)
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

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+120)
    .attr("font-size", 15)
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
    .attr("y", y+120)
    .attr("font-size", 15)
    .on('mousedown', function (ev) {
        let chkboxes = d3.selectAll('.ag-dis-chk').nodes();
        chkboxes.forEach(chk => {
            const el = d3.select(chk);
            const is_checked = el.property('checked');
            if (is_checked) {
                answers[question_num] = el.property('id');
            }
        });

        if (answers[question_num]) {
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

function add_drill_models_questions() {
    d3.select('.left-chart-container').selectAll('svg, .inner-container').remove();

    const chart_svgs = d3.select('.drill-models-container').selectAll('svg').nodes();
    chart_svgs.forEach(svg => {
        d3.select(svg)
        .append('rect')
        .attr('x', 240)
        .attr('y', 5)
        .attr('width', 6.5)
        .attr('height', 125)
        .attr('stroke', 'blue')
        .attr("stroke-width", 1)
        .attr("fill", "none");
    });

    const svg = d3.select('.left-chart-container')
        .append('svg')
        .attr('height', '100%')
        .attr('width', '100%');

    let x = 30, y = 50;
    svg
    .append("text")
    .text('Predictive Model outcomes for ' + drill_country)
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
        .attr("font-size", 15);
    });
    

    y += 90;

    models.forEach((model, k) => {
        const model_name = model.toUpperCase();
        svg
        .append("text")
        .attr("x", x)
        .attr("y", y+100*(k+1))
        .text(`Question-${question_num+k}: What is the uncertainty for marked column of '${model_name}'?`)
        .attr("font-size", 18);
        
        svg
        .append("text")
        .attr("x", x)
        .attr("y", y+100*(k+1) + 35)
        .attr("width", 150)
        .attr("height", 25)
        .text('Answer: ');

        const value = answers[question_num+k] || '';
        svg
        .append("foreignObject")
        .attr("x", x+80)
        .attr("y", y+100*(k+1) + 18)
        .attr("width", 45)
        .attr("height", 25)
        .html(function(d) {
            return `<input type='text' class='txt-opinion' value="${value}"/>`;
        });

        svg
        .append("text")
        .attr("x", x+120)
        .attr("y", y+100*(k+1) + 35)
        .attr("width", 150)
        .attr("height", 25)
        .text('Range [0-9]')
        .attr("font-size", 13);
    });

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+560)
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
    .attr("x", x+220)
    .attr("y", y+560)
    .attr("font-size", 25)
    // .attr("fill", (d) => {
    //     return question_num < 5 ? 'black' : 'gray';
    // })
    .on('mousedown', function (ev) {
        let ans = d3.select('.txt-opinion').property("value");
        ans = Number(ans) || 11;
        if (ans >= 10) {
            answers[question_num] = ans;
            show_question(++question_num);
        } else {
            svg
            .append("text")
            .text('Please Enter a valid Number.')
            .attr("x", x)
            .attr("y", y + 30)
            .attr("font-size", 13)
            .attr("fill", 'red');
        }
    });


}

function add_question_n_labels(svg) {
    svg
    .append("text")
    .text('User perception examples in %:')
    .attr("y", 50)
    .attr("x", -350)
    .attr("font-size", 25);

    let x = 380, y = 425;
    svg
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("width", 150)
    .attr("height", 25)
    .text('Your Guess: ');

    const value = answers[question_num] || '';
    svg
    .append("foreignObject")
    .attr("x", x+100)
    .attr("y", y-18)
    .attr("width", 45)
    .attr("height", 25)
    .html(function(d) {
      return `<input type='text' class='txt-opinion' value="${value}"/>`;
    });

    svg
    .append("text")
    .attr("x", x+138)
    .attr("y", y)
    .attr("width", 80)
    .attr("height", 25)
    .text('%');

    svg
    .append("text")
    .attr("y", 350)
    .attr("x", -600)
    .transition()             
    .ease(d3.easeLinear)           
    .duration(500)
    .attr("x", -350)
    .text('Question-' + question_num + ': Estimate the uncertainty for the following circle in the range 10% to 100%')
    .attr("font-size", 25)
    ;

    svg
    .append("text")
    .text('Back')
    .attr("y", 550)
    .attr("x", 200)
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
    .attr("y", 550)
    .attr("x", 300)
    .attr("font-size", 25)
    // .attr("fill", (d) => {
    //     return question_num < 5 ? 'black' : 'gray';
    // })
    .on('mousedown', function (ev) {
        let ans = d3.select('.txt-opinion').property("value");
        ans = Number(ans) || 11;
        if (ans >= 10) {
            answers[question_num] = ans;
            show_question(++question_num);
        } else {
            svg
            .append("text")
            .text('Please Enter a valid Number.')
            .attr("x", x)
            .attr("y", y + 30)
            .attr("font-size", 13)
            .attr("fill", 'red');
        }
    });
}
