import React from 'react';
import {AppState, closeActiveModal, store, useAppDispatch, useAppSelector} from "../../../state";
import {Button, Col, Row} from "reactstrap";
import {api} from "../../../services";
import {IsaacContent} from "../../content/IsaacContent";
import { ActiveModalProps } from '../../../../IsaacAppTypes';
import { NotificationDTO } from '../../../../IsaacApiTypes';

const SurveyNotificationModalBody = (notification: { notification: NotificationDTO }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: AppState) => state && state.user || null);

    const currentNotification = notification.notification;

    async function respond(response: string) {
        if (!currentNotification.id) {
            return;
        }

        await api.notifications.respond(currentNotification.id, response);
        dispatch(closeActiveModal());
        if (response == 'ACKNOWLEDGED' && currentNotification.externalReference?.url) {
            const userIdToken = "{{currentUserId}}";

            // if they have a token representing the user id then replace it.
            if (currentNotification.externalReference.url.includes(userIdToken) && user && user.loggedIn && user.id) {
                const newUrl = currentNotification.externalReference.url.replace(userIdToken, `${user.id}`);
                window.open(newUrl, "_blank");
            } else {
                window.open(currentNotification.externalReference.url, "_blank");
            }
        }
    }

    return <React.Fragment>
        <Col>
            <Row className="justify-content-md-center mb-3">
                <Col>
                    {currentNotification ? <IsaacContent doc={currentNotification}/> : "Would you like to complete a survey?"}
                </Col>
            </Row>
            <Row className="mb-3">
                <Col className="d-inline-flex p-2">
                    <Button color="secondary" block onClick={() => respond("ACKNOWLEDGED")}>
                        Yes, view questionnaire
                    </Button>
                </Col>
                <Col className="d-inline-flex p-2">
                    <Button color="secondary" block onClick={() => respond("DISABLED")}>
                        No thanks
                    </Button>
                </Col>
                <Col className="d-inline-flex p-2">
                    <Button color="secondary" block onClick={() => respond("POSTPONED")}>
                        Ask me later
                    </Button>
                </Col>
            </Row>
        </Col>
    </React.Fragment>;
};

export const surveyNotificationModal = (notification: ActiveModalProps) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: notification.title,
        body: <SurveyNotificationModalBody notification={notification}/>
    };
};
