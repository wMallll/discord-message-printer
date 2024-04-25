import { BrowserWindow, Menu, clipboard, ipcMain } from "electron";
import BasicMessage from "./structures/BasicMessage";
import DiscordService from "./services/DiscordService";
import StoreSchema from "./structures/StoreSchema";
import seedrandom from "seedrandom";
import os from "os";

import Store from "electron-store";
import { APIMessage, APIUser } from "discord-api-types/v10";
import FetchMode from "./structures/FetchMode";
import FetchChannelParam from "./structures/FetchChannelParam";
const store = new Store<StoreSchema>({
    schema: {
        botToken: { type: "string" },
        fetchMode: { type: "number" },
        messageLink: { type: "string" },
        channelId: { type: "string" },
        limit: { type: "string" },
        fetchChannelParam: { type: "number" },
        messageId: { type: "string" },
        sendChannelId: { type: "string" }
    },
    defaults: {
        botToken: "",
        fetchMode: FetchMode.Message,
        messageLink: "",
        channelId: "",
        limit: "",
        fetchChannelParam: FetchChannelParam.Around,
        messageId: "",
        sendChannelId: ""
    },
    // very basic encryption because we're still saving tokens and stuff
    encryptionKey: seedrandom(os.userInfo().username)().toString().split("").map(char => {
        const dict = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
        const index = isNaN(parseInt(char)) ? 0 : parseInt(char);
        return dict[index];
    }).join(""),
    clearInvalidConfig: true
});

export default function (mainWindow: BrowserWindow) {
    ipcMain.handle("discord:fetchMe", async (_, args): Promise<{
        error: any; user: APIUser | null;
    }> => {
        let user;
        try {
            user = await DiscordService.fetchMe(args);
        } catch (error: any) {
            return { error, user: null };
        }
        return {
            error: null,
            user
        };
    });
    ipcMain.handle("discord:fetchMessage", async (_, args): Promise<{
        error: any; data: BasicMessage[];
    }> => {
        let message;
        try {
            message = await DiscordService.fetchMessage(args);
            if (!message) throw new Error("message was empty");
        } catch (error: any) {
            return { error, data: [] };
        }
        return {
            error: null,
            data: [{
                content: message.content,
                embeds: message.embeds,
            }]
        };
    });
    ipcMain.handle("discord:fetchChannelMessages", async (_, args): Promise<{
        error: any; data: BasicMessage[];
    }> => {
        let messages;
        try {
            messages = await DiscordService.fetchChannelMessages(args);
            if (!messages) throw new Error("no messages were fetched");
        } catch (error: any) {
            return { error, data: [] };
        }
        const data = messages.map(e => ({ content: e.content, embeds: e.embeds }));
        data.reverse();
        return {
            error: null,
            data
        };
    });
    ipcMain.handle("discord:sendMessages", async (_, args): Promise<{
        error: any; messages: APIMessage[] | null;
    }> => {
        let messages;
        try {
            messages = await DiscordService.sendMessages(args);
            if (!messages || !messages.length) throw new Error("didn't send any messages");
        } catch (error: any) {
            return { error, messages: null };
        }
        return {
            error: null,
            messages
        };
    });
    ipcMain.handle("electron:showCopyMenuForTextInput", async (_, {
        selectedText
    }: {
        selectedText: string
    }) => {
        const menu = Menu.buildFromTemplate([
            {
                label: "Cut",
                enabled: !!selectedText,
                click: () => mainWindow.webContents.send("document:execCommand", "cut")
            },
            {
                label: "Copy",
                enabled: !!selectedText,
                click: () => mainWindow.webContents.send("document:execCommand", "copy")
            },
            {
                label: "Paste",
                enabled: !!clipboard.readText(),
                click: () => mainWindow.webContents.send("document:execCommand", "paste")
            }
        ]);
        menu.popup();
    });
    ipcMain.on("store:set", <K extends keyof StoreSchema>(_: any, {
        key, value
    }: {
        key: K, value: StoreSchema[K]
    }) => {
        store.set(key, value);
    });
    ipcMain.handle("store:get", (_, key: keyof StoreSchema) => {
        return store.get(key) ?? "";
    });
    ipcMain.handle("store:getAll", () => {
        return store.store;
    });
}