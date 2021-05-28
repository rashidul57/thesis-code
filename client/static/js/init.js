window.onload = init;

/**
 * Excecutes on page load(start of the application)
 */
async function init() {
     $.get("/get-forcasts", function(data, status){
        data = JSON.parse(data)
        debugger
    });
}
