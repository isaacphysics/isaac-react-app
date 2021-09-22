import {PythonDTO} from "../../../IsaacApiTypes";
import React from "react";
import {useDispatch} from "react-redux";
import {setCurrentAttempt} from "../../state/actions";

const iframeLocation = "http://localhost:3000"

interface IsaacCodeProps {doc: PythonDTO, questionId: string}
export const IsaacPythonEditor = ({doc, questionId}: IsaacCodeProps) => {
	function sendPostMessage(obj: unknown) {
		const sandbox = document.getElementById("code-sandbox");
		(sandbox as HTMLIFrameElement).contentWindow?.postMessage(obj, iframeLocation);
	}

	function sendQuestion() {
		sendPostMessage({
			type: "INIT",
			code: doc.initCode || "# Your code here",
			test: doc.test || "checkerResult = False"
		});
	}

	window.addEventListener('message', e => {
		if (e.origin !== iframeLocation)
			return;

		console.log("received answer", e.data);

		// calculate correct answer
		dispatch(setCurrentAttempt(questionId, {type: "pythonChoice", value: e.data.checkerOutput}));

		// send submit success
		sendPostMessage({
			type: "FEEDBACK",
			studentSucceeded: true,
			message: "Your code ran successfully! Click the button below to submit."
		});
	});

	const dispatch = useDispatch();
	console.log(doc);

	return <iframe title={"Code Sandbox"} src={iframeLocation} id="code-sandbox" onLoad={sendQuestion} className={"w-100"} style={{"resize": "both", "height": "400px", "border": "none"}}/>
};
