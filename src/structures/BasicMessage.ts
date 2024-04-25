import { APIEmbed } from 'discord-api-types/v10';

export default interface BasicMessage {
    content: string | null,
    embeds: APIEmbed[]
}