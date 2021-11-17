let forecast_data, prop_pred_data, countries, sel_chart_type, all_covid_data, top_country_data, country_stream_mode;
let sel_property = 'new_cases';
let control_mode = 'wing-stream';
let stream_blur_on = false;
let sel_model;


window.onload = init;



/**
 * Excecutes on page load(start of the application)
 */
async function init() {

    const forecasts = await $.get("/get-forcasts");
    forecast_data = JSON.parse(forecasts);
    prop_pred_data = forecast_data[sel_property];
    countries = Object.keys(prop_pred_data);

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

    load_control_data();
    

}

function load_control_data() {
    hide_items()

    // Chart Types
    const chart_types = ['Alternatives', 'Bubble Chart', 'Parallel Coords', 'Impact Chart', 'Horizon Chart', 'Usage Chart'];
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

    const models = ['mlp', 'cnn', 'lstm'];
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
        const model = d3.select(this).property("value");
        if (sel_chart_type === "Stream Graphs") {
            draw_stream_graph(prop_pred_data, model, 'left-chart-container', undefined, undefined, undefined);
        } else if (sel_chart_type === "Bubble Chart") {
            draw_bubble_chart(prop_pred_data, model, true);
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
    const country_stream_modes = ['By Properties', 'Prediction'];
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
            draw_stream_graph(prop_pred_data, undefined, 'left-chart-container', undefined, undefined);
        } else {
            draw_stream_graph(prop_pred_data, undefined, 'main-stream-chart', undefined, undefined);
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

        if (control_mode === 'bubble-remove') {
            toggle_cross('.' + 'bubble-select' + ' .cross', 0);
            bubble_selected = [];
        } else if (control_mode === 'bubble-select') {
            toggle_cross('.' + 'bubble-remove' + ' .cross', 0);
            bubble_removed = [];
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
                toggle_cross('.' + control_mode + ' .cross', global_streams.length);
                break;
        }
        toggle_go();
        refresh_container();
    });

    // toggle apply-third-prop
    d3.selectAll('.apply-third-prop')
    .on("click", function(ev) {
        const len = d3.selectAll('.sec-path').nodes().length;
        if (len) {
            stream_blur_on = !stream_blur_on;
            const display = stream_blur_on ? 'inline-block' : 'none';
            d3.selectAll('.sec-path').style("display", display);
        } else {
            add_texture_layer(sel_property);
        }
        const base_path_display = stream_blur_on ? 'none' : 'inline-block';
        d3.selectAll('.main-stream-cell').style("display", base_path_display);
    });

    // toggle apply-toggle-texture
    d3.selectAll('.toggle-texture')
    .on("click", function(ev) {
        const elem = d3.select(this);
        let mode = elem.attr('mode');
        if (!mode || mode === 'color') {
            mode = 'texture';
            elem.html('Color Stream');
        } else {
            mode = 'color';
            elem.html('Texture Stream');
        }
        elem.attr('mode', mode);
        draw_stream_graph(prop_pred_data, undefined, 'main-stream-chart', undefined, undefined, ev, mode);
    });

    // d3.selectAll('.ca-options')
    // .on("change", function(ev) {
    //     d3.select(".left-chart-container").selectAll("svg").remove();
    //     aberration_mode = d3.select(this).property("value");
    //     draw_bubble_chart(prop_pred_data, undefined);
    // });

    // initial load
    refresh_container();
}

function refresh_container() {
    $('body').removeClass('min-size');
    d3.select(".left-chart-container").selectAll("svg").remove();
    change_layout();

    switch (sel_chart_type) {
        // case "Line":
        // d3.selectAll(".countries-item").style("display", "inline-block");
        // draw_predicted_lines(prop_pred_data, undefined);
        // $('body').addClass('min-size');
        // break;

        // case "Stream Graphs":
        // d3.selectAll(".models-item, .country-stream-type").style("display", "inline-block");
        // draw_stream_graph(prop_pred_data, undefined, 'left-chart-container', undefined, undefined);
        // break;

        case 'Alternatives':
        d3.selectAll(".ca-options").style("display", "inline-block");
        // const modes = ['ca', 'ca-static', 'blur', 'ca-blur', 'trans', 'noise'];
        // const modes = ['ca', 'ca-static', 'blur', 'noise'];
        const modes = ['ca', 'ca', 'ca', 'ca', 'ca'];
        // let percents = [10, 20, 30, 40, 50];
        // let percents = [60, 70, 80, 90, 100];
        let percents = [0, 25, 50, 75, 100];

        //For questions 
        // ca-static: 72, 15, 45, 25, 87
        // const modes = ['ca'];

        // ca-static: 25, 15, 72, 45, 87
        // const modes = ['ca-static'];

        // blur: 87, 25, 45, 72, 15
        // const modes = ['blur'];

        // noise: 45, 25, 72, 87, 15
        // const modes = ['noise'];
        
        // let percents = [15];

        modes.forEach((mode, indx) => {
            percents[indx] /= 10;
            draw_bubble_chart(prop_pred_data, undefined, mode, {indx, percents});
        });
        break;

        case 'Bubble Chart':
        d3.selectAll(".models-item, .clear-fish-graph, .country-stream-type, .main-stream-chart, .apply-third-prop, .toggle-texture, .right-items").style("display", "inline-block");
        draw_bubble_chart(prop_pred_data, undefined);
        draw_stream_graph(prop_pred_data, undefined, 'main-stream-chart', undefined, undefined);
        break;

        case 'Parallel Coords':
        d3.selectAll(".models-item").style("display", "inline-block");
        draw_parallel_coords();
        break;

        case 'Impact Chart':
        draw_impact_chart(prop_pred_data);
        break;

        case 'Horizon Chart':
        draw_horizon_chart(prop_pred_data);
        break;

        case 'Usage Chart':
        draw_usage_chart();
        break;

    }
}

function hide_items() {
    d3.selectAll(".hideable-item").style("display", "none");
}


function change_layout() {
    if (sel_chart_type === 'Bubble Chart') {
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
