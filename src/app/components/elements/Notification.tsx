import React from 'react';
import { UserNotification } from '../../services';
import classNames from 'classnames';
import { Button } from 'reactstrap';
import { Link } from 'react-router';
import { Spacer } from './Spacer';

interface AdaNotificationProps extends React.HTMLAttributes<HTMLDivElement> {
    notification: UserNotification;
}

export const AdaNotification = ({ notification, ...rest }: AdaNotificationProps) => {
    return <div {...rest} className={classNames("alert alert-notification d-flex", rest.className)} role="alert">
        <i className="icon icon-md icon-notification me-3" aria-hidden="true" />
        <div className="d-flex flex-column flex-md-row w-100 gap-2">
            <div className="d-flex flex-column gap-2">
                <strong>{notification?.title}</strong> 
                {notification?.message}
            </div>
            <Spacer />
            {notification.button && <Button tag={Link} outline className="me-auto align-self-center" to={notification.button.link}>
                {notification.button.text}
            </Button>}
        </div>
    </div>;
};
