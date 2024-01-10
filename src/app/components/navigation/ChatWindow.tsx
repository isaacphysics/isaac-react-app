import React from "react";


function ChatMessage({message, sender}: {message: string, sender: "user" | "ada"}) {
    const senderStatus = sender === "ada" ? "received" : "sent";
    const senderImage = sender === "ada" ? "/assets/logos/ada_logo_stamp_aqua.svg" : "/assets/card02.png";
    return <div className={`message ${senderStatus}`}>
      <img src={senderImage} alt="Avatar Icon" />
      <p>{message}</p>
    </div>;
}


export function ChatWindow() {

    return <div className="chat-window">
        <div className="chat-header">Talk to Ada</div>
        <div className="chat-body">
            <ul>
                <li className="chat-message">
                    <ChatMessage sender="ada" message="Hi, I'm Ada. How can I help you?" />
                </li>
                <li className="chat-message">
                    <ChatMessage sender="user" message="I would you like some Computer Science help, pls!" />
                </li>
            </ul>
        </div>
        <form>
            <input type="text" placeholder="Type your message here" />
            <button>Send</button>
        </form>
        
    </div>;
}