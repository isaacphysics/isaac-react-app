import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {AppState, ContentVersionState} from "../../state/reducers";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {getContentVersion, requestConstantsSegueVersion, setContentVersion} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {ContentVersionUpdatingStatus} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const stateToProps = (state: AppState) => ({
    segueVersion: state && state.constants && state.constants.segueVersion || "unknown",
    contentVersion: state && state.contentVersion || null,
});

const dispatchToProps = {getContentVersion, setContentVersion, requestConstantsSegueVersion};

interface AdminPageProps {
    user: RegisteredUserDTO;
    segueVersion: string;
    contentVersion: ContentVersionState;
    getContentVersion: () => void;
    setContentVersion: (version: string) => void;
    requestConstantsSegueVersion: () => void;
}

const AdminPageComponent = ({user, getContentVersion, setContentVersion, contentVersion, segueVersion, requestConstantsSegueVersion}: AdminPageProps) => {
    useEffect(() => {
        getContentVersion();
    }, []);

    useEffect(() => {
        requestConstantsSegueVersion();
    }, []);

    const [newVersion, setNewVersion] = useState<string | null>(null);

    const displayVersion = newVersion || (contentVersion && contentVersion.liveVersion) || null;

    const startVersionUpdate = function(event?: React.FormEvent) {
        if (event) {
            event.preventDefault();
        }
        if (contentVersion && displayVersion !== contentVersion.liveVersion && newVersion != null) {
            setContentVersion(newVersion);
        }
    };

    const updateState = contentVersion && contentVersion.updateState || null;

    return <RS.Container id="admin-page">
        <TitleAndBreadcrumb currentPageTitle="Isaac administration" breadcrumbTitleOverride="Admin tools" />

        <div className="py-4">

            Hi, {user.givenName}!

            <RS.Card className="p-3 my-3">
                <RS.CardTitle tag="h2">Useful links</RS.CardTitle>
                <RS.CardBody>
                    <Link to="/admin/usermanager">User Manager</Link>
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="p-3 mb-3">
                <RS.CardTitle tag="h2">Admin Console</RS.CardTitle>
                <RS.CardBody>
                    <ul>
                        <li><strong>API Version:</strong> {segueVersion}</li>
                    </ul>
                </RS.CardBody>
            </RS.Card>

            <RS.Card className="p-3 mb-3">
                <RS.CardTitle tag="h2">Administrative tools</RS.CardTitle>
                <RS.CardBody>
                    <h3>Manage site content</h3>
                    {contentVersion && <React.Fragment>
                        <div>
                            <label htmlFor="content-version">
                                <strong>Live Content Version</strong>
                            </label>
                        </div>
                        <ShowLoading until={displayVersion !== null} render={() => {
                            return displayVersion !== null && updateState != ContentVersionUpdatingStatus.UPDATING &&
                                <RS.Form onSubmit={startVersionUpdate}>
                                    <RS.InputGroup>
                                        <RS.Input
                                            type="text" value={displayVersion}
                                            onChange={e => setNewVersion(e.target.value)}
                                            placeholder="Enter commit SHA"
                                        />
                                        <RS.InputGroupAddon addonType="append">
                                            <RS.Button
                                                type="button" className="p-0 border-dark"
                                                onClick={startVersionUpdate}
                                                disabled={displayVersion === contentVersion.liveVersion}
                                            >
                                                Set Version
                                            </RS.Button>
                                        </RS.InputGroupAddon>
                                    </RS.InputGroup>
                                </RS.Form>
                        }} />
                        {updateState == ContentVersionUpdatingStatus.UPDATING &&
                            <RS.Alert color="info">
                                <h4>Updating...</h4>
                                <p>Replacing version {contentVersion.liveVersion} with {contentVersion.updatingVersion}</p>
                                <RS.Spinner />
                            </RS.Alert>
                        }
                        {updateState == ContentVersionUpdatingStatus.SUCCESS &&
                            <RS.Alert color="success">
                                <h4>Content version changed successfully.</h4>
                            </RS.Alert>
                        }
                        {updateState == ContentVersionUpdatingStatus.FAILURE &&
                            <RS.Alert color="danger">
                                <h4>Error: Content version could not be changed.</h4>
                            </RS.Alert>
                        }
                    </React.Fragment>}
                </RS.CardBody>
            </RS.Card>

        </div>
    </RS.Container>;
};

export const Admin = connect(stateToProps, dispatchToProps)(AdminPageComponent);
