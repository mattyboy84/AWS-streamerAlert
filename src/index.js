const dynamo = require('./utils/Dynamo');

const { TABLE_NAME } = require('./utils/config');
const { getUser } = require('./utils/Twitch');
const { postTweet } = require('./utils/Twitter');

async function outgoingFunction(event) {
    console.log(event);
    console.log('Table:' + TABLE_NAME);

    //const DBresult = await dynamo.query(TABLE_NAME, 'streamerName', 'connor');
    const DBresult = await dynamo.scan(TABLE_NAME);
    console.log(JSON.stringify(DBresult));

    const name = DBresult.streamerName;
    const onlineBefore = DBresult.online;

    const twitchData = await getUser(name);
    console.log(twitchData);
    const onlineAfter = (twitchData?.data[0]?.type === 'live') ? (true) : (false);
    console.log(onlineAfter);

    if (onlineBefore === onlineAfter) {
        console.log('no change detected - exiting');
        return;
    }
    //
    //change detected
    console.log('change detected - posting a tweet');
    if (onlineAfter) {
        //change online
        await postTweet(`Streamer: ${name} has come online`)
    }
    //
    if (!onlineAfter) {
        //change offline
        await postTweet(`Streamer: ${name} has gone offline`)
    }
    await dynamo.add(TABLE_NAME, name, onlineAfter);
}

module.exports = {
    outgoingFunction,
}