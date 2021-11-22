import React, {useEffect, useRef, useState} from "react";
import {ExecutableCodeSnippetDTO} from "../../../IsaacApiTypes";
import {useIFrameMessages} from "../../services/miscUtils";
import uuid from "uuid";

interface IsaacExecutableCodeProps {doc: ExecutableCodeSnippetDTO}

export const IsaacExecutableCodeSnippet = ({doc}: IsaacExecutableCodeProps) => {
    const iframeRef = useRef(null);
    const uid = useRef(doc?.id + uuid.v4().slice(0,4))
    const {receivedData, sendMessage} = useIFrameMessages(uid.current, iframeRef);
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
        if (!loaded || undefined === receivedData) return;

        if (receivedData.type === "log" || receivedData.type === "checkerFail") {
            // Offers functionality to log receivedData.message with a proper log event
            // Essentially log forwarding from the python editor

            // checkerFail represents a log message for when the test code written for
            // the question fails to compile
        }

        if (receivedData.type === "checker") {
            if (receivedData.result === doc.expectedOutput) {
                sendMessage({
                    type: "feedback",
                    succeeded: true,
                    message: "Your code is correct!"
                });
            } else {
                sendMessage({
                    type: "feedback",
                    succeeded: false,
                    message: "Your code is incorrect!"
                });
            }
        }
    }, [receivedData]);

    return <iframe title={"Code Sandbox"} src={"http://localhost:3000/#" + uid.current} ref={iframeRef} onLoad={sendQuestion} className={"isaac-code-iframe w-100"} style={{resize: "none", height: "400px", border: "none"}}/>
}
