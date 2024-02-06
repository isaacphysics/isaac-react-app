import React from "react";
import {UserSummaryDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {
    authorisationsApi,
    closeActiveModal,
    store
} from "../../../state";
import * as RS from "reactstrap";
import {extractTeacherName, siteSpecific} from "../../../services";

export const tokenVerificationModal = (userId: number, authToken: string, usersToGrantAccess: UserSummaryWithEmailAddressDTO[]) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Sharing your data",
        body: <React.Fragment>
            <p>Are you sure you would like to give the following {siteSpecific("Isaac", "Ada")} users access to your data?</p>
            <RS.Table bordered>
                <tbody>
                    {usersToGrantAccess.map((member) => (<tr key={member.id}>
                        <td>
                            <span className="group-table-person" />
                            {extractTeacherName(member)} - ({member.email})
                        </td>
                    </tr>))}
                </tbody>
            </RS.Table>

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
            <RS.Button key={1} color="primary" outline onClick={() => {store.dispatch(closeActiveModal())}}>
                Cancel
            </RS.Button>,
            <RS.Button key={0} color="secondary" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.authenticateWithToken.initiate(authToken))
                    .then(() => store.dispatch(closeActiveModal()))
            }}>
                Confirm
            </RS.Button>,
        ]
    }
};

export const revocationConfirmationModal = (userId: number, userToRevoke: UserSummaryWithEmailAddressDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
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
            <RS.Button key={1} color="primary" outline onClick={() => {store.dispatch(closeActiveModal())}}>
                Cancel
            </RS.Button>,
            <RS.Button key={0} color="secondary" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.revokeAuthorisation.initiate(userToRevoke.id as number))
                    .then(() => store.dispatch(closeActiveModal()))
            }}>
                Confirm
            </RS.Button>,
        ]
    }
};

export const releaseConfirmationModal = (userId: number, otherUser: UserSummaryDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
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
            <RS.Button key={1} color="primary" outline onClick={() => {store.dispatch(closeActiveModal())}}>
                Cancel
            </RS.Button>,
            <RS.Button key={0} color="secondary" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.releaseAuthorisation.initiate(otherUser.id as number))
                    .then(() => store.dispatch(closeActiveModal()))
            }}>
                Confirm
            </RS.Button>,
        ]
    }
};

export const releaseAllConfirmationModal = () => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Remove access to all students' data",
        body: <React.Fragment>
            <p>
                Are you sure you want to end your access to all students&apos; data?
                <br />
                You will need to ask them to grant access again in the future if you change your mind.
            </p>
        </React.Fragment>,
        buttons: [
            <RS.Button key={1} color="primary" outline onClick={() => {store.dispatch(closeActiveModal())}}>
                Cancel
            </RS.Button>,
            <RS.Button key={0} color="secondary" onClick={() => {
                store.dispatch(authorisationsApi.endpoints.releaseAllAuthorisations.initiate())
                    .then(() => store.dispatch(closeActiveModal()))
            }}>
                Confirm
            </RS.Button>,
        ]
    }
};
