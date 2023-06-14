const env = process.env.NODE_ENV || 'development';

var config_temp = {
    default:{
        port: 7777,
        logging_level: 5,
        api_url: null
    },
    development: {
        logging_level: 10
    },
    production: {
        api_url: "api.labinthewild.org",
        auth_endpoint: "/auth/study",
        studies_endpoint: "/studies/",
        study_endpoint: "/studies/{ID}/",
        data_endpoint: "/studies/{ID}/data/",
        geoip_endpoint: "/services/geoip/",
        auth_user: "",
        auth_key: "",
    }
};

var config = {
    ...config_temp.default,
    ...config_temp[env],
    env: env
}

module.exports = config;