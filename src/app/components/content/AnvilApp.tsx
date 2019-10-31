import React, {useContext} from 'react';
import {AnvilAppDTO, IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {connect} from "react-redux";
import {AccordionSectionContext, LoggedInUser, QuestionContext} from "../../../IsaacAppTypes";
import {store} from "../../state/store";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) || null,
    page: (state && state.doc) || null,
    pageState: store.getState()
});

interface AnvilAppProps {
    doc: AnvilAppDTO;
    user: LoggedInUser | null;
    pageState: any;
}

// TODO add dynamic resizing using onmessage
const AnvilAppComponent = ({doc, user, pageState}: AnvilAppProps) => {
    const baseURL = `https://anvil.works/apps/${doc.appId}/${doc.appAccessKey}/app?s=new${Math.random()}`;
    const title = doc.value || "Anvil app";

    let accordionSectionId = useContext(AccordionSectionContext);
    let questionId = useContext(QuestionContext);

    let parentQuestion = pageState && pageState.questions ? (pageState.questions).find(
        function(question: IsaacQuestionPageDTO) {return question.id == questionId}) : undefined;

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
        appParams["problem_id"] = parentQuestion.id;
        appParams["problem_type"] = parentQuestion.type;
        appParams["problem_previously_correct"] = parentQuestion.bestAttempt.correct;
    }

    if ((accordionSectionId !== undefined)) {
        appParams["accordion_section_id"] = accordionSectionId;
    }

    if (pageState.doc) {
        appParams["page_id"] = pageState.doc.id;
        appParams["page_type"] = pageState.doc.type;
    }

    let queryParams = Object.keys(appParams).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(appParams[key])
    }).join('&');
    let iframeSrc = `${baseURL}#?${queryParams}`;

    return <iframe src={iframeSrc} title={title} className="anvil-app"/>;
};

export const AnvilApp = connect(stateToProps)(AnvilAppComponent);
