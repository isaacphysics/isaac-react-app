import React, {useEffect, useRef, useState} from "react";
import {InteractiveCodeSnippetDTO} from "../../../IsaacApiTypes";
import {useIFrameMessages} from "../../services/miscUtils";
import uuid from "uuid";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";

interface IsaacInteractiveCodeProps {doc: InteractiveCodeSnippetDTO}

export const IsaacInteractiveCodeSnippet = ({doc}: IsaacInteractiveCodeProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const uid = useRef((doc?.id || "") + uuid.v4().slice(0, 8));
    const {receivedData, sendMessage} = useIFrameMessages(uid.current, iframeRef);
    const [loaded, setLoaded] = useState<boolean>(false);

    function sendQuestion() {
        setLoaded(true);
        sendMessage({
            type: "initialise",
            code: doc.code,
            setup: doc.setupCode,
            test: doc.testCode,
            testInput: doc.testInput,
            outputRegex: doc.outputRegex,
            useAllTestInputs: doc.useAllTestInputs,
            wrapCodeInMain: doc.wrapCodeInMain
        });
    }

    const segueEnvironment = useSelector(selectors.segue.environmentOrUnknown);
    const [iFrameHeight, setIFrameHeight] = useState(100);

    useEffect(() => {
        if (!loaded || undefined === receivedData) return;

        switch (receivedData.type) {
            case "log":
            case "checkerFail":
            case "setupFail":
                // Offers functionality to log receivedData.message with a proper log event
                // Essentially log forwarding from the python editor

                // checkerFail represents a log message for when the test code written for
                // the question fails to compile or has a runtime error
                // setupFail represents the same but for setup code
                if (segueEnvironment === "DEV") {
                    console.error(`IsaacInteractiveCodeSnippet ${receivedData.type === "setupFail" ? "setup code" : "checker"} error: ${receivedData.message}`);
                }
                break;
            case "checker":
                if (doc?.expectedResult && doc?.testCode && receivedData.result !== "CHECKER_RESULT_UNDEFINED") {
                    if (receivedData.result === doc.expectedResult) {
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
                    console.error("IsaacInteractiveCodeSnippet received a malformed message from the editor iframe!");
                }
        }
    }, [receivedData]);

    return <iframe title={"Code Sandbox"} src={"http://localhost:3000/#" + uid.current} ref={iframeRef} onLoad={sendQuestion} className={"isaac-code-iframe w-100 mb-1"} style={
        {
            resize: "none",
            height: iFrameHeight,
            border: "none",
            overflow: "hidden",
            backgroundColor: "transparent"
        }
    } scrolling="no" allowTransparency={true} frameBorder={0} allow={"clipboard-read; clipboard-write"}/>;
}
