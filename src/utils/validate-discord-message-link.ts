export default function validateDiscordMessageLink(link: string): { channelId: string | null, messageId: string | null } {
    if (
        !link.startsWith("https://discord.com/channels/") &&
        !link.startsWith("discord.com/channels/")
    ) {
        return { channelId: null, messageId: null };
    }
    const parts = link.split(/\/+/g);
    return { channelId: parts.at(-2) ?? null, messageId: parts.at(-1) ?? null };
}