import React from "react";
import {ActiveModalProps} from "../../../../IsaacAppTypes";
import {closeActiveModal, store} from "../../../state";
import {Button, Col, Row} from "reactstrap";
import { Trans } from "react-i18next";
import i18next from "i18next";

export const teacherEventConfirmationModal = (submitBooking: () => void, stopBooking: () => void): ActiveModalProps => ({
    closeAction: () => {store.dispatch(closeActiveModal());},
    body: <div className={"mb-4"}>
        <p><Trans i18nKey="common:events.confirmation.body" components={{ emphasis: <b /> }} /></p>
        <Row className={"d-flex justify-content-around mt-2"}>
            <Col className={"text-center"}>
                <Button onClick={() => {
                    submitBooking();
                    store.dispatch(closeActiveModal());
                }}>{i18next.t("common:events.confirmation.confirmButton")}</Button>
            </Col>
            <Col className={"text-center"}>
                <Button onClick={() => {
                    stopBooking();
                    store.dispatch(closeActiveModal());
                }}>{i18next.t("common:events.confirmation.declineButton")}</Button>
            </Col>
        </Row>
    </div>,
    title: i18next.t("common:events.confirmation.title")
});
