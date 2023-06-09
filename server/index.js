const express = require('express')
const app = express()
const port = 7777

app.use(express.json());
app.use(express.static('../src/'));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/service/geoip/', (req, res) => {
  let client_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`GEOIP CALLED for ${client_ip}`);
  res.sendStatus(200);
});

app.post('/service/data/', (req, res) => {
  let study_data = req.body;
  //TODO: Why isn't this printing the
  console.log(`POST DATA: ${JSON.stringify(study_data)}`);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})