const config = require('./config');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('../src/'));

app.get('/service/geoip/', (req, res) => {
  let client_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if(config.env == 'production') {
    //TODO: Call API.LITW!
  } else {
    console.log(`GEOIP CALLED for ${client_ip}`);
    res.sendStatus(200);
  }
});

app.post('/service/data/', (req, res) => {
  let study_data = req.body;
  if(config.env == 'production') {
    //TODO: Call API.LITW!
  } else {
    console.log(`POST DATA: ${JSON.stringify(study_data)}`);
    res.sendStatus(200);
  }
});

app.listen(config.port, () => {
  console.log(`LabintheWild studies server listening on port ${config.port} - ENV: ${config.env}`);
})