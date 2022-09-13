import {closeActiveModal, store} from "../../../state";
import React from "react";
import {Col, Row} from "reactstrap";

interface GroupEmailModalProps {
    users?: number[];
}

const CurrentGroupEmailModal = ({users}: GroupEmailModalProps) => {
    return <React.Fragment>
        <Col>
            <Row>
                {"An admin user can use the user IDs below to email these users:"}
            </Row>
            <Row className="my-3">
                <pre>
                    {users && users.sort((a, b) => a - b).join(",")}
                </pre>
            </Row>
        </Col>
    </React.Fragment>;
};

export const groupEmailModal = (users?: number[]) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Email Users",
        body: <CurrentGroupEmailModal users={users} />
    }
};
