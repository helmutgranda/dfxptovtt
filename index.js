var chalk       = require('chalk');
var clear       = require('clear');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Spinner     = CLI.Spinner;
var _           = require('lodash');
var fs          = require('fs');
var cheerio = require('cheerio')
var status = '';
var $ = ''

clear();

console.log(
  chalk.yellow(
    figlet.textSync('DFXP->VTT', { horizontalLayout: 'full' })
  )
);


function getDFXPLocation(callback) {
    var questions = [
      {
        name: 'dfxp',
        type: 'input',
        message: 'Enter source DFXP file:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter the source of the DFXP file that needs to be converted';
          }
        }
      }

    ];
  
    inquirer.prompt(questions).then(callback);
}

getDFXPLocation(processingAnswers);

function processingAnswers(answers) {
    processDFXPFile(answers.dfxp);
}

function processDFXPFile(file) {

    if ( !fs.existsSync(file) ) {
        console.log(`file you provided does not exists, ${file} please check again`);
        getDFXPLocation(processingAnswers)
        return;
    }
        
    status = new Spinner('Parsing Data...');
    status.start();

    $ = cheerio.load( fs.readFileSync(file), {xmlMode: true} );
    $('div').map( processLang );

}

function processLang(i, item) {
    var lang = $(item).attr('xml:lang');
    var allCopy = $(item).children().map(processItem);
    var finalCopy = 'WEBVTT\n\n' + allCopy.get().join('\n') ;
    fs.writeFile('test_'+lang+'.txt', finalCopy, writeTextCallBack );
}

function writeTextCallBack(err) {
    if (err) throw err;
    status.stop();
    console.log('Files Saved');
}

function processItem(i, item) {
    var $item = $(item)
    var start = $item.attr('begin');
    var end = $item.attr('end');
    var copy = $item.text().trim();
    var fullcopy = start + ' --> ' + end + ' line:90%\n' + copy + '\n';
    return fullcopy;
}
