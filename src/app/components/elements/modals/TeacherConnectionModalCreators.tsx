import React from "react";
import {UserSummaryDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {
    authorisationsApi,
    closeActiveModal,
    store
} from "../../../state";
import {extractTeacherName, SITE_TITLE_SHORT, siteSpecific} from "../../../services";
import { Table, Button } from "reactstrap";

export const tokenVerificationModal = (userId: number, authToken: string, usersToGrantAccess: UserSummaryWithEmailAddressDTO[]) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: "Sharing your data",
        body: <React.Fragment>
            <p>Are you sure you would like to give the following {SITE_TITLE_SHORT} users access to your data?</p>
            <Table bordered>
                <tbody>
                    {usersToGrantAccess.map((member) => (<tr key={member.id}>
                        <td>
                            <span className="group-table-person" />
                            {extractTeacherName(member)} - ({member.email})
                        </td>
                    </tr>))}
                </tbody>
            </Table>

            {/* TODO Highlight already authorised teachers */}
            {/*{anyUsersAlreadyAuthorised && <p>*/}
            {/*    <small>*/}
            {/*        Teachers you are already sharing some data with are highlighted in green. If you have been asked to re-enter this group code;*/}
            {/*        the teachers not highlighted have been added since you joined the group. If this is a group code you&apos;ve not used before,*/}
            {/*        you need to confirm joining this group with all of these teachers.*/}
            {/*    </small>*/}
            {/*</p>}*/}

            <p>
                <small>
                    <strong>Remember</strong>: you can always revoke access to your data from the Teacher Connections tab of My Account.
                </small>
                <br />
                <small>
                    For more details about what information is shared, see our {" "}
                    <a href="/privacy" target="_blank">Privacy Policy</a>.
                </small>
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color={siteSpecific("solid", "keyline")} onClick={() => {store.dispatch(closeActiveModal());}}>
                Cancel
            </Button>,
            <Button key={0} color={siteSpecific("keyline", "solid")} onClick={() => {
                store.dispatch(authorisationsApi.endpoints.authenticateWithToken.initiate(authToken))
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                Confirm
            </Button>,
        ]
    };
};

export const revocationConfirmationModal = (userId: number, userToRevoke: UserSummaryWithEmailAddressDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: "Revoke access to your data",
        body: <React.Fragment>
            <p>
                The user <strong>{extractTeacherName(userToRevoke)}</strong>
                {" "}
                will no longer be able to access your data.
                <br />
                Are you sure you want to revoke access for this user?
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color={siteSpecific("solid", "keyline")} onClick={() => {store.dispatch(closeActiveModal());}}>
                Cancel
            </Button>,
            <Button key={0} color={siteSpecific("keyline", "solid")} onClick={() => {
                store.dispatch(authorisationsApi.endpoints.revokeAuthorisation.initiate(userToRevoke.id as number))
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                Confirm
            </Button>,
        ]
    };
};

export const releaseConfirmationModal = (userId: number, otherUser: UserSummaryDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: "Remove access to students' data",
        body: <React.Fragment>
            <p>
                Are you sure you want to end your access to <strong>{otherUser.givenName} {otherUser.familyName}</strong>
                &apos;s data?
                <br />
                You will need to ask them to grant access again in the future if you change your mind.
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color={siteSpecific("solid", "keyline")} onClick={() => {store.dispatch(closeActiveModal());}}>
                Cancel
            </Button>,
            <Button key={0} color={siteSpecific("keyline", "solid")} onClick={() => {
                store.dispatch(authorisationsApi.endpoints.releaseAuthorisation.initiate(otherUser.id as number))
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                Confirm
            </Button>,
        ]
    };
};

export const releaseAllConfirmationModal = () => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: "Remove access to all students' data",
        body: <React.Fragment>
            <p>
                Are you sure you want to end your access to all students&apos; data?
                <br />
                You will need to ask them to grant access again in the future if you change your mind.
            </p>
        </React.Fragment>,
        buttons: [
            <Button key={1} color={siteSpecific("solid", "keyline")} onClick={() => {store.dispatch(closeActiveModal());}}>
                Cancel
            </Button>,
            <Button key={0} color={siteSpecific("keyline", "solid")} onClick={() => {
                store.dispatch(authorisationsApi.endpoints.releaseAllAuthorisations.initiate())
                    .then(() => store.dispatch(closeActiveModal()));
            }}>
                Confirm
            </Button>,
        ]
    };
};

export const confirmSelfRemovalModal = (userId: number, groupId: number) => {
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: "Leave group",
        body: <>
            <p>
                This group has enabled student self-removal. This means you can remove yourself from the group at any time, without requiring permission from 
                the owner(s) of the group. If you remove yourself, you will no longer receive assignments.
                <br/><br/>
                Note that if you have granted the group owner(s) access to your data, they can still view this data after you have left the group. To revoke 
                this access, use the Teacher Connections panel at the top of this page.
                <br/><br/>
                You can rejoin at any time using the code or link you used to join the group. Your progress, assignments and test scores will be retained.
            </p>
        </>,
        buttons: [
            <Button key={1} color={siteSpecific("solid", "keyline")} onClick={() => store.dispatch(closeActiveModal())}>
                Cancel
            </Button>,
            <Button key={0} color={siteSpecific("keyline", "solid")} onClick={() => {
                store.dispatch(authorisationsApi.endpoints.deleteGroupMember.initiate({groupId, userId})).then(() => {
                    store.dispatch(closeActiveModal());
                });
            }}>
                Leave group
            </Button>,
        ]
    };
};
