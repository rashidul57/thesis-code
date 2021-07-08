let forecast_data, prop_pred_data, countries, sel_chart_type, all_covid_data, country_stream_mode;
let sel_property = 'new_cases';
let control_mode = 'wing-stream';


window.onload = init;



/**
 * Excecutes on page load(start of the application)
 */
async function init() {
    const forecasts = await $.get("/get-forcasts");
    forecast_data = JSON.parse(forecasts);
    prop_pred_data = forecast_data[sel_property];
    countries = Object.keys(prop_pred_data);

    let cov_data = await $.get("/get-covid-data");
    cov_data = JSON.parse(cov_data)
    const columns = cov_data.columns;
    const data_arr = cov_data.data
    const covid_data = [];
    data_arr.forEach(item => {
        const rec = {};
        for (let k = 0; k < columns.length; k++) {
            rec[columns[k]] = item[k]
        }
        covid_data.push(rec);
    });
    all_covid_data = _.groupBy(covid_data, 'location');

    load_control_data();
    

}

function load_control_data() {
    hide_items()

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

    // chart type dropdown
    d3.select("#drp-chart-type option").remove();

    const chart_types = ['Line', 'Stream Graphs', 'Bubble Chart'];
    sel_chart_type = chart_types[2];
    d3.select("#drp-chart-type")
    .selectAll('chart-types')
    .data(chart_types)
    .enter()
    .append('option')
    .text((d) => { return d; })
    .attr("value", (d) => { return d; })
    .property("selected", sel_chart_type);

    d3.selectAll("#drp-chart-type")
    .on("change", function(ev) {
        hide_items();

        sel_chart_type = d3.select(this).property("value");
        refresh_container();
    });

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

    d3.selectAll("#drp-models")
    .on("change", function(ev) {
        d3.select(".left-chart-container").selectAll("svg").remove();
        const model = d3.select(this).property("value");
        if (sel_chart_type === "Stream Graphs") {
            draw_stream_graph(prop_pred_data, model, 'left-chart-container', undefined, undefined, undefined);
        } else {
            draw_bubble_chart(prop_pred_data, model);
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
    d3.selectAll('.view-controls .control-item')
    .on("click", function(ev) {
        // remove active flag from all
        const controls = d3.selectAll('.view-controls .control-item').nodes();
        controls.forEach(el => {
            const cls = el.className.replace(/(active)/g, '').trim();
            d3.select(el).attr('class', cls);
        });

        const el = ev.target.className.indexOf('control-item') > -1 ? d3.select(ev.target) : d3.select(ev.target.parentElement);
        let cur_cls = el.attr('class').trim();
        control_mode = cur_cls.split(' ')[1].trim();
        cur_cls = cur_cls + ' active';
        el.attr('class', cur_cls);
    });

    // refresh chart by clearing selection
    d3.selectAll('.btn-go')
    .on("click", function(ev) {
        if (bubble_removed.length || global_streams.length) {
            refresh_container();
        }
    });

    // refresh chart by clearing selection
    d3.selectAll('.control-item .cross')
    .on("click", function(ev) {
        switch (control_mode) {
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

    // initial load
    refresh_container();
}

function refresh_container() {
    $('body').removeClass('min-size');
    d3.select(".left-chart-container").selectAll("svg").remove();
    switch (sel_chart_type) {
        case "Line":
        d3.selectAll(".countries-item").style("display", "inline-block");
        draw_predicted_lines(prop_pred_data, undefined);
        $('body').addClass('min-size');
        break;

        case "Stream Graphs":
        d3.selectAll(".models-item, .country-stream-type").style("display", "inline-block");
        draw_stream_graph(prop_pred_data, undefined, 'left-chart-container', undefined, undefined);
        break;

        case 'Bubble Chart':
        d3.selectAll(".models-item, .clear-fish-graph, .country-stream-type, .main-stream-chart").style("display", "inline-block");
        draw_bubble_chart(prop_pred_data);
        draw_stream_graph(prop_pred_data, undefined, 'main-stream-chart', undefined, undefined);
        break;
    }
}

function hide_items() {
    d3.selectAll(".hideable-item").style("display", "none");
}

