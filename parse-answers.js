//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

//joining path of directory 
// const directoryPath = path.join(__dirname, 'docs/survey/answers');
const directoryPath = path.join(__dirname, './answers');
//passsing directoryPath and callback function
let files = fs.readdirSync(directoryPath).filter(file => file !== '.DS_Store' 
  && file !== 'sbrooks@cs.dal.ca.json')

const modules = ['ca-bubble', 'ca-grid', 'vsup-bubble', 'vsup-grid'];
const correct_totals = {};
const svo_time_totals = {};
const sva_time_totals = {};
const dv_time_totals = {};

let studyResults = [];
let svoTimeResults = [];
let svaTimeResults = [];
let dvTimeResults = [];
let susResults = []
let nasaTlxResults = []
let allAnswers = files.map((file, indx) => {
    const data = fs.readFileSync(directoryPath + '/' + file, 'utf8');
    const answers = JSON.parse(JSON.parse(data));
    return answers;
})

allAnswers = _.orderBy(allAnswers, ['participant-num'], ['asc']);
allAnswers.forEach((answers) => {
    const count_result = [];
    const svo_time_results = [];
    const sva_time_results = [];
    const dv_time_results = [];

    console.log(answers.email)
    modules.forEach(prop => {
      let correctCount = 0;

      for (let indx in answers[prop]) {

        if (answers[prop][indx] && answers[prop][indx].status && ['single-var-one-time', 'single-var-all-time', 'double-var-time'].indexOf(indx) === -1) {
          correctCount++;
        }
      }

      correct_totals[prop] = (correct_totals[prop] || 0) + correctCount;
      svo_time_totals[prop] = (svo_time_totals[prop] || 0) + (answers[prop]['single-var-one-time'] || 0);
      sva_time_totals[prop] = (sva_time_totals[prop] || 0) + (answers[prop]['single-var-all-time'] || 0);
      dv_time_totals[prop] = (dv_time_totals[prop] || 0) + (answers[prop]['double-var-time'] || 0);
      count_result.push(correctCount);
      svo_time_results.push((answers[prop]['single-var-one-time'] || 0));
      sva_time_results.push((answers[prop]['single-var-all-time'] || 0));
      dv_time_results.push((answers[prop]['double-var-time'] || 0));

    });

    ['ca', 'vsup'].forEach(prop => {
      // nasa-tlx data
      const nasaRow = [prop];
      for (let indx in answers['nasa-' + prop]) {
        nasaRow.push(answers['nasa-' + prop][indx]);
      }
      nasaTlxResults.push(nasaRow)

      // sus data
      const susRow = [prop];
      for (let indx in answers['sus-' + prop]) {
        susRow.push(answers['sus-' + prop][indx]);
      }
      susResults.push(susRow);
    })
    


    studyResults.push(count_result)
    svoTimeResults.push(svo_time_results);
    svaTimeResults.push(sva_time_results);
    dvTimeResults.push(dv_time_results);
});


let result = [];
modules.forEach(prop => {
  const avg = correct_totals[prop]/files.length;
  result.push(Number(avg.toFixed(1)));
});
studyResults.push(result)

// find single variable one time avg
result = [];
modules.forEach(prop => {
  const avg = svo_time_totals[prop]/files.length;
  result.push(Number(avg.toFixed(1)));
});
svoTimeResults.push(result);

// find single variable all time avg
result = [];
modules.forEach(prop => {
  const avg = sva_time_totals[prop]/files.length;
  result.push(Number(avg.toFixed(1)));
});
svaTimeResults.push(result);

// find second half time avg
result = [];
modules.forEach(prop => {
  const avg = dv_time_totals[prop]/files.length;
  result.push(Number(avg.toFixed(1)));
});
dvTimeResults.push(result);


writeStudyResults(modules, studyResults, 'study');
writeTimeResults(modules, svoTimeResults, svaTimeResults, dvTimeResults, 'time');

['ca', 'vsup'].forEach((prop) => {
  const sus_res = susResults.filter(row => row[0] === prop);
  writeSusNasaResults(sus_res, 'sus-' + prop + '.csv')

  const nasa_res = nasaTlxResults.filter(row => row[0] === prop);
  writeSusNasaResults(nasa_res, 'nasa-tlx-' + prop + '.csv')
});


function writeSusNasaResults(results, fileName) {
  const header = [
    {id: 'participant', title: 'Participant #'}
  ];

  results[0].forEach((val, indx) => {
    if (typeof(val) !== 'string') {
      header.push({id: indx, title: 'Q#' + (indx)});
    }
  })
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: './docs/survey/calc-results/' + fileName,
    header
  });

  const data = results.map((result, ind) => {
    const pid = ind + 1;
    const row = {participant: pid}
    result.forEach((value, indx) => {
      row[indx] = value;
    })
    return row;
  });

  const avg = {};
  for (let prop in data[0]) {
    let sum = 0;
    data.forEach(row => {
      sum += row[prop]
    })
    avg[prop] = Number((sum/data.length).toFixed(1)) || '';
  }
  avg['participant'] = 'Avg'
  data.push(avg)

  csvWriter
    .writeRecords(data)
    .then(()=> console.log('Results written'));
}

function writeTimeResults(modules, svoTimeResults, svaTimeResults, dvTimeResults, fileName) {
  const header = [{id: 'participant', title: 'Participant #'}]
  modules.forEach((prop) => {
    header.push({id: prop + '-svo', title: prop + 'SV One'})
    header.push({id: prop + '-sva', title: prop + 'SV All'})
    header.push({id: prop + '-sva', title: prop + 'DV'})
    header.push({id: prop + '-total', title: prop + 'Total'})
  })
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: `./docs/survey/calc-results/${fileName}.csv`,
    header
  });
  const data = []
  svoTimeResults.forEach((svo_result, ind) => {
    const row = {participant: (ind+1)}
    const sva_result = svaTimeResults[ind];
    const dv_result = dvTimeResults[ind];
    modules.forEach((prop, indx) => {
      row[prop + '-svo'] = Number(svo_result[indx].toFixed(1));
      row[prop + '-sva'] = Number(sva_result[indx].toFixed(1));
      row[prop + '-dv'] = Number(dv_result[indx].toFixed(1));
      row[prop + '-total'] = Number((svo_result[indx] + sva_result[indx] + dv_result[indx]).toFixed(1));
    })
    data.push(row);
  })

  csvWriter
    .writeRecords(data)
    .then(()=> console.log(fileName + ' results written'));
}

function writeStudyResults(modules, results, fileName) {
  const header = [{id: 'participant', title: 'Participant #'}]
  modules.forEach((prop) => {
    header.push({id: prop, title: prop})
  })
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: `./docs/survey/calc-results/${fileName}.csv`,
    header
  });
  const data = results.map((result,ind) => {
    const row = {participant: (ind+1)}
    modules.forEach((prop, indx) => {
      row[prop] = result[indx];
    })
    return row;
  })

  csvWriter
    .writeRecords(data)
    .then(()=> console.log(fileName + ' results written'));
}