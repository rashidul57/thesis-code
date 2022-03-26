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
const time_totals = {};

let studyResults = [];
let timeResults = [];
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
    const time_results = [];
    console.log(answers.email)
    modules.forEach(prop => {
      let correctCount = 0;

      for (let indx in answers[prop]) {

        if (answers[prop][indx] && ['nasa-tlx', 'sus', 'time'].indexOf(indx) === -1) {
          correctCount++;
        }
      }

      correct_totals[prop] = (correct_totals[prop] || 0) + correctCount;
      time_totals[prop] = (time_totals[prop] || 0) + (answers[prop]['time'] || 0);
      count_result.push(correctCount);
      time_results.push((answers[prop]['time'] || 0));

      console.log(prop, correctCount)

      // nasa-tlx data
      const nasaRow = [prop];
      for (let indx in answers[prop]['nasa-tlx']) {
        nasaRow.push(answers[prop]['nasa-tlx'][indx]);
      }
      nasaTlxResults.push(nasaRow)

      // sus data
      const susRow = [prop];
      for (let indx in answers[prop]['sus']) {
        susRow.push(answers[prop]['sus'][indx]);
      }
      susResults.push(susRow);
    })
    studyResults.push(count_result)
    timeResults.push(time_results);
});


let result = [];
modules.forEach(prop => {
  const avg = correct_totals[prop]/files.length;
  result.push(Number(avg.toFixed(1)));
});
studyResults.push(result)

result = [];
modules.forEach(prop => {
  const avg = time_totals[prop]/files.length;
  result.push(Number(avg.toFixed(1)));
});
timeResults.push(result);


writeStudyResults(modules, studyResults, 'study');
writeStudyResults(modules, timeResults, 'time');

writeSusResults(susResults, 'sus.csv')
writeSusResults(nasaTlxResults, 'nasa-tlx.csv')


function writeSusResults(results, fileName) {
  const header = [
    {id: 'participant', title: 'Participant #'}, 
    {id: '0', title: 'Module'}
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
    const pid = parseInt(ind/4) + 1;
    const row = {participant: pid}
    result.forEach((value, indx) => {
      indx = typeof(indx) === 'string' ? 'module' : indx;
      row[indx] = value;
    })
    return row;
  })

  const avg = {}
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