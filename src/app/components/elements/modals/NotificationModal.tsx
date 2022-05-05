import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {Button, Col, Row} from "reactstrap";
import {closeActiveModal} from "../../../state/actions";
import {store} from "../../../state/store";
import {IsaacContent} from "../../content/IsaacContent";
import {isaacApi} from "../../../state/slices/api";

const NotificationModalBody = (notification: { notification: any }) => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user || null);
    const [ respondToNotification ] =  isaacApi.endpoints.respondToNotification.useMutation();

    const currentNotification = notification.notification;

    function respond(response: string) {
        respondToNotification({id: currentNotification.id, response});
        dispatch(closeActiveModal());
        if (response == 'ACKNOWLEDGED' && currentNotification.externalReference.url) {
            const userIdToken = "{{currentUserId}}";

            // if they have a token representing the user id then replace it.
            if (currentNotification.externalReference.url.includes(userIdToken) && user && user.loggedIn) {
                const newUrl = currentNotification.externalReference.url.replace(userIdToken, user.id);
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
    </React.Fragment>
};

export const notificationModal = (notification: any) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: notification.title,
        body: <NotificationModalBody notification={notification}/>
    }
};
