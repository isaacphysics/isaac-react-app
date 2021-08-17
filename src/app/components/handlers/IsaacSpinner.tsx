import React from "react";
import {Spinner} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";

export const IsaacSpinner = () => {
    return SITE_SUBJECT === SITE.CS ?
        <img className="cs-spinner" alt="Isaac Computer Science loading spinner" src="/assets/isaac-cs-typer-css.svg"/>
        :
        <Spinner color="primary"/>;
}
