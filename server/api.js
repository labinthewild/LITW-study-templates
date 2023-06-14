/**
 *
 *
 */

const https = require('node:https');
const fs = require('node:fs');
const config = require('./config');
let status = {
    token: null
}

const header_json = {
    'Content-Type': 'application/json'
  };


const auth_data = `client_id=${config.auth_user}&client_secret=${config.auth_key}`;

const header_auth = {
    'accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': auth_data.length
  };


const get_options = {
  host: config.api_url,
  port: 443,
  path: '/some/path',
  method: 'GET',
//  key: fs.readFileSync(config.cert_key_file),
//  cert: fs.readFileSync(config.cert_file),
//  agent: false,
  headers: header_json
};

let initialize =  () => {
    if(status.token) {
        return true;
    } else {
        let call = JSON.parse(JSON.stringify(get_options));
        call.path = config.auth_endpoint;
        call.method = 'POST';
        call.headers = header_auth;

        postJSON(call, auth_data).then(
            (success_res) => {
                console.log(`AUTH SUCCESS: ${success_res}`);
                return true;
            },
            (failure_res) => {
                console.log(`AUTH FAILED: ${failure_res}`);
                return false;
            }
        );
    }
}

/**
 * Based on https://stackoverflow.com/a/9577651/539223
 * getJSON:  RESTful GET request returning JSON object(s)
 * @param options: http options object
 * @param onResult: callback to pass the HTTP_CODE and JSON_OBJ result back
 */

let getJSON = (options, onResult) => {
  let output = '';

  const req = https.request(options, (res) => {
    console.log(`${options.host} : ${res.statusCode}`);
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      output += chunk;
    });

    res.on('end', () => {
      let obj = JSON.parse(output);
      onResult(res.statusCode, obj);
    });
  });

  req.on('error', (err) => {
    onResult(500, {error: err.message});
  });
  req.end();
};

/**
 * Based on https://stackoverflow.com/a/67094088/539223
 * @param options
 * @param data
 * @returns {Promise<unknown>}
 */
let postJSON = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => {
        const resString = Buffer.concat(body).toString()
        resolve(resString)
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(data)
    req.end()
  })
}

module.exports.OPTIONS_GET = get_options;
module.exports.init = initialize;
module.exports.getJSON = getJSON;
