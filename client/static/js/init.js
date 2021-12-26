let forecast_data, prop_pred_data, countries, sel_chart_type, all_covid_data, top_country_data, country_stream_mode;
let sel_property = 'new_cases';
let control_mode = 'star-fish';
const models = ['mlp', 'cnn', 'lstm', 'arima'];
let sel_model;
let country_list_show = false;
let selected_countries = [];
let show_polygon = true;
let color_or_texture = 'color';
let mapped_countries = {};
let color_mappings = {};
let question_mode;
let drill_country;
const chart_types = ['Bubble Chart', 'Parallel Coords', 'Horizon Chart', 'Impact Chart', 'Usage Chart'];
const country_stream_modes = ['Prediction', 'By Properties'];

window.onload = init;



/**
 * Excecutes on page load(start of the application)
 */
async function init() {
    question_mode = location.href.indexOf('question') > -1 ? true : false;

    const forecasts = await $.get("/get-forecasts");
    forecast_data = JSON.parse(forecasts);

    const arima_forecasts = await $.get("/get-arima-forecasts");
    arima_data = JSON.parse(arima_forecasts);

    props = ['new_cases', 'new_deaths', 'new_tests', 'new_vaccinations']
    props.forEach(prop => {
        for (let country in forecast_data[prop]) {
            forecast_data[prop][country]['arima'] = arima_data[prop][country]['arima'];
        }
    });

    prop_pred_data = forecast_data[sel_property];
    countries = Object.keys(prop_pred_data);

    countries.forEach(country => {
        const code = prop_pred_data[country].code;
        mapped_countries[country] = code;
        mapped_countries[code] = country;
    });

    ['new_cases', 'new_deaths', 'new_tests', 'new_vaccinations'].forEach(prop => {
        countries.forEach(country => {
            ['mlp', 'cnn', 'lstm', 'arima'].forEach(model => {
                if (!forecast_data[prop][country]) {
                    return;
                }

                const model_data = forecast_data[prop][country][model];
                model_data['ranges'].forEach(item => {
                    [0, 1].forEach(indx => {
                        item[indx] = Math.abs(Number(item[indx])) || 0;
                    });
                });

                model_data['y_pred'].forEach((val, indx) => {
                    model_data['y_pred'][indx] = Math.abs(Number(val)) || 0;
                });
            });
        });
    });

    const excl_regions = ['World', 'Asia', 'European Union', 'Europe', 'South America', 'North America', 'High income', 'Upper middle income', 'Lower middle income'];
    let cov_data = await $.get("/get-covid-data");
    cov_data = JSON.parse(cov_data);
    const columns = cov_data.columns;

    const data_arr = cov_data.data.filter(rec => excl_regions.indexOf(rec[0]) === -1);
    const covid_data = [];
    data_arr.forEach(item => {
        const rec = {};
        for (let k = 0; k < columns.length; k++) {
            rec[columns[k]] = item[k];
        }
        covid_data.push(rec);
    });
    
    all_covid_data = _.groupBy(covid_data, 'location');

    if (question_mode) {
        show_question();
    } else {
        load_control_data();
        load_country_dropdown();
    }

}

function load_control_data() {
    hide_items()

    // Chart Types
    sel_chart_type = chart_types[0];
    d3.select("#drp-chart-types")
    .selectAll('chart-types')
    .data(chart_types)
    .enter()
    .append('option')
    .text((d) => { return d; })
    .attr("value", (d) => { return d; });

    d3.selectAll("#drp-chart-types")
    .on("change", function(ev) {
        hide_items();
        sel_chart_type = d3.select(this).property("value");
        refresh_container();
    });


     // Properties
     const props = ['new_cases', 'new_deaths'];
     d3.select("#drp-property")
     .selectAll('property-list')
     .data(props)
     .enter()
     .append('option')
     .text((d) => { return d; })
     .attr("value", (d) => { return d; });

     d3.selectAll("#drp-property")
    .on("change", function(ev) {
        sel_property = d3.select(this).property("value");
        prop_pred_data = forecast_data[sel_property];
        countries = Object.keys(prop_pred_data);
        refresh_container();
    });

    // // chart type dropdown
    // d3.select("#drp-chart-type option").remove();

    // const chart_types = ['Line', 'Stream Graphs', 'Bubble Chart'];
    // sel_chart_type = chart_types[2];
    // d3.select("#drp-chart-type")
    // .selectAll('chart-types')
    // .data(chart_types)
    // .enter()
    // .append('option')
    // .text((d) => { return d; })
    // .attr("value", (d) => { return d; })
    // .property("selected", sel_chart_type);

    // d3.selectAll("#drp-chart-type")
    // .on("change", function(ev) {
    //     hide_items();
    //     sel_chart_type = d3.select(this).property("value");
    //     refresh_container();
    // });

    // countries dropdown
    d3.select("#drp-countries option").remove();

    d3.select("#drp-countries")
    .selectAll('country-list')
    .data(countries)
    .enter()
    .append('option')
    .text((d) => { return d; })
    .attr("value", (d) => { return d; });

    d3.selectAll("#drp-countries")
    .on("change", function(ev) {
        d3.select(".left-chart-container").selectAll("svg").remove();
        const country = d3.select(this).property("value");
        draw_predicted_lines(prop_pred_data, country);
    });

    // Machine learning predictive models
    d3.select("#drp-models option").remove();

    d3.select("#drp-models")
    .selectAll('model-list')
    .data(models)
    .enter()
    .append('option')
    .text((d) => { return d; })
    .attr("value", (d) => { return d; });
    sel_model = models[0];

    d3.selectAll("#drp-models")
    .on("change", function(ev) {
        d3.select(".left-chart-container").selectAll("svg").remove();
        sel_model = d3.select(this).property("value");
        if (sel_chart_type === "Stream Graphs") {
            draw_stream_graph({pred_data: prop_pred_data, sel_model, container: 'left-chart-container'});
        } else if (sel_chart_type === "Bubble Chart") {
            draw_bubble_chart(prop_pred_data, {model: sel_model});
        } else if (sel_chart_type === "Parallel Coords") {
            draw_parallel_coords();
        }
    });

    d3.selectAll(".clear-fish-graph")
    .on("click", function(ev) {
        // d3.selectAll(".country-stream").remove();
        d3.selectAll(".country-stream-svg").remove();
    });

    // country stream-graph options
    
    country_stream_mode = country_stream_modes[0];
    d3.select("#drp-country-stream-type")
    .selectAll('model-list')
    .data(country_stream_modes)
    .enter()
    .append('option')
    .text((d) => { return d; })
    .attr("value", (d) => { return d; });
    
    d3.selectAll("#drp-country-stream-type")
    .on("change", function(ev) {
        country_stream_mode = d3.select(this).property("value");
        if (sel_chart_type === "Stream Graphs") {
            draw_stream_graph({pred_data: prop_pred_data, container: 'left-chart-container'});
        } else {
            set_color_mode();
            draw_stream_graph({pred_data: prop_pred_data, container: 'main-stream-chart'});
        }
    });

    // view control items
    d3.selectAll('.right-items .control-item')
    .on("click", function(ev) {
        // remove active flag from all
        const controls = d3.selectAll('.right-items .control-item').nodes();
        controls.forEach(el => {
            const cls = el.className.replace(/(active)/g, '').trim();
            d3.select(el).attr('class', cls);
        });

        const el = ev.target.className.indexOf('control-item') > -1 ? d3.select(ev.target) : d3.select(ev.target.parentElement);
        let cur_cls = el.attr('class').trim();
        control_mode = cur_cls.split(' ')[1].trim();
        cur_cls = cur_cls + ' active';
        el.attr('class', cur_cls);
        drill_country = undefined;

        if (control_mode === 'bubble-remove') {
            toggle_cross('.' + 'bubble-select' + ' .cross', 0);
            bubble_selected = [];
        } else if (control_mode === 'bubble-select') {
            toggle_cross('.' + 'bubble-remove' + ' .cross', 0);
            bubble_removed = [];
        } else if (control_mode === 'global-streams') {
            toggle_main_stream_container(true);
        } else if (control_mode === 'drill-models') {
            toggle_main_stream_container(false);
        }
    });

    // refresh chart by clearing selection
    d3.selectAll('.btn-go')
    .on("click", function(ev) {
        if (bubble_removed.length || bubble_selected.length || global_streams.length) {
            refresh_container();
        }
    });

    // refresh chart by clearing selection
    d3.selectAll('.control-item .cross')
    .on("click", function(ev) {
        switch (control_mode) {
            case 'bubble-select':
                bubble_selected = [];
                toggle_cross('.' + control_mode + ' .cross', bubble_selected.length);
                break;
            case 'bubble-remove':
                bubble_removed = [];
                toggle_cross('.' + control_mode + ' .cross', bubble_removed.length);
                break;
            case 'global-streams':
                global_streams = [];
                set_color_mode();
                toggle_cross('.' + control_mode + ' .cross', global_streams.length);
                break;
        }
        toggle_go();
        refresh_container();
    });

    // toggle apply-toggle-texture
    d3.selectAll('.toggle-texture')
    .on("click", function(ev) {
        const elem = d3.select(this);
        if (sel_chart_type === 'Bubble Chart') {
            if ((global_streams.length + country_streams.length) === 0 && !drill_country) {
                return alert('No country stream to show textures.');
            }
        }
        let mode = elem.attr('mode');
        if (!mode || mode === 'color') {
            mode = 'texture';
            elem.html('Color Stream');
        } else {
            mode = 'color';
            elem.html('Texture Stream');
        }
        color_or_texture = mode;
        elem.attr('mode', mode);
        if (sel_chart_type === 'Bubble Chart') {
            if (drill_country) {
                create_drill_container();
            } else {
                draw_stream_graph({pred_data: prop_pred_data, container: 'main-stream-chart', mode});
            }
        } else {
            draw_horizon_chart(prop_pred_data, color_or_texture);
        }
    });

    // const sel_questions = ['ca', 'ca-static', 'blur', 'noise'];
    // d3.select("#drp-question-options")
    // .selectAll('question-list')
    // .data(sel_questions)
    // .enter()
    // .append('option')
    // .text((d) => { return d; })
    // .attr("value", (d) => { return d; })
    // .property("selected", (d) => d===sel_quest_circle_mode);

    // d3.selectAll('#drp-question-options')
    // .on("change", function(ev) {
    //     sel_quest_circle_mode = d3.select(this).property("value");
    //     show_question(1);
    // });

    const num_of_countries = [
        {label: 'Top Five', value: 5},
        {label: 'Top Seven', value: 7},
        {label: 'Top Ten', value: 10},
        {label: 'Top Tweenty', value: 20},
        {label: 'All', value: 'all'}
    ];
    sel_country_num = num_of_countries[0].value;
    selected_countries = _.take(countries, sel_country_num);

    d3.select("#drp-num-country")
    .selectAll('num-countries')
    .data(num_of_countries)
    .enter()
    .append('option')
    .text((d) => { return d.label; })
    .attr("value", (d) => { return d.value; })
    .property("selected", (d) => d.value===sel_country_num);

    d3.selectAll('#drp-num-country')
    .on("change", function(ev) {
        sel_country_num = d3.select(this).property("value");
        refresh_container();
    });

    d3.selectAll('.select-by-name')
    .on("click", function(ev) {
        country_list_show = !country_list_show;

        d3.select('.country-list-menu').style("display", country_list_show ? "inline-block" : 'none');
    });

    // initial load
    refresh_container();
}

function toggle_main_stream_container(show_main_stream) {
    d3.select('.main-stream-chart').style('display', show_main_stream ? 'inline' : 'none');
    d3.select('.drill-models-container').style('display', show_main_stream ? 'none' : 'inline');
}

function set_color_mode() {
    d3.select('.toggle-texture').attr('mode', 'color').html('Texture Stream');
    color_or_texture = 'color';
}

function refresh_container() {
    $('body').removeClass('min-size');
    d3.select(".left-chart-container").selectAll(".inner-container, svg").remove();
    change_layout();

    switch (sel_chart_type) {
        // case "Line":
        // d3.selectAll(".countries-item").style("display", "inline-block");
        // draw_predicted_lines(prop_pred_data, undefined);
        // $('body').addClass('min-size');
        // break;

        // case "Stream Graphs":
        // d3.selectAll(".models-item, .country-stream-type").style("display", "inline-block");
        // break;

        // case 'Questionnaire':
        // d3.selectAll(".ca-options, .questions-item").style("display", "inline-block");
        // show_question(1);
        // break;

        case 'Bubble Chart':
        d3.selectAll(".models-item, .clear-fish-graph, .country-stream-type, .main-stream-chart, .apply-third-prop, .toggle-texture, .right-items").style("display", "inline-block");
        draw_bubble_chart(prop_pred_data, {model: sel_model});
        draw_stream_graph({pred_data: prop_pred_data, container: 'main-stream-chart'});
        break;

        case 'Parallel Coords':
        d3.selectAll(".models-item, .number-of-country, .country-select-by-name, .poly-show-hide").style("display", "inline-block");
        draw_parallel_coords();
        break;

        case 'Impact Chart':
        draw_impact_chart(prop_pred_data);
        break;

        case 'Horizon Chart':
        d3.selectAll(".toggle-texture").style("display", "inline-block");
        set_color_mode();
        draw_horizon_chart(prop_pred_data, color_or_texture);
        break;

        case 'Usage Chart':
        draw_usage_chart();
        break;

    }
}

function load_country_dropdown() {
    reload_country_list();

    d3.selectAll('.button-row input')
    .on("click", function(ev) {
        if (ev.target.defaultValue === "Apply") {
            sel_country_num = 0;
            refresh_container();
        }
        d3.select('.country-list-menu').style('display', 'none');
        country_list_show = false;
    });

    d3.select('#chk-show-hide-poly')
    .on("click", function(ev) {
        show_polygon = !show_polygon;
        show_hide_polygons();
    });

    
}

function reload_country_list() {
    let country_str_arr = [];
    const sorted_countries = _.sortBy(countries);
    sorted_countries.forEach(country => {
        if (selected_countries.indexOf(country) === -1) {
            country_str_arr.push(get_country_row(country, false));
        }
    });
    document.getElementsByClassName('list-body-unselected')[0].innerHTML = country_str_arr.join('');

    country_str_arr = [];
    selected_countries.forEach(country => {
        country_str_arr.push(get_country_row(country, true));
    });
    document.getElementsByClassName('list-body-selected')[0].innerHTML = country_str_arr.join('');

    d3.selectAll('.row-item input[type="checkbox"]')
    .on("click", function(ev) {
        const el = d3.select(this);
        const is_selected = el.property('checked');
        const sel_country = el.attr('id').replace('by-', '');
        const inside_selected = selected_countries.indexOf(sel_country) > -1;
        if (is_selected && !inside_selected) {
            selected_countries.push(sel_country);
        } else {
            selected_countries = selected_countries.filter(country => sel_country !== country);
        }
        selected_countries = _.sortBy(selected_countries);
        reload_country_list();
    });
}

function get_country_row(country, selected) {
    return `<div class='row-item'>
    <input type="checkbox" id="by-${country}" ${selected}>
    <label for="by-${country}">${country}</label>
    </div>`;
}

function hide_items() {
    d3.selectAll(".hideable-item").style("display", "none");
}


function change_layout() {
    if (sel_chart_type === 'Bubble Chart' && !question_mode) {
        d3.selectAll('.container-box').classed('whole-width', false);
    } else {
        d3.selectAll('.left-chart-container svg.rate-svg').remove();
        d3.selectAll('.container-box').classed('whole-width', true);
        d3.selectAll('.left-chart-container').classed('rate-svg-container', true);
    }
}

let clip = 2;
let path = 1;
const DOM = {
    uid: function (str) {
        let ret;
        const url = location.href;
        if (str === 'path') {
            ret = {
                id: `O-path-` + clip,
                href: url + '#O-' + str + '-' + clip
            };
            clip += 2;
        } else {
            ret = {
                id: `O-clip-` + path,
                href: url + '#O-' + str + '-' + path
            };
            path += 2;
        }

        return ret;
    }
}
