import React, {useContext, useState} from 'react';
import {AnvilAppDTO, IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {connect} from "react-redux";
import {AccordionSectionContext, LoggedInUser, QuestionContext} from "../../../IsaacAppTypes";
import {store} from "../../state/store";
import {createPortal} from "react-dom";

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

    let currentIframe = (element: any) => {
        if (element) {
            // console.log(element);
            // let data = element.origionalEvent.data;
            // console.log(data);
        }
    }

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
        parentQuestion.bestAttempt && (appParams["problem_previously_correct"] = parentQuestion.bestAttempt.correct);
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

    // let onMessage = function(e) {
    //     if (e.originalEvent.source !== currentIframe.contentWindow) { return; }
    //
    //     let data = e.originalEvent.data;
    //     console.debug("Anvil app message:", data);
    //
    //     if (data.fn == "newAppHeight") {
    //         currentIframe.height(data.newHeight+15);
    //     } else {
    //         scope.$emit("anvilAppMessage", data);
    //     }
    // };

    return <iframe ref={currentIframe} src={iframeSrc} title={title} className="anvil-app"/>;
};

export const AnvilApp = connect(stateToProps)(AnvilAppComponent);
