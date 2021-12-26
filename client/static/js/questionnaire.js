const answers = {};
const sel_questions = ['ca', 'ca-static', 'blur', 'noise'];
let sel_quest_circle_mode;
let question_num = 1, sel_country_num;
let empty_pass = true;


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
        question_num = 21;
        sel_quest_circle_mode = 'drill-models';
    } else if (question_num >= 25 && question_num <= 27) {
        sel_quest_circle_mode = 'horizon-chart';
    } else if (question_num >= 28 && question_num <= 30) {
        sel_quest_circle_mode = 'usage-chart';
    } else if (question_num >= 31 && question_num <= 34) {
        sel_quest_circle_mode = 'star-fish';
    } else {
        return;
    }

    if (sel_questions.indexOf(sel_quest_circle_mode) > -1) {
        d3.selectAll('.container-box').classed('whole-width', true);
        d3.selectAll('.left-chart-container svg').remove();
        d3.select('.drill-models-container').style('display', 'none');

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
        
        d3.selectAll('.container-box').classed('whole-width', false);

        create_drill_container();
        add_drill_models_questions();
    } else if (sel_quest_circle_mode === 'horizon-chart') {
        d3.select('.drill-models-container').style('display', 'none');
        color_or_texture = 'texture';
        sel_chart_type = chart_types[2];
        
        d3.selectAll('.container-box').classed('whole-width', true);

        draw_horizon_chart(prop_pred_data, color_or_texture);
        show_horizon_chart_questions();
    } else if (sel_quest_circle_mode === 'usage-chart') {
        sel_chart_type = chart_types[4];
        d3.selectAll('.left-chart-container .inner-container, .left-chart-container svg').remove();
        d3.selectAll('.container-box').classed('whole-width', true);
        draw_usage_chart();
        show_usage_chart_questions();
    } else if (sel_quest_circle_mode === 'star-fish') {
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
        

        if (question_num === 31) {
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
    d3.select('.question-section').remove();
    const svg = d3.select('.bubble-svg').append('g').attr('class', 'question-section');
    let question, options;

    svg
    .append('text')
    .attr('x', -330)
    .attr('y', -330)
    .attr('width', 100)
    .attr('height', 20)
    .text('fill', 'red')
    .text('Star Fish Layout')
    .attr("font-size", 35);

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
    
    if ([32, 33].indexOf(question_num) > -1) {
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
            .attr("y", y + 40*(indx+1))
            .attr("font-size", 30);
        });
    }

    switch (question_num) {
        case 31:
            question = `Question-${question_num}: The layout is easy representation of multiple country Uncertainties.`;
            options = ['Agree', 'Disagree', 'Partially Agree'];
            break;

        case 32:
            question = `Question-${question_num}: Uncertainties for Iraq, Indonesia and Pakistan are same for marked area?`;
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

        case 33:
            question = `Question-${question_num}: Which country exposes maximum variation of uncertainty?`;
            options = ['Vietnam', 'Japan', 'Georgia', 'Italy'];
            break;

        case 34:
            question = `Thank you for your participation. Please Submit to Finish.`;
            break;
    }

    const q_left = 150;
    if (question) {
        svg
        .append("text")
        .attr("x", x-q_left)
        .attr("y", y+700)
        .text(question)
        .attr("font-size", question_num === 34 ? 50 : 35)
        .attr('fill', 'black');

        if (Array.isArray(options)) {
            options.forEach((value, indx) => {
                const w = 240;
                svg
                .append("foreignObject")
                .attr("x", x + indx*w + 20 - q_left)
                .attr("y", y + 725)
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

    svg
    .append("text")
    .text('Back')
    .attr("x", x)
    .attr("y", y+1300)
    .attr("font-size", 40)
    .attr("fill", (d) => {
        return question_num > 1 ? 'black' : 'gray';
    })
    .on('mousedown', function (ev) {
        if (question_num > 1) {
            show_question(--question_num);
        }
    });

    const text = question_num === 34 ? 'Submit' : 'Next';
    svg
    .append("text")
    .text(text)
    .attr("x", x+680)
    .attr("y", y+1300)
    .attr("font-size", 40)
    .on('mousedown', function (ev) {
        if (ev.which !== 1) {
            return;
        }
        if (question_num === 34) {
            alert('Your response saved.');
            document.body.remove();
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
            .attr('y', 48)
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
        .attr('y', 225)
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
        .attr('y', 165)
        .attr('width', 32)
        .attr('height', 51)
        .attr('stroke', 'red')
        .attr("stroke-width", 1)
        .attr("fill", "none");
        break;
    }


    let x = 30, y = 390;

    svg
    .append("text")
    .attr("x", x)
    .attr("y", 35)
    .text('Usage Chart')
    .attr("font-size", 15);

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
    .attr("y", y+80)
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
    .attr("y", y+80)
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
    .attr("font-size", 15);
    
    let rect_x, rect_y, rect_w, rect_h, question, options;

    switch (question_num) {
        case 25:
        rect_x = 558;
        rect_y = 60;
        rect_w = 17;
        rect_h = 55;
        question = `Question-${question_num}: India has higher uncertainty than United States for the marked area.`;
        options = ['Agree', 'Disagree', 'Partially Agree'];
        break;

        case 26:
        rect_x = 453;
        rect_y = 115;
        rect_w = 17;
        rect_h = 93;
        question = `Question-${question_num}: Which country has maximum uncertainty in the marked area?`;
        options = ['Brazil', 'United Kingdom', 'Russia', 'Africa'];
        break;

        case 27:
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
    .attr("y", y+90)
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
    .attr("y", y+90)
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
    .attr("y", y+580)
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
    .attr("y", y+580)
    .attr("font-size", 25)
    // .attr("fill", (d) => {
    //     return question_num < 5 ? 'black' : 'gray';
    // })
    .on('mousedown', function (ev) {
        let ans = d3.select('.txt-opinion').property("value");
        ans = Number(ans) || 11;
        if (ans >= 10 || empty_pass) {
            answers[question_num] = ans;
            question_num += 4;
            show_question(question_num);
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

function show_circle_questions(svg) {
    svg
    .append("text")
    .text('User perception examples in %:')
    .attr("y", 50)
    .attr("x", -350)
    .attr("font-size", 25);

    let x = 380, y = 425;
    svg
    .append("text")
    .attr("x", x+20)
    .attr("y", y)
    .attr("width", 150)
    .attr("height", 25)
    .text('Answer: ');

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
    .attr("x", 200)
    .attr("y", 700)
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
    .attr("x", 500)
    .attr("y", 700)
    .attr("font-size", 25)
    // .attr("fill", (d) => {
    //     return question_num < 5 ? 'black' : 'gray';
    // })
    .on('mousedown', function (ev) {
        let ans = d3.select('.txt-opinion').property("value");
        ans = Number(ans);
        if (ans >= 10 || empty_pass) {
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
