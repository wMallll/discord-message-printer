import { APIMessage, APIUser, RouteBases, Routes } from 'discord-api-types/v10';
import packageJson from "../../package.json";
import BasicMessage from "../structures/BasicMessage";
import FetchChannelParam from '../structures/FetchChannelParam';

const TIMEOUT = 20_000;

async function fetchMe(botToken: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    const response = await fetch(RouteBases.api + Routes.user(), {
        method: "GET",
        headers: {
            "Authorization": `Bot ${botToken}`,
            "User-Agent": `${packageJson.name} (v${packageJson.version})`
        },
        signal: controller.signal
    });
    clearTimeout(timeoutId);
    const json = await response.json();
    if (json.message) throw new Error(json.message);
    return json as APIUser;
}

async function fetchMessage({
    botToken,
    channelId,
    messageId
}: {
    botToken: string;
    channelId: string;
    messageId: string;
}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    const response = await fetch(RouteBases.api + Routes.channelMessage(channelId, messageId), {
        method: "GET",
        headers: {
            "Authorization": `Bot ${botToken}`,
            "User-Agent": `${packageJson.name} (v${packageJson.version})`
        },
        signal: controller.signal
    });
    clearTimeout(timeoutId);
    const json = await response.json();
    if (json.message) throw new Error(json.message);
    return json as APIMessage;
}

const fetchChannelMessagesParams = ["around", "before", "after"];
async function fetchChannelMessages({
    botToken,
    channelId,
    limit,
    param
}: {
    botToken: string;
    channelId: string;
    limit: number;
    param: { type: FetchChannelParam, value: string | null }
}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    const response = await fetch(`${
        RouteBases.api + Routes.channelMessages(channelId)
    }?limit=${limit}${param.value ? `&${fetchChannelMessagesParams[param.type]}=${param.value}` : ""}`, {
        method: "GET",
        headers: {
            "Authorization": `Bot ${botToken}`,
            "User-Agent": `${packageJson.name} (v${packageJson.version})`
        },
        signal: controller.signal
    });
    clearTimeout(timeoutId);
    const json = await response.json();
    if (json.message) throw new Error(json.message);
    return json as APIMessage[];
}

async function sendMessages({
    botToken,
    channelId,
    messages
}: {
    botToken: string;
    channelId: string;
    messages: BasicMessage[];
}) {
    const array: APIMessage[] = [];
    for (let index = 0; index < messages.length; index++) {
        const message = messages[index];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
        const response = await fetch(RouteBases.api + Routes.channelMessages(channelId), {
            method: "POST",
            headers: {
                "Authorization": `Bot ${botToken}`,
                "User-Agent": `${packageJson.name} (v${packageJson.version})`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const json = await response.json();
        if (json.message) throw new Error(json.message);
        array.push(json);
    }
    return array;
}

export default { fetchMe, fetchMessage, fetchChannelMessages, sendMessages };