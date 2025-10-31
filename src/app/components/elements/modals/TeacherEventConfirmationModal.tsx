import React from "react";
import {ActiveModalProps} from "../../../../IsaacAppTypes";
import {closeActiveModal, store} from "../../../state";
import {Button, Col, Row} from "reactstrap";

export const teacherEventConfirmationModal = (submitBooking: () => void, stopBooking: () => void): ActiveModalProps => ({
    closeAction: () => {store.dispatch(closeActiveModal());},
    body: <div className={"mb-4"}>
        <p>This is an event for <b>teachers only</b>. Please confirm that you are a teacher (or a teacher trainee), and not a student, private tutor or parent.</p>
        <Row className={"d-flex justify-content-around mt-2"}>
            <Col className={"text-center"}>
                <Button onClick={() => {
                    submitBooking();
                    store.dispatch(closeActiveModal());
                }}>I am a teacher</Button>
            </Col>
            <Col className={"text-center"}>
                <Button onClick={() => {
                    stopBooking();
                    store.dispatch(closeActiveModal());
                }}>I am not a teacher</Button>
            </Col>
        </Row>
    </div>,
    title: "Please confirm teacher status"
});
