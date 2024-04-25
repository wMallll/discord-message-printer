import {
    DiscordBold,
    DiscordCode,
    DiscordCustomEmoji,
    DiscordEmbed,
    DiscordEmbedDescription,
    DiscordEmbedField,
    DiscordEmbedFields,
    DiscordEmbedFooter,
    DiscordItalic,
    DiscordLink,
    DiscordMessage,
    DiscordMessages,
    DiscordQuote,
    DiscordSpoiler,
    DiscordTime,
    DiscordUnderlined,
} from "@skyra/discord-components-react";
import parseDiscordMarkdown from "discord-markdown-parser";
import { SingleASTNode } from "simple-markdown";
import BasicMessage from "../structures/BasicMessage";
import discordDateFormat from "../utils/discord-date-format";
import { DiscordMention } from "@skyra/discord-components-react";

function parseMarkdown(
    content: string | SingleASTNode[],
    _depth?: number
): React.ReactNode[] {
    const depth = _depth ?? 0;
    const parsed =
        typeof content === "string" ? parseDiscordMarkdown(content) : content;
    return parsed
        .map((node, index) => {
            const key = `${_depth}_${index}`;
            if (node.type === "text" && node.content === "@everyone") {
                return (
                    <DiscordMention className="d-inline" type="user" key={key}>
                        everyone
                    </DiscordMention>
                );
            }
            if (node.type === "text" && node.content === "@here") {
                return (
                    <DiscordMention className="d-inline" type="user" key={key}>
                        here
                    </DiscordMention>
                );
            }
            switch (node.type) {
                case "url":
                    const url = node.content
                        .map((e: any) => e.content)
                        .join("");
                    return (
                        <DiscordLink
                            className="d-inline"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={url}
                            key={key}
                        >
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordLink>
                    );

                case "em":
                    return (
                        <DiscordItalic className="d-inline" key={key}>
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordItalic>
                    );

                case "strikethrough":
                    return (
                        <span
                            className="text-decoration-line-through d-inline"
                            key={key}
                        >
                            {parseMarkdown(node.content, depth + 1)}
                        </span>
                    );

                case "underline":
                    return (
                        <DiscordUnderlined className="d-inline" key={key}>
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordUnderlined>
                    );

                case "strong":
                    return (
                        <DiscordBold className="d-inline" key={key}>
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordBold>
                    );

                case "br":
                    return <br key={key} />;

                case "blockQuote":
                    return (
                        <DiscordQuote className="d-inline" key={key}>
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordQuote>
                    );

                case "inlineCode":
                    return (
                        <DiscordCode className="d-inline" key={key}>
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordCode>
                    );

                case "codeBlock":
                    return (
                        <DiscordCode className="d-inline" key={key} multiline>
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordCode>
                    );

                case "spoiler":
                    return (
                        <DiscordSpoiler
                            className="d-inline"
                            multiline
                            key={key}
                        >
                            {parseMarkdown(node.content, depth + 1)}
                        </DiscordSpoiler>
                    );

                case "timestamp":
                    return (
                        <DiscordTime className="d-inline" key={key}>
                            {discordDateFormat(
                                new Date(parseInt(node.timestamp) * 1000),
                                node.format
                            )}
                        </DiscordTime>
                    );

                case "twemoji":
                    return (
                        <span className="d-inline" key={key}>
                            {node.name}
                        </span>
                    );

                case "emoji":
                    return (
                        <DiscordCustomEmoji
                            className="d-inline"
                            name={node.name}
                            url={`https://cdn.discordapp.com/emojis/${node.id}`}
                            key={key}
                        />
                    );

                case "here":
                    return (
                        <DiscordMention
                            className="d-inline"
                            type="user"
                            key={key}
                        >
                            here
                        </DiscordMention>
                    );

                case "channel":
                case "user":
                case "role":
                    return (
                        <DiscordMention
                            className="d-inline"
                            type={node.type}
                            key={key}
                        >
                            {node.id}
                        </DiscordMention>
                    );

                case "text":
                    return (
                        <span className="d-inline" key={key}>{node.content}</span>
                    );
            }
        })
        .flat(9999);
}

interface Props {
    message: BasicMessage | null;
    author: {
        name: string,
        avatarUrl: string
    }
}

let key = 0;
export default function DiscordFullMessage({ message, author }: Props) {
    key++;
    return (
        <DiscordMessages className="rounded my-2">
            <DiscordMessage
                author={author.name}
                avatar={author.avatarUrl}
                bot
                key={key}
            >
                {message
                    ? parseMarkdown(message.content || "")
                    : "Your message will appear here!"}
                {(message?.embeds ?? []).map((embed, index) => {
                    return (
                        <DiscordEmbed
                            slot="embeds"
                            color={`#${embed.color?.toString(16)}`}
                            embed-title={embed.title}
                            url={embed.url}
                            image={embed.image?.url}
                            video={embed.video?.url}
                            thumbnail={embed.thumbnail?.url}
                            authorImage={embed.author?.icon_url}
                            authorName={embed.author?.name}
                            authorUrl={embed.author?.url}
                            key={`_${index}`}
                        >
                            {!!embed.description && (
                                <DiscordEmbedDescription slot="description">
                                    {parseMarkdown(embed.description ?? "")}
                                </DiscordEmbedDescription>
                            )}
                            {!!embed.fields && (
                                <DiscordEmbedFields slot="fields">
                                    {embed.fields.map((field, _index) => {
                                        return (
                                            <DiscordEmbedField
                                                fieldTitle={field.name}
                                                inline={field.inline ?? false}
                                                key={`__${_index}`}
                                            >
                                                {parseMarkdown(field.value)}
                                            </DiscordEmbedField>
                                        );
                                    })}
                                </DiscordEmbedFields>
                            )}
                            {!!embed.footer && (
                                <DiscordEmbedFooter
                                    slot="footer"
                                    footer-image={embed.footer.icon_url}
                                    timestamp={
                                        embed.timestamp &&
                                        new Date(embed.timestamp)
                                    }
                                >
                                    {embed.footer.text}
                                </DiscordEmbedFooter>
                            )}
                        </DiscordEmbed>
                    );
                })}
            </DiscordMessage>
        </DiscordMessages>
    );
}
