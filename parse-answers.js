//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'docs/survey/answers');
//passsing directoryPath and callback function
const files = fs.readdirSync(directoryPath).filter(file => file !== '.DS_Store' 
  && file !== 'sbrooks@cs.dal.ca.json')

const modules = ['ca-bubble', 'ca-grid', 'vsup-bubble', 'vsup-grid'];
const totals = {}

let studyResults = [];
let susResults = []
let nasaTlxResults = []
files.forEach((file, indx) => {
    const data = fs.readFileSync(directoryPath + '/' + file, 'utf8');
    const answers = JSON.parse(data);
    const result = [];
    modules.forEach(prop => {
      let correctCount = 0;
      for (let indx in answers[prop]) {
        if (answers[prop][indx]) {
          correctCount++;
        }
      }
      totals[prop] = (totals[prop] || 0) + correctCount;
      result.push(correctCount);
    })
    studyResults.push(result)

    // nasa-tlx data
    const nasaRow = []
    for (let prop in answers['nasa-tlx']) {
      nasaRow.push(answers['nasa-tlx'][prop])
    }
    nasaTlxResults.push(nasaRow)

    // sus data
    const susRow = []
    for (let prop in answers['sus']) {
      susRow.push(answers['sus'][prop])
    }
    susResults.push(susRow)
});

const result = [];
modules.forEach(prop => {
  const avg = totals[prop]/files.length;
  result.push(Number(avg.toFixed(1)));
});

studyResults.push(result)

writeStudyResults(modules, studyResults)
writeSusResults(susResults, 'sus.csv')
writeSusResults(nasaTlxResults, 'nasa-tlx.csv')
// console.log(susResults[0])


function writeSusResults(results, fileName) {
  const header = [{id: 'participant', title: 'Participant #'}]
  results[0].forEach((val, indx) => {
    header.push({id: indx, title: 'Q#' + (indx + 1)})
  })
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: './docs/survey/calc-results/' + fileName,
    header
  });

  const data = results.map((result, ind) => {
    const row = {participant: (ind+1)}
    result.forEach((value, indx) => {
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
    avg[prop] = Number((sum/data.length).toFixed(1))
  }
  avg['participant'] = 'Avg'
  // console.log(avg)
  data.push(avg)

  csvWriter
    .writeRecords(data)
    .then(()=> console.log('Results written'));
}

function writeStudyResults(modules, results) {
  const header = [{id: 'participant', title: 'Participant #'}]
  modules.forEach((prop) => {
    header.push({id: prop, title: prop})
  })
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
    path: './docs/survey/calc-results/study.csv',
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
    .then(()=> console.log('Study Results written'));
}