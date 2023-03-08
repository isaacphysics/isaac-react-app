import React, {useEffect, useState} from 'react';
import {
    getContentVersion,
    requestConstantsSegueVersion,
    selectors,
    setContentVersion,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {ContentVersionUpdatingStatus, EDITOR_COMPARE_URL, isAdmin, isPhy} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classnames from "classnames";
import {AnonymiseUsersCheckbox} from "../elements/AnonymiseUsersCheckbox";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {MisuseStats} from "../elements/MisuseStats";
import classNames from "classnames";

export const Admin = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const segueVersion = useAppSelector(selectors.segue.versionOrUnknown);
    const contentVersion = useAppSelector(selectors.segue.contentVersion);
    useEffect(() => {
        dispatch(getContentVersion());
        dispatch(requestConstantsSegueVersion());
    }, [dispatch]);

    const [newVersion, setNewVersion] = useState<string | null>(null);

    const displayVersion = newVersion || (contentVersion && contentVersion.liveVersion) || null;

    const startVersionUpdate = function(event?: React.FormEvent) {
        if (event) {
            event.preventDefault();
        }
        if (contentVersion && displayVersion !== contentVersion.liveVersion && newVersion != null) {
            dispatch(setContentVersion(newVersion));
        }
    };

    const updateState = contentVersion && contentVersion.updateState || null;

    return <RS.Container id="admin-page">
        <TitleAndBreadcrumb currentPageTitle="Isaac administration" breadcrumbTitleOverride="Admin tools" />

        <div className="py-4">

            Hi, {user.givenName}!

            <RS.Card className="p-3 my-3">
                <RS.CardTitle tag="h2">Useful links</RS.CardTitle>
                <RS.ListGroup className="flex-row">
                    <RS.ListGroupItem className="w-auto"><Link to="/admin/usermanager">User Manager</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/admin/emails">Admin emails</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/equality">Equation builder</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/free_text">Free-text builder</Link></RS.ListGroupItem>
                    <RS.ListGroupItem className="w-auto"><Link to="/markdown">Markdown builder</Link></RS.ListGroupItem>
                </RS.ListGroup>
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
                            <strong>Live Content Version</strong>
                        </div>
                        <ShowLoading until={displayVersion !== null} thenRender={() => {
                            return displayVersion !== null && updateState != ContentVersionUpdatingStatus.UPDATING &&
                                <RS.Form onSubmit={startVersionUpdate}>
                                    <RS.InputGroup>
                                        <RS.Input
                                            aria-label="Live content commit SHA"
                                            type="text" value={displayVersion}
                                            onChange={e => setNewVersion(e.target.value)}
                                            placeholder="Enter commit SHA"
                                        />
                                        <RS.InputGroupAddon addonType="append">
                                            <a
                                                className={classnames("btn btn-secondary", {
                                                    "p-1 border-dark": isPhy,
                                                    "disabled": displayVersion === contentVersion.liveVersion
                                                })}
                                                href={`${EDITOR_COMPARE_URL}/${contentVersion?.liveVersion}/${displayVersion}`}
                                                target="_blank" rel="noopener"
                                            >
                                                Preview Changes
                                            </a>
                                        </RS.InputGroupAddon>
                                        <RS.InputGroupAddon addonType="append">
                                            <RS.Button
                                                type="button" className={classNames("py-0", {"px-0 border-dark": isPhy})}
                                                onClick={startVersionUpdate}
                                                disabled={!isAdmin(user) || displayVersion === contentVersion.liveVersion}
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
                                <IsaacSpinner />
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

                    <h3 className={"mt-3"}>Demonstration Mode</h3>
                    <AnonymiseUsersCheckbox/>

                    {isAdmin(user) && <>
                        <h3 className={"mt-3"}>Misuse statistics</h3>
                        <MisuseStats/>
                    </>}
                </RS.CardBody>
            </RS.Card>

        </div>
    </RS.Container>;
};
