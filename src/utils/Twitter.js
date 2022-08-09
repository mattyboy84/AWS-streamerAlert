const fetch = require('node-fetch');
var CryptoJS = require("crypto-js");
const twitterCreds = require('../../creds/twitter.json');

async function getOAuthSignature(url) {
    
    const oauth_consumer_key = twitterCreds.credentials.consumer_key;
    const oauth_consumer_secret = twitterCreds.credentials.consumer_secret;
    const oauth_token  = twitterCreds.credentials.access_token;
    const oauth_secret  = twitterCreds.credentials.token_secret;
    const oauth_signing_key = `${oauth_consumer_secret}&${oauth_secret}`;
    
    // create random oauth_nonce string
    const random_source = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let oauth_nonce = '';
    for (let i = 0; i < 32; i++) {
        oauth_nonce += random_source.charAt(Math.floor(Math.random() * random_source.length));
    }
    
    const oauth_parameter_string_object = {};
    oauth_parameter_string_object.oauth_consumer_key = oauth_consumer_key;
    oauth_parameter_string_object.oauth_token = oauth_token;
    const oauth_nonce_array = CryptoJS.enc.Utf8.parse(oauth_nonce);
    oauth_parameter_string_object.oauth_nonce = encodeURIComponent(CryptoJS.enc.Base64.stringify(oauth_nonce_array));
    oauth_parameter_string_object.oauth_signature_method = 'HMAC-SHA1';
    oauth_parameter_string_object.oauth_version = '1.0';
    oauth_parameter_string_object.oauth_timestamp = Math.round((new Date()).getTime() / 1000);
    
    // for Authorization request header (copy object)
    const oauth_authorization_header_object = Object.assign({}, oauth_parameter_string_object);
    
    // convert query string into object (+ encode)
    const url_query_string_object = {};
    
    const url_query_string_object_array = [];
    
    url_query_string_object_array.forEach(item => {
        url_query_string_object[item.key] = encodeURIComponent(item.value);
    });
    
    // merge query parameter
    Object.assign(oauth_parameter_string_object, url_query_string_object);
    
    // sort object by key
    const oauth_parameter_string_object_ordered = {};
    Object.keys(oauth_parameter_string_object).sort().forEach(function(key) {
        oauth_parameter_string_object_ordered[key] = oauth_parameter_string_object[key];
    });
    
    // generate parameter string
    const oauth_parameter_string = toArray(oauth_parameter_string_object_ordered).join('&');
    
    // replace dynamic variables
    let base_host = url;
    let regexp = /{{(.*?)}}/g;
    let result = null;
    while (result = regexp.exec(base_host)) {
        let value = env_variables[result[1]];
        base_host = base_host.replace(new RegExp(`{{${result[1]}}}`, 'g'), value);
    }
    
    // generate base string
    const oauth_base_string = `POST&${encodeURIComponent(base_host)}&${encodeURIComponent(oauth_parameter_string)}`;

    // generate signature
    const oauth_signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(oauth_base_string, oauth_signing_key));
    
    oauth_authorization_header_object.oauth_signature = encodeURIComponent(oauth_signature);
    
    // generate Authorization header string
    const oauth_authorization_header = toArray(oauth_authorization_header_object).join(', ');
    

    return `OAuth ${oauth_authorization_header}`;
}

async function postTweet(tweet) {
    const Authorization = await getOAuthSignature('https://api.twitter.com/2/tweets');
    //console.log(`auth: ${Authorization}`);
    const result = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
            Authorization,
            'Content-Type': `application/json`,
            Host: 'api.twitter.com',
        },
        body: JSON.stringify({
            text: tweet
        }),
    }
    )
    const resultBody = await result.json();
    console.log(resultBody);
    if (resultBody.ok === false) {
        throw new Error(JSON.stringify(resultBody));
    }
}

// postTweet({text: "hello"});

function toArray(object) {
    let array = [];
    Object.keys(object).forEach(key => {
        array.push(`${key}=${object[key]}`);
    });
    return array
}

module.exports = {
    postTweet,
}
