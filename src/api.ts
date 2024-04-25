import { APIMessage, APIUser } from "discord-api-types/v10";
import BasicMessage from "./structures/BasicMessage";
import StoreSchema from "./structures/StoreSchema";
import FetchChannelParam from "./structures/FetchChannelParam";
const { ipcRenderer } = require("electron");

const discord = {
    fetchMe: async (botToken: string): Promise<{ error: any; user: APIUser | null; }> => {
        return await ipcRenderer.invoke("discord:fetchMe", botToken);
    },
    fetchMessage: async (args: {
        botToken: string;
        channelId: string;
        messageId: string;
    }): Promise<{ error: any; data: BasicMessage[]; }> => {
        return await ipcRenderer.invoke("discord:fetchMessage", args);
    },
    fetchChannelMessages: async (args: {
        botToken: string;
        channelId: string;
        limit: number;
        param: { type: FetchChannelParam, value: string | null }
    }): Promise<{ error: any; data: BasicMessage[]; }> => {
        return await ipcRenderer.invoke("discord:fetchChannelMessages", args);
    },
    sendMessages: async (args: {
        botToken: string;
        channelId: string;
        messages: BasicMessage[];
    }): Promise<{ error: any, message: APIMessage | null }> => {
        return await ipcRenderer.invoke("discord:sendMessages", args);
    }
};

const electron = {
    showCopyMenuForTextInput: async (args: { selectedText: string }) => {
        return await ipcRenderer.invoke("electron:showCopyMenuForTextInput", args);
    }
}

const document = {
    onExecCommand: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.on("document:execCommand", callback)
    }
}

const store = {
    set: async <K extends keyof StoreSchema>(args: { key: K, value: StoreSchema[K] }) => {
        ipcRenderer.send("store:set", args);
    },
    get: async <K extends keyof StoreSchema>(key: K): Promise<StoreSchema[K]> => {
        return await ipcRenderer.invoke("store:get", key);
    },
    getAll: async (): Promise<StoreSchema> => {
        return await ipcRenderer.invoke("store:getAll");
    }
}

export default { discord, electron, document, store };