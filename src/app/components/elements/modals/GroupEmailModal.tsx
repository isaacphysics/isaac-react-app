import {store} from "../../../state/store";
import {closeActiveModal} from "../../../state/actions";
import React from "react";
import {Col, Row} from "reactstrap";

interface GroupEmailModalProps {
    users?: number[];
}

const CurrentGroupEmailModal = ({users}: GroupEmailModalProps) => {
    return <React.Fragment>
        <Col>
            <Row className="mb-3">
                {users && users.join(", ")}
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
