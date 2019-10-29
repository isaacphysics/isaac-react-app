import React, {useContext} from "react";
import * as ApiTypes from "../../../IsaacApiTypes";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {AccordionContext} from "../../services/contexts";

function mapStateToProps(state: AppState) {
    if (state && state.doc && state.doc != 404) {
        return {pageId: state.doc.id};
    }
}

interface AnvilAppProps {
    doc: ApiTypes.AnvilAppDTO;
}

const AnvilAppComponent = (props: AnvilAppProps) => {
    const {doc} = props;
    let index = useContext(AccordionContext);
    console.log(index);

    let url = "https://anvil.works/apps/" + doc.appId + "/" + doc.appAccessKey + "/app?s=new" + Math.random();
    // + "#?accordion_section_id=" + index

    let ps = {};

    return <div>
        <iframe title={url} src={url} className="anvil-iframe"/>
    </div>;
};

export const AnvilApp = connect(mapStateToProps)(AnvilAppComponent);
