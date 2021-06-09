let core_data, countries;


window.onload = init;



/**
 * Excecutes on page load(start of the application)
 */
async function init() {
     $.get("/get-forcasts", function(data, status){
        core_data = JSON.parse(data);

        countries = Object.keys(core_data);
        load_control_data();

        draw_predicted_lines(core_data, undefined);

    });
}

function load_control_data() {
    hide_items()

    // chart type dropdown
    d3.select("#drp-chart-type option").remove();

    const chart_types = ['Line', 'Stream Graphs'];
    d3.select("#drp-chart-type")
    .selectAll('chart-types')
    .data(chart_types)
    .enter()
    .append('option')
    .text((d) => { return d; })
    .attr("value", (d) => { return d; });

    d3.selectAll("#drp-chart-type")
    .on("change", function(ev) {
        d3.select(".chart-item").selectAll("svg").remove();

        hide_items();

        const chart_type = d3.select(this).property("value");
        switch (chart_type) {
            case "Line":
            d3.selectAll(".countries-item").style("display", "inline-block");
            draw_predicted_lines(core_data, undefined);
            break;

            case "Stream Graphs":
            d3.selectAll(".models-item").style("display", "inline-block");
            draw_stream_graph(core_data, undefined);
            break;
        }

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
        draw_stream_graph(core_data, model);
    });
    
}

function hide_items() {
    d3.selectAll(".hideable-item").style("display", "none");
}

