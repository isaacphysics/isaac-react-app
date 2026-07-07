import React, {RefObject, useContext, useEffect} from 'react';
import {AnvilAppDTO} from "../../../IsaacApiTypes";
import {selectors, useAppSelector, usePostSkillsAnswerMutation} from "../../state";
import {AccordionSectionContext, QuestionContext} from "../../../IsaacAppTypes";
import {selectQuestionPart} from "../../services";
import { AnvilCookieHandler } from '../handlers/InterstitialCookieHandler';

interface AnvilAppProps {
    doc: AnvilAppDTO;
    skillId?: string
}

const sessionIdentifier = Math.random();

export const AnvilApp = ({doc, skillId}: AnvilAppProps) => {
    const baseURL = `https://${doc.appId}.anvil.app/${doc.appAccessKey}?s=new${sessionIdentifier}`;
    const title = doc.value || "Anvil app";
    const page = useAppSelector(selectors.doc.get);
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

    if (page && page != 404) {
        if (page.id != null) {
            appParams["page_id"] = page.id;
        }
        if (page.type != null) {
            appParams["page_type"] = page.type;
        }
    }

    const queryParams = Object.keys(appParams).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(appParams[key]);
    }).join('&');

    const iframeSrc = `${baseURL}#?${queryParams}`;
    const [postSkillsAnswer] = usePostSkillsAnswerMutation();

    useEffect(() => {
        const onMessage = function(e: MessageEvent<ResizeEvent | SubmissionMarkedEvent>) {
            if (iframeRef.current && e.source !== (iframeRef.current as HTMLIFrameElement).contentWindow) {
                return;
            }

            const data = e.data;

            if (iframeRef.current && (data.fn == "newAppHeight")) {
                (iframeRef.current as HTMLIFrameElement).height = `${data.newHeight + 15}`;
            } else if (iframeRef.current && user?.loggedIn && e.origin === `https://${doc.appId?.toLowerCase()}.anvil.app` && data.type === 'SUBMISSION_MARKED' && skillId) {
                void postSkillsAnswer({ appId: skillId, body: { hmac: data.hmac, payload: data.payload } });
            }
        };

        window.addEventListener("message", onMessage);

        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, [postSkillsAnswer, skillId, doc.appId, user?.loggedIn]);

    return <AnvilCookieHandler afterAcceptedElement={
        <iframe ref={iframeRef} src={iframeSrc} title={title} className="anvil-app"/>
    } />;
};

type ResizeEvent = { fn: "newAppHeight", type: undefined, newHeight: number }
type SubmissionMarkedEvent =  { fn: undefined, type: 'SUBMISSION_MARKED', hmac: string, payload: string};
