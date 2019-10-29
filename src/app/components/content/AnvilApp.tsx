import React, {useContext} from 'react';
import {AnvilAppDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {connect} from "react-redux";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {AccordionContext} from "../../services/contexts";

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

    let index = useContext(AccordionContext);
    console.log(index);
    // + "#?accordion_section_id=" + index

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
    // TODO: appParams["accordion_section_id"] = ...
    // TODO: appParams["page_id"] = ...
    // TODO: appParams["page_type"] = ...

    let queryParams = Object.keys(appParams).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(appParams[key])
    }).join('&');
    let iframeSrc = `${baseURL}#?${queryParams}`;

    return <iframe src={iframeSrc} title={title} className="anvil-app"/>;
};

export const AnvilApp = connect(stateToProps)(AnvilAppComponent);
