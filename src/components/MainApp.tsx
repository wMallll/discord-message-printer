import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Slide, ToastContainer, toast } from "react-toastify";
import BasicMessage from "../structures/BasicMessage";
import validateDiscordMessageLink from "../utils/validate-discord-message-link";
import DiscordFullMessage from "./DiscordFullMessage";
import FetchMode from "../structures/FetchMode";
import FetchChannelParam from "../structures/FetchChannelParam";
import { ErrorBoundary } from "react-error-boundary";
import SplashScreen from "./SplashScreen";

api.document.onExecCommand((_, command: string) =>
    document.execCommand(command)
);

const FALLBACK_AVATAR_URL = "https://i.imgur.com/zNjOMZw.png";

export function MainApp() {
    const [storeFirstLoaded, setStoreFirstLoaded] = useState(false);
    const [tokenInputPassword, setTokenInputPassword] = useState(true);

    const [fetchMode, setFetchMode] = useState<FetchMode>(FetchMode.Message);

    const [botToken, setBotToken] = useState("");
    const [messageLink, setMessageLink] = useState("");
    const [channelId, setChannelId] = useState("");
    const [limit, setLimit] = useState("");
    const [fetchChannelParam, setFetchChannelParam] = useState(
        FetchChannelParam.After
    );
    const [messageId, setMessageId] = useState("");

    const [sendChannelId, setSendChannelId] = useState("");

    const [loadedUser, setLoadedUser] = useState<{
        name: string;
        avatarUrl: string;
    }>({ name: "Bot", avatarUrl: FALLBACK_AVATAR_URL });
    const [loadedMessages, setLoadedMessages] = useState<BasicMessage[]>([]);
    const [jsonEditorCode, setJsonEditorCode] = useState("[]");
    const [getMessageFormValidated, setGetMessageFormValidated] =
        useState(false);
    const [sendMessageFormValidated, setSendMessageFormValidated] =
        useState(false);
    const [loading, setLoading] = useState(false);

    const [jsonEditorLastError, setJsonEditorLastError] = useState("");

    const selectFetchModeRef = useRef<HTMLSelectElement>(null);
    const selectFetchChannelParamRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        (async () => {
            const data = await api.store.getAll();
            setBotToken(data.botToken);
            setFetchMode(data.fetchMode);
            setMessageLink(data.messageLink);
            setChannelId(data.channelId);
            setLimit(data.limit);
            setSendChannelId(data.sendChannelId);
            setFetchChannelParam(data.fetchChannelParam);
            setMessageId(data.messageId);
            setStoreFirstLoaded(true);
        })();
    }, []);

    async function handleGetMessageFormSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setGetMessageFormValidated(true);
        const form = event.currentTarget;
        if (!form.checkValidity()) return;
        setLoading(true);
        const { error: userError, user } = await api.discord.fetchMe(botToken);
        if (userError || !user) {
            toast(userError.toString(), { type: "error" });
        } else {
            const { error, data } = await (async () => {
                switch (fetchMode) {
                    case FetchMode.Message:
                        const { channelId: _channelId, messageId: _messageId } =
                            validateDiscordMessageLink(messageLink);
                        if (!_channelId || !_messageId) {
                            return {
                                error: "Error: invalid message link",
                                data: [],
                            };
                        }
                        return await api.discord.fetchMessage({
                            botToken,
                            channelId: _channelId,
                            messageId: _messageId,
                        });

                    default:
                        return await api.discord.fetchChannelMessages({
                            botToken,
                            channelId,
                            limit: isNaN(parseInt(limit)) ? 1 : parseInt(limit),
                            param: {
                                type: fetchChannelParam,
                                value: messageId || null,
                            },
                        });
                }
            })();
            if (error || !data.length) {
                toast(error.toString(), { type: "error" });
            } else {
                setJsonEditorLastError("");
                setLoadedMessages(data);
                setLoadedUser({
                    name: user.global_name ?? user.username,
                    avatarUrl: user.avatar
                        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
                        : FALLBACK_AVATAR_URL,
                });
                setJsonEditorCode(JSON.stringify([data], null, 2));
            }
        }
        setLoading(false);
    }

    async function handleSendMessageFormSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        setSendMessageFormValidated(true);
        const form = event.currentTarget;
        if (!form.checkValidity() || !loadedMessages.length) return;
        setLoading(true);
        const { error } = await api.discord.sendMessages({
            botToken,
            channelId: sendChannelId,
            messages: loadedMessages,
        });
        if (error) {
            toast(error.toString(), { type: "error" });
        } else {
            toast(
                `${
                    loadedMessages.length === 1 ? "Message" : "Messages"
                } sent successfully!`,
                { type: "success" }
            );
        }
        setLoading(false);
    }

    function handleJsonEditorChange(content: string) {
        setJsonEditorCode(content);
        let json: BasicMessage[];
        try {
            json = JSON.parse(content);
        } catch (err: any) {
            setJsonEditorLastError(err.toString());
            return;
        }
        setJsonEditorLastError("");
        setLoadedMessages(json);
    }

    return (
        <>
            <SplashScreen />
            <div className={`${storeFirstLoaded ? "d-block" : "d-none"}`}>
                <Form
                    className="mb-4"
                    noValidate
                    validated={getMessageFormValidated}
                    onSubmit={handleGetMessageFormSubmit}
                >
                    <Form.Group className="mb-3">
                        <Form.Label>Bot Token</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                className="rounded"
                                type={tokenInputPassword ? "password" : "text"}
                                placeholder="Discord Bot token"
                                required
                                disabled={loading}
                                value={botToken}
                                onChange={(e) => {
                                    setBotToken(e.target.value);
                                    api.store.set({
                                        key: "botToken",
                                        value: e.target.value,
                                    });
                                }}
                            />
                            <FontAwesomeIcon
                                icon={faEye}
                                width={30}
                                height={30}
                                className="position-relative cursor-pointer hover-darker"
                                style={{
                                    marginLeft: "-30px",
                                    zIndex: 10,
                                    top: "10px",
                                    left: "-5px",
                                }}
                                role="button"
                                onClick={() =>
                                    setTokenInputPassword((prev) => !prev)
                                }
                                color={tokenInputPassword ? "#8f8f8f" : "#fff"}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a Discord Token.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Fetch mode</Form.Label>
                        <Form.Select
                            ref={selectFetchModeRef}
                            disabled={loading}
                            value={fetchMode.toString()}
                            onChange={(e) => {
                                setFetchMode(e.target.selectedIndex);
                                api.store.set({
                                    key: "fetchMode",
                                    value: e.target.selectedIndex,
                                });
                            }}
                        >
                            <option value={"0"}>Message</option>
                            <option value={"1"}>Channel</option>
                        </Form.Select>
                    </Form.Group>

                    {fetchMode === FetchMode.Message ? (
                        <Form.Group className="mb-3">
                            <Form.Label>Message Link</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Link of the message you want to copy"
                                required
                                disabled={loading}
                                value={messageLink}
                                onChange={(e) => {
                                    setMessageLink(e.target.value);
                                    api.store.set({
                                        key: "messageLink",
                                        value: e.target.value,
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a Message Link.
                            </Form.Control.Feedback>
                        </Form.Group>
                    ) : (
                        <>
                            <Form.Group className="mb-3 mt-3">
                                <Form.Label>Channel ID</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        className="rounded"
                                        type={"text"}
                                        placeholder="Channel ID where to fetch messages"
                                        required
                                        disabled={loading}
                                        value={channelId}
                                        onChange={(e) => {
                                            setChannelId(e.target.value);
                                            api.store.set({
                                                key: "channelId",
                                                value: e.target.value,
                                            });
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a Channel ID.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-3 mt-3">
                                <Form.Label>Limit</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        className="rounded"
                                        type={"number"}
                                        placeholder="Fetch messages limit"
                                        required
                                        disabled={loading}
                                        min={1}
                                        max={50}
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(e.target.value);
                                            api.store.set({
                                                key: "limit",
                                                value: e.target.value,
                                            });
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid message fetch
                                        limit.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-3 mt-3 d-flex">
                                <Form.Select
                                    style={{ marginRight: "5px" }}
                                    ref={selectFetchChannelParamRef}
                                    disabled={loading}
                                    value={fetchChannelParam.toString()}
                                    onChange={(e) => {
                                        setFetchChannelParam(
                                            e.target.selectedIndex
                                        );
                                        api.store.set({
                                            key: "fetchChannelParam",
                                            value: e.target.selectedIndex,
                                        });
                                    }}
                                >
                                    <option value={"0"}>Around</option>
                                    <option value={"1"}>Before</option>
                                    <option value={"2"}>After</option>
                                </Form.Select>
                                <InputGroup
                                    hasValidation
                                    style={{ marginLeft: "5px" }}
                                >
                                    <Form.Control
                                        className="rounded"
                                        type={"text"}
                                        placeholder="Message ID (optional)"
                                        disabled={loading}
                                        value={messageId}
                                        onChange={(e) => {
                                            setMessageId(e.target.value);
                                            api.store.set({
                                                key: "messageId",
                                                value: e.target.value,
                                            });
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid message ID.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </>
                    )}

                    <Button type="submit" disabled={loading}>
                        {fetchMode === FetchMode.Message
                            ? "Load Message"
                            : "Load Channel Messages"}
                    </Button>
                </Form>

                <hr />

                <Form
                    className="mb-3"
                    noValidate
                    validated={sendMessageFormValidated}
                    onSubmit={handleSendMessageFormSubmit}
                >
                    <Form.Group className="mb-3 mt-3">
                        <Form.Label>Target Channel ID</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                className="rounded"
                                type={"text"}
                                placeholder={`Channel ID where to send the ${
                                    loadedMessages.length > 1
                                        ? "messages"
                                        : "message"
                                }`}
                                required
                                disabled={loading}
                                value={sendChannelId}
                                onChange={(e) => {
                                    setSendChannelId(e.target.value);
                                    api.store.set({
                                        key: "sendChannelId",
                                        value: e.target.value,
                                    });
                                }}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please provide a Channel ID.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Button type="submit" disabled={loading}>
                        {loadedMessages.length > 1
                            ? "Send Messages"
                            : "Send Message"}
                    </Button>
                </Form>

                <div className="border p-3 rounded">
                    <div className="mb-4">
                        <h6 className="mb-3">JSON Editor:</h6>
                        <div
                            onContextMenu={() => {
                                api.electron.showCopyMenuForTextInput({
                                    selectedText:
                                        window.getSelection()?.toString() ?? "",
                                });
                            }}
                        >
                            <AceEditor
                                className="w-100 rounded p-4"
                                height="350px"
                                mode="json"
                                theme="one_dark"
                                fontSize="20px"
                                highlightActiveLine={true}
                                value={jsonEditorCode}
                                setOptions={{
                                    enableLiveAutocompletion: false,
                                    showLineNumbers: true,
                                    showPrintMargin: false,
                                }}
                                onChange={handleJsonEditorChange}
                            />
                        </div>
                        {!!jsonEditorLastError && (
                            <div
                                className="mt-2"
                                style={{
                                    fontSize: ".875em",
                                    color: "var(--bs-form-invalid-color)",
                                }}
                            >
                                {jsonEditorLastError}.
                            </div>
                        )}
                        <Button
                            className="mt-3"
                            onClick={() => {
                                setJsonEditorCode(
                                    JSON.stringify(loadedMessages, null, 2)
                                );
                                setJsonEditorLastError("");
                            }}
                        >
                            Format JSON
                        </Button>
                        <Button
                            className="mt-3"
                            onClick={() => {
                                const copy = [...loadedMessages];
                                copy.reverse();
                                setLoadedMessages(copy);
                                setJsonEditorCode(
                                    JSON.stringify(copy, null, 2)
                                );
                                setJsonEditorLastError("");
                            }}
                            style={{ marginLeft: "10px" }}
                        >
                            Flip messages
                        </Button>
                    </div>
                    <div>
                        <h6 className="mb-3">Preview:</h6>

                        <ErrorBoundary
                            fallbackRender={({
                                error,
                                resetErrorBoundary,
                            }: {
                                error: any;
                                resetErrorBoundary: (...args: any[]) => void;
                            }) => {
                                return (
                                    <div
                                        style={{
                                            fontSize: ".875em",
                                            color: "var(--bs-form-invalid-color)",
                                        }}
                                    >
                                        Error while rendering Discord message (
                                        {error.toString()}).{" "}
                                        <span
                                            className="link fw-bold"
                                            onClick={() => resetErrorBoundary()}
                                        >
                                            Click here to try again.
                                        </span>
                                    </div>
                                );
                            }}
                        >
                            {loadedMessages.length ? (
                                loadedMessages.map((message, index) => {
                                    return (
                                        <DiscordFullMessage
                                            message={message}
                                            author={loadedUser}
                                            key={`___${index}`}
                                        />
                                    );
                                })
                            ) : (
                                <DiscordFullMessage
                                    message={{
                                        content:
                                            "Your messages will show up here!",
                                        embeds: [],
                                    }}
                                    author={loadedUser}
                                />
                            )}
                        </ErrorBoundary>
                    </div>
                </div>
                <ToastContainer
                    transition={Slide}
                    autoClose={4_000}
                    position="bottom-right"
                    theme="dark"
                />
            </div>
        </>
    );
}
