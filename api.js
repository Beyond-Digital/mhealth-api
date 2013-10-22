var restify = require('restify'),
    server = restify.createServer(),
    csv = require('csv'),
    fs = require('fs'),
    columns = [],
    patients = {};

function slugify(text){
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}

function rowToDict(row){
    var dict = {};
    for (var i=0, l=row.length; i<l; i++) {
        dict[columns[i]] = row[i];
    }
    return dict;
}

function listPatients(req, res, next){
    var list = new Array;
    for (patient in patients)
        list.push({
            'id': patient,
            'url': 'http://' + req.headers.host + '/patients/' + patient
        })
    res.json(list);
    return next();
}

function patientByID(req, res, next){
  res.charSet('utf-8');
  res.json(rowToDict(patients[req.params.id]));
  return next();
}

server.get('/patients', listPatients);
server.get('/patients/:id', patientByID);

csv()
.from.stream(fs.createReadStream(__dirname+'/data.csv'))
.on('record', function(row, index){
    if (!index)
        columns = row.map(slugify);
    else
        patients[index] = row;
})
.on('end', function(count){
    console.log('Loaded records: '+count);
    server.listen(8080, function() {
        console.log('%s listening at %s', server.name, server.url);
    });
})
.on('error', function(error){
    console.log(error.message);
});
