//import { config } from "./bad/config.js";
import fetch from "node-fetch"


const objectToUrlEncoded = (obj) => {
    const urlEncoded = new URLSearchParams();
    Object.keys(obj).forEach(key => urlEncoded.append(key, obj[key]));
    return urlEncoded;
};


export const getNotifications = async (config) => {
    const response = await fetch("https://masto.den1.cz/api/v1/notifications", {
        method: "GET",
        headers: {
            "authorization": "Bearer " + config.access
        }
    });
    const json = await response.json();
    return json;
}

export const getStatus = async (config,id) => {
    const response = await fetch("https://masto.den1.cz/api/v1/statuses/" + id, {
        method: "GET",
        headers: {
            "authorization": "Bearer " + config.access
        }
    });
    const json = await response.json();
    return json;
}

export const postStatus = async (config,status, in_reply_to_id) => {
    //console.log("Bearer " + config.access)
    let obj = {
        status: status,
        language:"cs"
    }
    if (in_reply_to_id) {
        obj.in_reply_to_id = in_reply_to_id;
    }
    const response = await fetch("https://masto.den1.cz/api/v1/statuses", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "authorization": "Bearer " + config.access
        },
        body: objectToUrlEncoded(obj)
    });
    console.log(response.status)
    return
}

export const doFollow = async (config, id) => {
    const response = await fetch(`https://masto.den1.cz/api/v1/accounts/${id}/follow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "authorization": "Bearer " + config.access
        }
    });
    return response.status;
}

export const doBoost = async (config, id) => {
    const response = await fetch(`https://masto.den1.cz/api/v1/statuses/${id}/reblog`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "authorization": "Bearer " + config.access
        }
    });
    return response.status;
}

export const doLike = async (config, id) => {
    const response = await fetch(`https://masto.den1.cz/api/v1/statuses/${id}/favourite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "authorization": "Bearer " + config.access
        }
    });
    return response.status;
}