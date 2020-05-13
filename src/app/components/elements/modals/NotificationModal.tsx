import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {Button, Col, Row} from "reactstrap";
import {closeActiveModal} from "../../../state/actions";
import {store} from "../../../state/store";
import { api } from '../../../services/api';

const NotificationModalBody = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state: AppState) => state && state.notifications && state.notifications.notifications || undefined);
    const user = useSelector((state: AppState) => state && state.user || null);

    const currentNotification = notifications && notifications[0];

    function respond(response: string) {
        api.notifications.respond(currentNotification.id, response);
        dispatch(closeActiveModal());
        if (response == 'ACKNOWLEDGED' && currentNotification.externalReference.url) {
            var userIdToken = "{{currentUserId}}";

            // if they have a token representing the user id then replace it.
            if (currentNotification.externalReference.url.indexOf(userIdToken) != -1 && user && user.loggedIn) {
                var newUrl = currentNotification.externalReference.url.replace(userIdToken, user.id);

                window.open(newUrl, "_blank");
            }
        } else {
            window.open(currentNotification.externalReference.url, "_blank");
        }
    }

    return <React.Fragment>
        <Col>
            <Row className="justify-content-md-center">
                <Col>
                    {currentNotification ? currentNotification.value : "no content"}
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button
                        color="secondary" block onClick={() => respond("ACKNOWLEDGED")}
                    >
                        Yes, view questionnaire
                    </Button>
                </Col>
                <Col>
                    <Button
                        color="secondary" block
                        onClick={() => respond("DISABLED")}
                    >
                        No thanks
                    </Button>
                </Col>
                <Col>
                    <Button
                        color="secondary" block
                        onClick={() => respond("POSTPONED")}
                    >
                        Ask me later
                    </Button>
                </Col>
            </Row>
        </Col>
    </React.Fragment>
};

export const notificationModal = (notification: any) => {
    return {
        // closeAction: () => {store.dispatch(closeActiveModal())},
        title: notification.title,
        body: <NotificationModalBody/>
    }
};
