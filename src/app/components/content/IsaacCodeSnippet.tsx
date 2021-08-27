import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import React from "react";

const iframeLocation = "http://localhost:3000"

interface IsaacCodeProps {doc: CodeSnippetDTO}
export const IsaacCodeSnippet = ({doc}: IsaacCodeProps) => {
    function sendPostMessage(obj: {code: string}) {
        const sandbox = document.getElementById("code-sandbox");
        (sandbox as HTMLIFrameElement).contentWindow?.postMessage(obj, iframeLocation);
    }

    function sendQuestion() {
        sendPostMessage({
            code: doc.code || "",
        });
    }

    window.addEventListener('message', e => {
        if (e.origin !== iframeLocation)
            return;

        // calculate correct answer
    });

    return <iframe title={"Code Sandbox"} src={iframeLocation} id="code-sandbox" onLoad={sendQuestion} className={"w-100"} style={{"resize": "both", "height": "510px", "border": "none"}}/>
};
