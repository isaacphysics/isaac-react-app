import React, {useContext} from 'react';
import {AnvilAppDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {connect} from "react-redux";
import {LoggedInUser, AccordionSectionContext} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) || null
});

interface AnvilAppProps {
    doc: AnvilAppDTO;
    user: LoggedInUser | null;
}

// TODO add dynamic resizing using onmessage, additional required info in URL params!
const AnvilAppComponent = ({doc, user}: AnvilAppProps) => {
    const baseURL = `https://anvil.works/apps/${doc.appId}/${doc.appAccessKey}/app?s=new${Math.random()}`;
    const title = doc.value || "Anvil app";

    let accordionSectionTitle = useContext(AccordionSectionContext);

    let appParams: {[s: string]: string} = {};

    appParams["hostname"] = window.location.host;
    if (user && user.loggedIn) {
        if (user.id) {
            appParams["user_id"] = user.id.toString();
        }
        if (user.role) {
            appParams["user_role"] = user.role;
        }
    }
    // TODO: appParams["problem_id"] = ...
    // TODO: appParams["problem_type"] = ...
    // TODO: appParams["problem_previously_correct"] = ...
    if (!(accordionSectionTitle === undefined)) {
        appParams["accordion_section_id"] = accordionSectionTitle;
    }

    if (location.pathname.indexOf("/questions/") == 0) {
        appParams["page_id"] = location.pathname.replace("/questions/", "");
        appParams["page_type"] = "isaacQuestionPage";
    } else if (location.pathname.indexOf("/concepts/") == 0) {
        appParams["page_id"] = location.pathname.replace("/concepts/", "");
        appParams["page_type"] = "isaacConceptPage";
    } else if (location.pathname.indexOf("/events/") == 0) {
        appParams["page_id"] = location.pathname.replace("/events/", "");
        appParams["page_type"] = "isaacEventPage";
    } else if (location.pathname.indexOf("/pages/") == 0) {
        appParams["page_id"] = location.pathname.replace("/pages/", "");
        appParams["page_type"] = "page";
    } else if ((location.pathname.match(/\//g) || []).length == 1) {
        appParams["page_id"] = location.pathname.replace("/", "");
        appParams["page_type"] = "page";
    }

    let queryParams = Object.keys(appParams).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(appParams[key])
    }).join('&');
    let iframeSrc = `${baseURL}#?${queryParams}`;

    return <iframe src={iframeSrc} title={title} className="anvil-app"/>;
};

export const AnvilApp = connect(stateToProps)(AnvilAppComponent);
