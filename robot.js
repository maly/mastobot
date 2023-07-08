//Robot

import fs, { stat } from "fs";

import { getNotifications, getStatus, postStatus, doFollow, doLike, doBoost} from "./mastodon.js";
import {reply} from "./aiguy.js";

const HTMLtoText = (html) => {
    let text = html.replace(/<.*?>|<\/.*?>/g, "");
    return text;
}

const noreply = ["bad","nice"]

//take a value. If string, return that. If array, return random item from it.
const randomSel = (value) => {
    if (typeof value === "string") return value;
    if (typeof value === "object") return value[Math.floor(Math.random()*value.length)];
    return value;
}

const follower = async (at,config) => {
    const name = config.name;

    let followers = at.map((notification) => { return {
        id:notification.account.id,
        acct:notification.account.acct,
        displayName:notification.account.display_name,
        text:HTMLtoText(notification.account.note)
    } });
    console.log("Processing followers");
    let followreply = JSON.parse(fs.readFileSync(`./${name}/data/followreply.json`));
    for (let t of followers) {
        //if (t.acct!="adent") continue;
        
        if (typeof followreply[t.acct]!=="undefined") {
            //force reply
            //let out = await postStatus(config, "@"+t.acct + ": " +followreply[t.acct].myReply, null);
            //console.log(out)
            continue
        }

        console.log("Welcome follower: " + t.acct + " " + t.text)

        if (config.followerReply) {
           t.myReply = (await reply(`Budu tě sledovat. Já jsem @${t.displayName} a říkám o sobě toto:"${t.text}"`, config.prompt, "gpt-3.5-turbo")).content;
           await postStatus(config, "@"+t.acct + ": " + t.myReply, null);
        }
           //console.log(t)
        followreply[t.acct] = t;
        await doFollow(config, t.id);

    }
    fs.writeFileSync(`./${name}/data/followreply.json`, JSON.stringify(followreply, null, 4));
    console.log("Followers done");
}

const replier = async (at, config) => {
    const name = config.name;

    let texty = at.map((notification) => { return {
        id:notification.id,
        statusId:notification.status.id,
        in_reply_to_id:notification.status.in_reply_to_id,
        content:notification.status.content,
        username:notification.account.username,
        text:HTMLtoText(notification.status.content)
    } });
    
    console.log("Processing replies");
    
    let replies = JSON.parse(fs.readFileSync(`./${name}/data/replies.json`));
    
    for (let t of texty) {
        if (typeof replies[t.in_reply_to_id]!=="undefined") {
            //force reply
            //let out = await postStatus(config, replies[t.in_reply_to_id].myReply, t.in_reply_to_id);
            //console.log(out)
            continue
        }
        if (t.in_reply_to_id===null && typeof replies[t.statusId]==="undefined") {
            console.log("Skipping non-reply");
            replies[t.statusId] = t;
            await postStatus(config, "Pardon, ale takhle nefunguju. Jen když jsem zmíněný v reakci na něco, tak to dojdu okomentovat." , t.statusId);
            continue;
        }
        if (t.in_reply_to_id===null) {
            continue;
        }
        let status = await getStatus(config,t.in_reply_to_id);
        //console.log("Replying to: ", t, status)
        if (status.account.username===config.name) {
            console.log("Skipping reply to my own status");
            replies[t.in_reply_to_id] = t;
            continue
        }

        if (noreply.includes(status.account.username)) {
            console.log("Skipping reply to buddy status");
            replies[t.in_reply_to_id] = t;
            continue
        }

        if (status.account.username===t.username) {
            console.log("Skipping reply to the same author");
            replies[t.in_reply_to_id] = t;
            await postStatus(config, randomSel(config.selfish) , t.statusId);
            continue
        }


        t.in_reply_to_content = status.content;
        t.in_reply_to_username = status.account.username;
        t.in_reply_to_note = HTMLtoText(status.account.note);

        //skip replies to toots where I am mentioned
        if (t.in_reply_to_note.includes("@"+config.name)) {
            console.log("Skipping reply to my own mention");
            replies[t.in_reply_to_id] = t;
            continue
        }

        //console.log(status);
        //continue

        t.text = HTMLtoText(t.content);
        t.in_reply_to_text = "@"+t.in_reply_to_username+" "+HTMLtoText(t.in_reply_to_content).replace(/\@\w+/g,"") + "\n(Kontext: píše to "+status.account.display_name+")";
        t.myReply = (await reply(t.in_reply_to_text, config.prompt)).content;
        replies[t.in_reply_to_id] = t;
        await postStatus(config, t.myReply, t.in_reply_to_id);


        //
        await doLike(config, t.in_reply_to_id);
        await doBoost(config, t.in_reply_to_id);
    }
        
    //save replies
    fs.writeFileSync(`./${name}/data/replies.json`, JSON.stringify(replies, null, 4));
    console.log("Replies saved")
}

export const robot = async (config) => {

    const name = config.name;

    console.log("\n\nGrabbing notifications for", name)
    console.log(new Date().toLocaleString())
    let at = await getNotifications(config);

    let follow = at.filter((notification) => { return notification.type === "follow" });
    fs.writeFileSync(`./${name}/data/follows.json`, JSON.stringify(follow, null, 4));

    //reply to all followers
        await follower(follow, config)


    //filter only mentions
    at = at.filter((notification) => { return notification.type === "mention" });

    fs.writeFileSync(`./${name}/data/notifications.json`, JSON.stringify(at, null, 4));

    await replier(at, config);
    console.log("Done\n====================\n\n")
}