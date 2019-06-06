import React from "react";
import {UserSummaryWithEmailAddressDTO} from "../../../IsaacApiTypes";
import {applyToken, closeActiveModal, revokeAuthorisation} from "../../state/actions";
import {store} from "../../state/store";
import * as RS from "reactstrap";
import {extractTeacherName} from "../../services/role";

export const tokenVerificationModal = (authToken: string, usersToGrantAccess: UserSummaryWithEmailAddressDTO[]) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Sharing your data",
        body: <React.Fragment>
            <p>Are you sure you would like to give the following Isaac users access to your data?</p>
            <table className="group-table">
                <tbody>
                    {usersToGrantAccess.map((member) => (<tr key={member.id}>
                        <td>
                            <span className="group-table-person" />
                            {extractTeacherName(member)} - ({member.email})
                        </td>
                    </tr>))}
                </tbody>
            </table>

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
                    <strong>Remember</strong>: you can always revoke access to your data from the Teacher Connections tab on this page.
                </small>
                <br />
                <small>
                    For more details about what information is shared, see our {" "}
                    <a href="/privacy" target="_blank">Privacy Policy</a>.
                </small>
            </p>
        </React.Fragment>,
        buttons: [
            <RS.Button key={0} color="secondary" onClick={() => {store.dispatch(applyToken(authToken))}}>
                Confirm
            </RS.Button>,
            <RS.Button key={1} color="primary" outline onClick={() => {store.dispatch(closeActiveModal())}}>
                Cancel
            </RS.Button>
        ]
    }
};

export const revocationConfirmationModal = (userToRevoke: UserSummaryWithEmailAddressDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Revoke access to your data",
        body: <React.Fragment>
            <div className="reveal-modal-body ru-page-heading">
                <p>
                    The user <strong>{extractTeacherName(userToRevoke)}</strong>
                    {" "}
                    will no longer be able to access your data.
                </p>
                <p>Are you sure you want to revoke access for this user?</p>
            </div>
        </React.Fragment>,
        buttons: [
            <RS.Button key={0} color="secondary" onClick={() => {store.dispatch(revokeAuthorisation(userToRevoke))}}>
                Confirm
            </RS.Button>,
            <RS.Button key={1} color="primary" outline onClick={() => {store.dispatch(closeActiveModal())}}>
                Cancel
            </RS.Button>
        ]
    }
};
