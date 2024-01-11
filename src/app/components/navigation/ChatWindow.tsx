import React, { useEffect, useRef, useState } from "react";
import { endpoint, tempChatHandlerEndpoint } from "../../services";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";

interface Message {
    content: string;
    sender: "user" | "ada";
}

function ChatMessage({content, sender}: Message) {
    const senderStatus = sender === "ada" ? "received" : "sent";
    const senderImage = sender === "ada" ? "/assets/cs/chat/avatar-ada.png" : "/assets/cs/chat/avatar-user.png";
    return <div className={`message ${senderStatus}`}>
      <img src={senderImage} alt="Avatar Icon" />
      <IsaacContentValueOrChildren encoding="markdown" value={content} />
    </div>;
}


export function ChatWindow() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessageContent, setCurrentMessageContent] = useState<string>("");
    const [threadId, setThreadId] = useState<string>();
    const [runId, setRunId] = useState<string>();
    const [chatError, setChatError] = useState<string>();
    const chatListRef = useRef<HTMLUListElement>(null);

    useEffect(function initialiseNewThread() {
        endpoint.post("/tutor/threads")
        .then(response => { setThreadId(response.data.id); })
        .catch(error => { setChatError(error.message); });
    }, []);

    useEffect(function pollForMessages() {
        if (!runId) return;

        const interval = setInterval(() => {
            const currentRunId = runId;
            tempChatHandlerEndpoint.get(`/threads/${threadId}/runs/${runId}`)
            .then(response => {
                const returned_run = response.data;
                if (returned_run.id !== runId) return;
                if (["completed", "cancelled", "failed", "expired"].includes(returned_run.status)) {
                    setRunId(undefined);
                    if (returned_run.status === "completed") {
                        tempChatHandlerEndpoint.get(`/threads/${threadId}/messages`)
                        .then(response => {
                            const latestMessages = response.data.data.slice().reverse();
                            setMessages(latestMessages.map((message: any) => ({
                                id: message.id,
                                content: message.content[0].text.value,
                                sender: message.role === 'assistant' ? 'ada' : 'user'
                            })));
                            console.log(latestMessages);
                        });
                    }
                }
            })
            .catch(error => {
                if (currentRunId === runId) setRunId(undefined);
                setChatError(error.message);
            });
        }, 1000);

        return function clearPoll()  { if (interval) clearInterval(interval); };
    }, [runId, threadId]);

    useEffect(function scrollToLatestMessage() {
        const chatList = chatListRef.current;
        if (chatList) {
            const lastMessage = chatList.childNodes[chatList.childElementCount - 1] as HTMLLIElement;
            lastMessage?.scrollIntoView({behavior: "smooth"});
        }
    }, [messages, runId]); // runId is included to scroll to the "Ada is typing..." message

    function sendCurrentMessage() {
        if (!threadId) return;
        setChatError(undefined);

        // Optimistically add the message to the list of messages
        setMessages([...messages, {content: currentMessageContent, sender: "user"}]);

        tempChatHandlerEndpoint.post(`/threads/${threadId}/messages`, { content: currentMessageContent, role: "user" })
        .then(response => { setRunId(response.data); })
        .catch(error => { setChatError(error.message); });

        setCurrentMessageContent("");
    }

    return <div className={`chat-window ${isCollapsed ? "collapsed" : ""}`}>
        <div className="chat-header h5">
            <div className="d-flex align-items-center">
                <button className="avatar" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? "show" : "hide"}
                </button>
                <span className="chatbot-name ml-2">AskAda</span>
            </div>
            <div className="d-flex align-items-center">
                <div className={`chat-indicator ${threadId ? "active" : ""}`} />
                <button className="close text-white-50 ml-2" onClick={() => setIsCollapsed(true)}>×</button>
            </div>
        </div>
        <div className="chat-body">
            <ul ref={chatListRef}>
                {messages.map((message, index) => <li key={index} className="chat-message">
                    <ChatMessage {...message} />
                </li>)}
                {runId && <li className="chat-message">
                    <ChatMessage sender="ada" content="_Ada is typing..._" />
                </li>}
            </ul>
            {chatError && <div className="alert alert-warning mx-4">
                <strong>Error:</strong> {chatError}
            </div>}
        </div>
        <form onSubmit={e => {
            e.preventDefault();
            setMessages([...messages, {content: currentMessageContent, sender: "user"}]);
            sendCurrentMessage();
        }}>
            <input type="text" placeholder="Type your message here" value={currentMessageContent} onChange={e => setCurrentMessageContent(e.target.value)}/>
            <button>Send</button>
        </form>
    </div>;
}