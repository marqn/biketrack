const fs = require('fs');
const en = JSON.parse(fs.readFileSync('c:/dev/bikeapp/messages/en.json', 'utf8'));
const pl = JSON.parse(fs.readFileSync('c:/dev/bikeapp/messages/pl.json', 'utf8'));

let issues = 0;

function compareKeys(obj1, obj2, path) {
  path = path || 'root';
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();
  const missing = keys1.filter(function(k) { return keys2.indexOf(k) === -1; });
  const extra = keys2.filter(function(k) { return keys1.indexOf(k) === -1; });
  if (missing.length) {
    console.log('MISSING in PL at [' + path + ']: ' + missing.join(', '));
    issues += missing.length;
  }
  if (extra.length) {
    console.log('EXTRA in PL at [' + path + ']: ' + extra.join(', '));
    issues += extra.length;
  }
  for (var i = 0; i < keys1.length; i++) {
    var k = keys1[i];
    var enType = typeof obj1[k];
    var plType = typeof obj2[k];
    if (enType === 'object' && obj1[k] !== null) {
      if (plType === 'object' && obj2[k] !== null) {
        compareKeys(obj1[k], obj2[k], path + '.' + k);
      } else if (obj2[k] !== undefined) {
        console.log('TYPE MISMATCH at [' + path + '.' + k + ']: EN=' + enType + ' PL=' + plType);
        issues++;
      }
    }
  }
}

compareKeys(en, pl);

if (issues === 0) {
  console.log('SUCCESS: PL JSON structure matches EN JSON exactly.');
} else {
  console.log('FOUND ' + issues + ' issue(s).');
}
