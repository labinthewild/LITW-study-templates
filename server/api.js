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
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer !!!ACCESSTOKEN!!!'
};

const auth_data = `client_id=${config.auth_user}&client_secret=${config.auth_key}`;

const header_auth = {
    'accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': auth_data.length
};


const default_options = {
    host: config.api_url,
    port: 443,
    path: '/some/path',
    method: 'GET',
//  key: fs.readFileSync(config.cert_key_file),
//  cert: fs.readFileSync(config.cert_file),
//  agent: false,
//    headers: header_json
};

let initialize = async () => {
    if(status.token) {
        return true;
    } else {
        let call = JSON.parse(JSON.stringify(default_options));
        call.path = config.auth_endpoint;
        call.method = 'POST';
        call.headers = header_auth;

        return await post(call, auth_data).then(
            (success_res) => {
                status.token = JSON.parse(success_res);
                console.log(`INIT AUTH SUCCESS: ${JSON.stringify(status)}`);
                return true;
            },
            (failure_res) => {
                console.log(`INIT AUTH FAILED: ${failure_res}`);
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

let post = (options, data) => {
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

/**
 * Makes a POST call to the specified endpoint and data using already existing access token.
 * Based on https://stackoverflow.com/a/67094088/539223
 * @param endpoint Specifies the POST endpoint starting with '/'.
 * @param json_data The JSON object to be POSTED.
 * @returns {Promise<unknown>}
 */
let postJSON = async (endpoint, json_data) => {
    if(!('access_token' in status.token)) {
        console.log(`CURRENT TOKEN: ${status}`);
        return new Error("API not initialized!");
    }

    let auth_options = JSON.parse(JSON.stringify(default_options));
    auth_options.path = endpoint.replace('{ID}', config.auth_user);
    auth_options.method = 'POST';
    auth_options.headers = JSON.parse(JSON.stringify(header_json));
    auth_options.headers.Authorization = `Bearer ${status.token.access_token}`;
    console.log(`POST config: ${JSON.stringify(auth_options)}`);
    let result = await post(auth_options, JSON.stringify(json_data)).then(
        (success_res) => {
            console.log(`POST SUCCESS: ${success_res}`);
            return true;
        },
        (fail_res) => {
            console.log(`POST FAILED: ${fail_res}`);
            return false;
        }
    )
    return result;
}

module.exports.BASIC_OPTIONS = default_options;
module.exports.init = initialize;
module.exports.getJSON = getJSON;
module.exports.postJSON = postJSON;
