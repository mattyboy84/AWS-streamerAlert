const fetch = require('node-fetch');
var CryptoJS = require("crypto-js");
const twitchCreds = require('../../creds/twitch.json');

async function getUser(user) {
    const token = await getToken();
    //console.log(`auth: ${Authorization}`);
    const result = await fetch(`https://api.twitch.tv/helix/streams?user_login=${user}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Client-Id': twitchCreds.credentials.client_id
        },
    }
    )
    const resultBody = await result.json();
    return resultBody;
}

async function getToken() {
    const result = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${twitchCreds.credentials.client_id}&client_secret=${twitchCreds.credentials.client_secret}&grant_type=client_credentials`, {
        method: 'POST',
    })
    const resultBody = await result.json();
    return resultBody.access_token;
}

module.exports = {
    getUser,
}
