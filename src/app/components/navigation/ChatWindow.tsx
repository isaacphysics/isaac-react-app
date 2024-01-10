import React, { useEffect, useState } from "react";
import { tempChatHandlerEndpoint } from "../../services";

interface Message {
    content: string;
    sender: "user" | "ada";
}

function ChatMessage({content, sender}: Message) {
    const senderStatus = sender === "ada" ? "received" : "sent";
    const senderImage = sender === "ada" ? "/assets/logos/ada_logo_stamp_aqua.svg" : "/assets/card02.png";
    return <div className={`message ${senderStatus}`}>
      <img src={senderImage} alt="Avatar Icon" />
      <p>{content}</p>
    </div>;
}


export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessageContent, setCurrentMessageContent] = useState<string>("");
    const [threadId, setThreadId] = useState<string>();
    const [chatError, setChatError] = useState<string>();

    useEffect(function initialiseNewThread() {
        tempChatHandlerEndpoint.post("/threads")
        .then(response => { setThreadId(response.data); })
        .catch(error => { setChatError(error.message); });
    }, []);

    function sendCurrentMessage() {
        if (!threadId) return;
        setChatError(undefined);

        // Optimistically add the message to the list of messages
        setMessages([...messages, {content: currentMessageContent, sender: "user"}]);

        tempChatHandlerEndpoint.post(`/threads/${threadId}/messages`, { content: currentMessageContent, role: "user" })
        .then(response => {
            debugger;
        })
        .catch(error => { setChatError(error.message); });

        setCurrentMessageContent("");
    }

    return <div className="chat-window">
        <div className="chat-header">Talk to Ada ({threadId})</div>
        <div className="chat-body">
            <ul>
                {messages.map((message, index) => <li key={index} className="chat-message">
                    <ChatMessage {...message} />
                </li>)}
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