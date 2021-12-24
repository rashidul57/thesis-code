const answers = {};
const sel_questions = ['ca', 'ca-static', 'blur', 'noise'];
let sel_quest_circle_mode;
let question_num = 25, sel_country_num;


function show_question() {
    let ex_percents = [0, 25, 50, 75, 100];
    sel_model = models[0];
    drill_country = 'Brazil';

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
    } else if (question_num >= 25 && question_num <= 28) {
        sel_quest_circle_mode = 'horizon-chart';
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
    }

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
