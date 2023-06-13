const env = process.env.NODE_ENV || 'development';

var config_temp = {
    default:{
        port: 7777,
        logging_level: 5,
        api_url: "localhost"
    },
    development: {
        logging_level: 10
    },
    production: {
        api_url: "not-localhost"
    }
};

var config = {
    ...config_temp.default,
    ...config_temp[env],
    env: env
}
module.exports = config;