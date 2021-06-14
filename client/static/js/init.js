let whole_dataset, core_data, countries, sel_chart_type;
let sel_property = 'new_cases';


window.onload = init;



/**
 * Excecutes on page load(start of the application)
 */
async function init() {
     $.get("/get-forcasts", function(data, status){
        whole_dataset = JSON.parse(data);
        core_data = whole_dataset[sel_property];

        countries = Object.keys(core_data);
        load_control_data();

        draw_predicted_lines(core_data, undefined);

    });
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
        core_data = whole_dataset[sel_property];
        countries = Object.keys(core_data);
        refresh_container();
    });

    // chart type dropdown
    d3.select("#drp-chart-type option").remove();

    const chart_types = ['Line', 'Stream Graphs', 'Bubble Chart'];
    sel_chart_type = chart_types[0];
    d3.select("#drp-chart-type")
    .selectAll('chart-types')
    .data(chart_types)
    .enter()
    .append('option')
    .text((d) => { return d; })
    .attr("value", (d) => { return d; });

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
        d3.select(".chart-item").selectAll("svg").remove();
        const country = d3.select(this).property("value");
        draw_predicted_lines(core_data, country);
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
        d3.select(".chart-item").selectAll("svg").remove();
        const model = d3.select(this).property("value");
        if (sel_chart_type === "Stream Graphs") {
            draw_stream_graph(core_data, model, undefined, undefined);
        } else {
            draw_bubble_chart(core_data, model);
        }
    });

    d3.selectAll(".clear-fish-graph")
    .on("click", function(ev) {
        d3.selectAll(".country-stream").remove();
    });
    
}

function refresh_container() {
    d3.select(".chart-item").selectAll("svg").remove();
    switch (sel_chart_type) {
        case "Line":
        d3.selectAll(".countries-item").style("display", "inline-block");
        draw_predicted_lines(core_data, undefined);
        break;

        case "Stream Graphs":
        d3.selectAll(".models-item").style("display", "inline-block");
        draw_stream_graph(core_data, undefined);
        break;

        case 'Bubble Chart':
        d3.selectAll(".models-item, .clear-fish-graph").style("display", "inline-block");
        draw_bubble_chart(core_data)
        break;
    }
}

function hide_items() {
    d3.selectAll(".hideable-item").style("display", "none");
}

