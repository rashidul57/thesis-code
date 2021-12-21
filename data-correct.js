// 


const { count } = require('console');
const fs = require('fs');

let resp = fs.readFileSync('resp.json');
let resp_uzbek = fs.readFileSync('resp-uzbek.json');
let forecast_data = JSON.parse(JSON.parse(resp));
let uzbek_data = JSON.parse(JSON.parse(resp_uzbek));
// debugger
props = ['new_cases', 'new_deaths', 'new_tests', 'new_vaccinations']
props.forEach(prop => {
    console.log(prop);
    // for (let country in forecast_data[prop]) {
    //     // console.log(country)
    //     if (country === 'Low income') {
    //         // console.log(country)
    //         delete forecast_data[prop][country];
    //     }
    // }

    if (prop === 'new_tests') {
        country = 'Uzbekistan'
        delete forecast_data[prop][country];
    }
});

let data = JSON.stringify(JSON.stringify(forecast_data));
fs.writeFileSync('resp.json', data);