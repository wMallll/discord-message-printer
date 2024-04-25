import FetchChannelParam from "./FetchChannelParam";
import FetchMode from "./FetchMode";

export default interface StoreSchema {
    botToken: string,
    fetchMode: FetchMode,
    messageLink: string,
    channelId: string,
    limit: string,
    fetchChannelParam: FetchChannelParam,
    messageId: string,
    sendChannelId: string
}