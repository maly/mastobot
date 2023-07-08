//import { config } from "./bad/config.js";
import fetch from "node-fetch"

const objectToFormData = (obj) => {
    const formData = new FormData();
    Object.keys(obj).forEach(key => formData.append(key, obj[key]));
    return formData;
};

const objectToUrlEncoded = (obj) => {
    const urlEncoded = new URLSearchParams();
    Object.keys(obj).forEach(key => urlEncoded.append(key, obj[key]));
    return urlEncoded;
};


/*
export async function getAccessToken() {
    const response = await fetch("https://masto.den1.cz/oauth/token", {
        method: "POST",
        headers: {
            "Content-Type": "form-data"
        },
        body: objectToFormData({
            client_id: config.client,
            client_secret: config.secret,
            grant_type: "authorization_code",
            code: config.authCode,
            scope: "read write push",
            redirect_uri: "urn:ietf:wg:oauth:2.0:oob"
        })
    });
    console.log(response.status)
    const text = await response.text();
    console.log(text);
    const json = await response.json();
    return json.access_token;
}
*/

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
//        in_reply_to_id: in_reply_to_id
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
//    console.log(response.status)
//    const json = await response.json();
//    return json;
}

export const doFollow = async (config, id) => {
    const response = await fetch(`https://masto.den1.cz/api/v1/accounts/${id}/follow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "authorization": "Bearer " + config.access
        }
    });
//    console.log(response.status)
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