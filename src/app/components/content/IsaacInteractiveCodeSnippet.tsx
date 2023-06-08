import React, {lazy, useEffect, useRef, useState} from "react";
import {InteractiveCodeSnippetDTO} from "../../../IsaacApiTypes";
import {CODE_EDITOR_BASE_URL, SITE_TITLE_SHORT, useIFrameMessages} from "../../services";
import {v4 as uuid_v4} from "uuid";
import {isaacApi, logAction, useAppDispatch} from "../../state";
import {Alert, Button} from "reactstrap";
import {Loading} from "../handlers/IsaacSpinner";
import {Link} from "react-router-dom";

const IsaacCodeSnippet = lazy(() => import("./IsaacCodeSnippet"));

interface IsaacInteractiveCodeProps {doc: InteractiveCodeSnippetDTO}

export const IsaacInteractiveCodeSnippet = ({doc}: IsaacInteractiveCodeProps) => {
    const dispatch = useAppDispatch();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const uid = useRef((doc?.id || "") + uuid_v4().slice(0, 8));
    const {receivedData, sendMessage} = useIFrameMessages(uid.current, iframeRef);
    const [iframeState, setIframeState] = useState<"loading" | "loaded" | "initialised" | "timeout">("loading");
    const [initDelay, setInitDelay] = useState<number>(50);

    function sendQuestion() {
        sendMessage({
            type: "initialise",
            code: doc.code,
            setup: doc.setupCode,
            test: doc.testCode,
            wrapCodeInMain: doc.wrapCodeInMain,
            language: doc.language
        });
    }

    useEffect(() => {
        if (iframeState !== "loaded") return;
        // If the iframe has not confirmed initialisation after ~5-7 seconds, give up and display the code in a normal code block
        if (initDelay > 5000) {
            setIframeState("timeout");
            console.error("Loading code editor iframe failed... displaying code in a normal code block instead");
            return;
        }
        const timeout = setTimeout(() => {
            sendQuestion();
            setInitDelay(d => d * 2);
        }, initDelay);
        return () => clearTimeout(timeout);
    }, [iframeState, initDelay]);

    const {data: segueEnvironment} = isaacApi.endpoints.getSegueEnvironment.useQuery();
    const [iFrameHeight, setIFrameHeight] = useState(100);

    useEffect(() => {
        if (!iframeState || undefined === receivedData) return;

        switch (receivedData.type) {
            case "confirmInitialised":
                // This is the first message sent by the iframe, and is used to confirm that the iframe had received
                // the initialisation message
                setIframeState("initialised");
                break;
            case "log":
            case "checkerFail":
            case "setupFail":
                // Offers functionality to log receivedData.message with a proper log event
                // Essentially log forwarding from the python editor

                // checkerFail represents a log message for when the test code written for
                // the question fails to compile or has a runtime error
                // setupFail represents the same but for setup code
                if (segueEnvironment !== "PROD") {
                    console.error(`IsaacInteractiveCodeSnippet ${receivedData.type === "setupFail" ? "setup code" : "checker"} error: ${receivedData.message}`);
                } else {
                    dispatch(logAction({
                        type: "ISAAC_INTERACTIVE_CODE_SNIPPET_ERROR",
                        questionId: doc.id,
                        error: `IsaacInteractiveCodeSnippet ${receivedData.type === "setupFail" ? "setup code" : "checker"} error: ${receivedData.message}`
                    }));
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
                if (segueEnvironment !== "PROD") {
                    console.error("IsaacInteractiveCodeSnippet received a malformed message from the editor iframe!");
                }
        }
    }, [receivedData, segueEnvironment]);

    return iframeState === "timeout"
        ? <>
            <IsaacCodeSnippet doc={doc} />
            <Alert color={"warning"}>Sorry! The {SITE_TITLE_SHORT} code editor doesn't seem to be working at the moment. Please <Button tag={Link} to={"/contact?subject=Code%20editor%20issue"} color={"link"}>report this to us</Button> and try again later.</Alert>
        </>
        : <>
            {iframeState !== "initialised" && <Loading className={"my-4"}/>}
            <iframe title={"Code Sandbox"} src={CODE_EDITOR_BASE_URL + "/#" + uid.current} ref={iframeRef} onLoad={() => setIframeState("loaded")} className={"isaac-code-iframe w-100 mb-1"} style={
                {
                    resize: "none",
                    height: iFrameHeight,
                    border: "none",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                    display: iframeState !== "initialised" ? "none" : "block",
                }
            } scrolling="no" allowTransparency={true} frameBorder={0} allow={"clipboard-read; clipboard-write"}/>
        </>;
}
