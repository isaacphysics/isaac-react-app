import React, {useEffect, useRef, useState} from "react";
import {ExecutableCodeSnippetDTO} from "../../../IsaacApiTypes";
import {useIFrameMessages} from "../../services/miscUtils";
import uuid from "uuid";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";

interface IsaacExecutableCodeProps {doc: ExecutableCodeSnippetDTO}

export const IsaacExecutableCodeSnippet = ({doc}: IsaacExecutableCodeProps) => {
    const iframeRef = useRef(null);
    const uid = useRef(doc?.id + uuid.v4().slice(0,4));
    const {receivedData, sendMessage} = useIFrameMessages(uid.current, iframeRef);
    const [loaded, setLoaded] = useState<boolean>(false);

    function sendQuestion() {
        setLoaded(true);
        sendMessage({
            type: "initialise",
            code: doc.code,
            setup: doc.setupCode,
            test: doc.test
        });
    }

    const segueEnvironment = useSelector(selectors.segue.environmentOrUnknown);
    const [iFrameHeight, setIFrameHeight] = useState(400);

    useEffect(() => {
        if (!loaded || undefined === receivedData) return;

        switch (receivedData.type) {
            case "log":
            case "checkerFail":
                // Offers functionality to log receivedData.message with a proper log event
                // Essentially log forwarding from the python editor

                // checkerFail represents a log message for when the test code written for
                // the question fails to compile
                break;
            case "checker":
                if (doc?.expectedOutput && doc?.test) {
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
                } else {
                    sendMessage({
                        type: "feedback",
                        succeeded: true,
                        message: "Your code ran correctly!"
                    });
                }
                break;
            case "resize":
                if (typeof receivedData.height === "number") {
                    setIFrameHeight(receivedData.height as number);
                }
                break;
            default:
                if (segueEnvironment === "DEV") {
                    console.error("IsaacExecutableCodeSnippet received a malformed message from the editor iframe!");
                }
        }
    }, [receivedData]);

    return <iframe title={"Code Sandbox"} src={"http://localhost:3000/#" + uid.current} ref={iframeRef} onLoad={sendQuestion} className={"isaac-code-iframe w-100 mb-1"} style={{resize: "none", height: iFrameHeight, border: "none", overflow: "hidden"}} scrolling="no"/>;
}
