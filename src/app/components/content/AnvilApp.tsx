import React, {RefObject, useContext, useEffect} from 'react';
import {AnvilAppDTO} from "../../../IsaacApiTypes";
import {AppState, selectors, useAppSelector} from "../../state";
import {AccordionSectionContext, PageContext, QuestionContext} from "../../../IsaacAppTypes";
import {selectQuestionPart} from "../../services";

interface AnvilAppProps {
    doc: AnvilAppDTO;
}

const sessionIdentifier = Math.random();

export const AnvilApp = ({doc}: AnvilAppProps) => {
    const baseURL = `https://${doc.appId}.anvil.app/${doc.appAccessKey}?s=new${sessionIdentifier}`;
    const title = doc.value || "Anvil app";
    const user = useAppSelector(selectors.user.orNull);

    const iframeRef = React.useRef() as RefObject<HTMLIFrameElement>;

    const accordionSectionId = useContext(AccordionSectionContext).id;
    const questionId = useContext(QuestionContext);

    const pageQuestions = useAppSelector(selectors.questions.getQuestions);
    const questionPart = selectQuestionPart(pageQuestions, questionId);

    const appParams: {[s: string]: string} = {};

    appParams["hostname"] = window.location.hostname;
    if (user && user.loggedIn) {
        if (user.id) {
            appParams["user_id"] = user.id.toString();
        }
        if (user.role) {
            appParams["user_role"] = user.role;
        }
    }

    if (questionPart !== undefined) {
        if (questionPart.id != null) {
            appParams["problem_id"] = questionPart.id;
        }
        if (questionPart.type != null) {
            appParams["problem_type"] = questionPart.type;
        }
        if (questionPart.bestAttempt && questionPart.bestAttempt.correct) {
            appParams["problem_previously_correct"] = questionPart.bestAttempt.correct.toString();
        }
    }

    if ((accordionSectionId !== undefined)) {
        appParams["accordion_section_id"] = accordionSectionId;
    }

    const {id, type} = useContext(PageContext);
    if (id != null) {
        appParams["page_id"] = id;
    }
    if (type != null) {
        appParams["page_type"] = type;
    }

    const queryParams = Object.keys(appParams).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(appParams[key])
    }).join('&');

    const iframeSrc = `${baseURL}#?${queryParams}`;

    const onMessage = function(e: any) {
        if (iframeRef.current && e.source !== (iframeRef.current as HTMLIFrameElement).contentWindow) {
            return;
        }

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
