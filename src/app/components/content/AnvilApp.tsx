import React, {RefObject, useContext, useEffect} from 'react';
import {AnvilAppDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {useSelector} from "react-redux";
import {AccordionSectionContext, QuestionContext} from "../../../IsaacAppTypes";
import {questions} from "../../state/selectors";

interface AnvilAppProps {
    doc: AnvilAppDTO;
}

const sessionIdentifier = Math.random();

export const AnvilApp = ({doc}: AnvilAppProps) => {
    const baseURL = `https://anvil.works/apps/${doc.appId}/${doc.appAccessKey}/app?s=new${sessionIdentifier}`;
    const title = doc.value || "Anvil app";
    const page = useSelector((state: AppState) => (state && state.doc) || null);
    const user = useSelector((state: AppState) => (state && state.user) || null);

    let iframeRef = React.useRef() as RefObject<HTMLIFrameElement>;

    let accordionSectionId = useContext(AccordionSectionContext);
    let questionId = useContext(QuestionContext);

    let parentQuestion = useSelector((state: AppState) => questions.selectQuestionPart(questionId)(state)) || undefined;

    let appParams: {[s: string]: string} = {};

    appParams["hostname"] = window.location.hostname;
    if (user && user.loggedIn) {
        if (user.id) {
            appParams["user_id"] = user.id.toString();
        }
        if (user.role) {
            appParams["user_role"] = user.role;
        }
    }

    if (parentQuestion !== undefined) {
        if (parentQuestion.id != null) {
            appParams["problem_id"] = parentQuestion.id;
        }
        if (parentQuestion.type != null) {
            appParams["problem_type"] = parentQuestion.type;
        }
        parentQuestion.bestAttempt && parentQuestion.bestAttempt.correct && (appParams["problem_previously_correct"] = parentQuestion.bestAttempt.correct.toString());
    }

    if ((accordionSectionId !== undefined)) {
        appParams["accordion_section_id"] = accordionSectionId;
    }

    if (page && page != 404) {
        if (page.id != null) {
            appParams["page_id"] = page.id;
        }
        if (page.type != null) {
            appParams["page_type"] = page.type;
        }
    }

    let queryParams = Object.keys(appParams).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(appParams[key])
    }).join('&');

    let iframeSrc = `${baseURL}#?${queryParams}`;

    let onMessage = function(e: any) {
        if (iframeRef.current && e.source !== (iframeRef.current as HTMLIFrameElement).contentWindow) { return; }

        let data = e.data;

        if (iframeRef.current && (data.fn == "newAppHeight")) {
            (iframeRef.current as HTMLIFrameElement).height = data.newHeight + 15;
        }
    };

    useEffect(() => {
        window.addEventListener("message", onMessage);

        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, [onMessage]);

    return <iframe ref={iframeRef} src={iframeSrc} title={title} className="anvil-app"/>;
};
