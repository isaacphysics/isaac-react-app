import React, { useEffect, useState } from "react";
import { tempChatHandlerEndpoint } from "../../services";

interface Message {
    message: string;
    sender: "user" | "ada";
}

function ChatMessage({message, sender}: Message) {
    const senderStatus = sender === "ada" ? "received" : "sent";
    const senderImage = sender === "ada" ? "/assets/logos/ada_logo_stamp_aqua.svg" : "/assets/card02.png";
    return <div className={`message ${senderStatus}`}>
      <img src={senderImage} alt="Avatar Icon" />
      <p>{message}</p>
    </div>;
}


export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [threadId, setThreadId] = useState<string>();
    const [error, setError] = useState<string>();

    useEffect(function initialiseNewThread() {
        tempChatHandlerEndpoint.get("/threads/new")
        .then(response => { setThreadId(response.data); })
        .catch(error => { setError(error.message); });
    }, []);

    return <div className="chat-window">
        <div className="chat-header">Talk to Ada ({threadId})</div>
        <div className="chat-body">
            <ul>
                {messages.map((message, index) => <li key={index} className="chat-message">
                    <ChatMessage {...message} />
                </li>)}
            </ul>
            {error && <div className="error">{error}</div>}
        </div>
        <form onSubmit={e => {
            e.preventDefault();
            setMessages([...messages, {message: currentMessage, sender: "user"}]);
            setCurrentMessage("");
        }}>
            <input type="text" placeholder="Type your message here" value={currentMessage} onChange={e => setCurrentMessage(e.target.value)}/>
            <button>Send</button>
        </form>
    </div>;
}