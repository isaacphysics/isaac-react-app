import React, {useEffect, useRef, useState} from "react";
import {ExecutableCodeSnippetDTO} from "../../../IsaacApiTypes";
import {useIFrameMessages} from "../../services/miscUtils";
import uuid from "uuid";

interface IsaacExecutableCodeProps {doc: ExecutableCodeSnippetDTO}

export const IsaacExecutableCodeSnippet = ({doc}: IsaacExecutableCodeProps) => {
    const iframeRef = useRef(null);
    const uid = useRef(doc?.id + uuid.v4().slice(0,4))
    const {receivedData, sendMessage} = useIFrameMessages(iframeRef, uid.current);
    const [loaded, setLoaded] = useState<boolean>(false);

    function sendQuestion() {
        setLoaded(true);
        sendMessage({
            type: "initialise",
            code: doc.code || "# Your code here",
            setup: doc.setupCode || "",
            test: doc.test || "checkerResult = False"
        });
    }

    useEffect(() => {
        if (!loaded || !receivedData) return;

        console.log(receivedData);

        if (receivedData.type === "log") {
            console.log(receivedData.message);
        }

        if (receivedData.type === "checkerResult") {
            sendMessage({
                type: "feedback",
                succeeded: true,
                message: "Your code ran successfully!"
            });
        }
    }, [receivedData]);

    return <iframe title={"Code Sandbox"} src={"http://localhost:3000#" + uid.current} ref={iframeRef} onLoad={sendQuestion} className={"isaac-code-iframe w-100"} style={{"resize": "none", "height": "400px", "border": "none"}}/>
}
