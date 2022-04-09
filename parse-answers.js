//requiring path and fs modules
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

//joining path of directory 
const directoryPath = path.join(__dirname, 'docs/survey/answers');
// const directoryPath = path.join(__dirname, './answers');
//passsing directoryPath and callback function
let files = fs.readdirSync(directoryPath).filter(file => file !== '.DS_Store' 
  && file !== 'sbrooks@cs.dal.ca.json' && file !== 'rashid@gmail.com.json')

const modules = ['ca-bubble', 'ca-grid', 'vsup-bubble', 'vsup-grid'];
const correct_totals_all = {};
const correct_totals_sv = {};
const correct_totals_svsa = {};
const correct_totals_svaa = {};
const correct_totals_dv = {};
const svo_time_totals = {};
const sva_time_totals = {};
const dv_time_totals = {};

let studyResultsAll = [];
let studyResultsSv = [];
let studyResultsSvsa = [];
let studyResultsSvaa = [];
let studyResultsDv = [];
let svoTimeResults = [];
let svaTimeResults = [];
let dvTimeResults = [];
let susResults = []
let nasaTlxResults = []
let allAnswers = files.map((file, indx) => {
    const data = fs.readFileSync(directoryPath + '/' + file, 'utf8');
    const answers = JSON.parse(data);
    return answers;
})
const cat_totals = {ca: 0, vsup: 0};

allAnswers = _.orderBy(allAnswers, ['participant-num'], ['asc']);

console.log(modules.join(', '))

allAnswers.forEach((answers, p_indx) => {
    const count_result_all = [];
    const count_result_sv = [];
    const count_result_svsa = [];
    const count_result_svaa = [];
    const count_result_dv = [];
    const svo_time_results = [];
    const sva_time_results = [];
    const dv_time_results = [];

    
    modules.forEach(prop => {
      let correctCountAll = 0;
      let correctCountSv = 0;
      let correctCountSvsa = 0;
      let correctCountSvaa = 0;
      let correctCountDv = 0;

      for (let indx in answers[prop]) {
        if (['single-var-one-time', 'single-var-all-time', 'double-var-time'].indexOf(indx) === -1) {
          const q_num = parseInt(indx-1)%8 + 1;
          if (answers[prop][indx] && answers[prop][indx].status) {
            correctCountAll++;
            if (q_num <= 5) {
              correctCountSv++;
              if (q_num <= 3) {
                correctCountSvsa++
              } else {
                correctCountSvaa++;
              }
            } else {
              correctCountDv++;
            }
          }
        }
      }

      correct_totals_all[prop] = (correct_totals_all[prop] || 0) + correctCountAll;
      correct_totals_sv[prop] = (correct_totals_sv[prop] || 0) + correctCountSv;
      correct_totals_svsa[prop] = (correct_totals_svsa[prop] || 0) + correctCountSvsa;
      correct_totals_svaa[prop] = (correct_totals_svaa[prop] || 0) + correctCountSvaa;
      correct_totals_dv[prop] = (correct_totals_dv[prop] || 0) + correctCountDv;
      svo_time_totals[prop] = (svo_time_totals[prop] || 0) + (answers[prop]['single-var-one-time'] || 0);
      sva_time_totals[prop] = (sva_time_totals[prop] || 0) + (answers[prop]['single-var-all-time'] || 0);
      dv_time_totals[prop] = (dv_time_totals[prop] || 0) + (answers[prop]['double-var-time'] || 0);
      count_result_all.push(correctCountAll);
      count_result_sv.push(correctCountSv);
      count_result_svsa.push(correctCountSvsa);
      count_result_svaa.push(correctCountSvaa);
      count_result_dv.push(correctCountDv);
      svo_time_results.push((answers[prop]['single-var-one-time'] || 0));
      sva_time_results.push((answers[prop]['single-var-all-time'] || 0));
      dv_time_results.push((answers[prop]['double-var-time'] || 0));

    });

    const total_time = _.sum(svo_time_results) + _.sum(sva_time_results) + _.sum(dv_time_results);

    console.log(answers['participant-num'], answers.email, count_result_all.join(',  '), 'time: ' + total_time);


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
    
    studyResultsAll.push(count_result_all);
    studyResultsSv.push(count_result_sv);
    studyResultsSvsa.push(count_result_svsa);
    studyResultsSvaa.push(count_result_svaa);
    studyResultsDv.push(count_result_dv);
    svoTimeResults.push(svo_time_results);
    svaTimeResults.push(sva_time_results);
    dvTimeResults.push(dv_time_results);
});

const avg = [];
modules.forEach(prop => {
  avg.push((correct_totals_all[prop]/allAnswers.length).toFixed(1));
  if (prop.indexOf('ca') > -1) {
    cat_totals.ca += Number((correct_totals_all[prop]/allAnswers.length).toFixed(1));
  } else {
    cat_totals.vsup += Number((correct_totals_all[prop]/allAnswers.length).toFixed(1));
  }
});
console.log('avg', avg.join(', '))
console.log('Grand:', cat_totals.ca/2, cat_totals.vsup/2);
console.log(allAnswers.length);


let result_all = [];
let result_sv = [];
let result_svsa = [];
let result_svaa = [];
let result_dv = [];
modules.forEach(prop => {
  let avg = correct_totals_all[prop]/files.length;
  result_all.push(Number(avg.toFixed(1)));

  avg = correct_totals_sv[prop]/files.length;
  result_sv.push(Number(avg.toFixed(1)));

  avg = correct_totals_svsa[prop]/files.length;
  result_svsa.push(Number(avg.toFixed(1)));

  avg = correct_totals_svaa[prop]/files.length;
  result_svaa.push(Number(avg.toFixed(1)));

  avg = correct_totals_dv[prop]/files.length;
  result_dv.push(Number(avg.toFixed(1)));
});
studyResultsAll.push(result_all);
studyResultsSv.push(result_sv);
studyResultsSvsa.push(result_svsa);
studyResultsSvaa.push(result_svaa);
studyResultsDv.push(result_dv);

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


writeStudyResults(modules, studyResultsAll, 'study-all');
writeStudyResults(modules, studyResultsSv, 'study-sv');
writeStudyResults(modules, studyResultsSvsa, 'study-svsa');
writeStudyResults(modules, studyResultsSvaa, 'study-svaa');
writeStudyResults(modules, studyResultsDv, 'study-dv');
const pairedResults = studyResultsAll.map(result => {
  const ca = (result[0] + result[1])/2;
  const vsup = (result[2] + result[3])/2;
  return [ca, vsup];
});
writeStudyResults(['ca', 'vsup'], pairedResults, 'study-ca-vsup');

writeTimeResults(modules, svoTimeResults, svaTimeResults, dvTimeResults, 'svo');
writeTimeResults(modules, svoTimeResults, svaTimeResults, dvTimeResults, 'sva');
writeTimeResults(modules, svoTimeResults, svaTimeResults, dvTimeResults, 'dv');
writeTimeResults(modules, svoTimeResults, svaTimeResults, dvTimeResults, 'total');

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

function writeTimeResults(modules, svoTimeResults, svaTimeResults, dvTimeResults, mode) {
  const fileName = 'time-' + mode;
  const header = [{id: 'participant', title: 'Participant #'}]
  modules.forEach((prop) => {
    switch (mode) {
      case 'svo':
      header.push({id: prop + '-svo', title: prop});
      break;
      case 'sva':
      header.push({id: prop + '-sva', title: prop})
      break;
      case 'dv':
      header.push({id: prop + '-dv', title: prop});
      break;
      case 'total':
      header.push({id: prop + '-total', title: prop});
      break;
    }
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
      switch (mode) {
        case 'svo':
        row[prop + '-svo'] = Number(svo_result[indx].toFixed(1));
        break;
        case 'sva':
        row[prop + '-sva'] = Number(sva_result[indx].toFixed(1));
        break;
        case 'dv':
        row[prop + '-dv'] = Number(dv_result[indx].toFixed(1));
        break;
        case 'total':
        row[prop + '-total'] = Number((svo_result[indx] + sva_result[indx] + dv_result[indx]).toFixed(1));
        break;
      }
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