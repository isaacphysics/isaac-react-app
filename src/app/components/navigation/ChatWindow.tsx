import React, { useEffect, useState } from "react";
import { tempChatHandlerEndpoint } from "../../services";
import { Spinner } from "reactstrap";

interface Message {
    content: string;
    sender: "user" | "ada";
}

function ChatMessage({content, sender}: Message) {
    const senderStatus = sender === "ada" ? "received" : "sent";
    const senderImage = sender === "ada" ? "/assets/cs/chat/avatar-ada.png" : "/assets/cs/chat/avatar-user.png";
    return <div className={`message ${senderStatus}`}>
      <img src={senderImage} alt="Avatar Icon" />
      <p>{content}</p>
    </div>;
}


export function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessageContent, setCurrentMessageContent] = useState<string>("");
    const [threadId, setThreadId] = useState<string>();
    const [runId, setRunId] = useState<string>();
    const [chatError, setChatError] = useState<string>();

    useEffect(function initialiseNewThread() {
        tempChatHandlerEndpoint.post("/threads")
        .then(response => { setThreadId(response.data); })
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
                console.log(returned_run);
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
    }, [runId, setRunId, threadId]);

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

    return <div className="chat-window">
        <div className="chat-header h5">
            AskAda
        </div>
        <div className="chat-body">
            <ul>
                {messages.map((message, index) => <li key={index} className="chat-message">
                    <ChatMessage {...message} />
                </li>)}
            </ul>
            {runId && <div className="text-light">
                Ada is typing... <Spinner />
            </div>}
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