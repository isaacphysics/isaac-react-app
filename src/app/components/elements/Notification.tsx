import React from 'react';
import { UserNotification } from '../../services';
import classNames from 'classnames';
import { Button } from 'reactstrap';
import { Link } from 'react-router';

interface AdaNotificationProps extends React.HTMLAttributes<HTMLDivElement> {
    notification: UserNotification;
}

export const AdaNotification = ({ notification, ...rest }: AdaNotificationProps) => {
    return <div {...rest} className={classNames("alert alert-notification d-flex", rest.className)} role="alert">
        <div className="d-flex flex-column gap-2">
            <strong>{notification?.title}</strong> 
            {notification?.message}
        </div>
        {notification.button && <Button tag={Link} outline className="ms-auto align-self-center" to={notification.button.link}>
            {notification.button.text}
        </Button>}
    </div>;
};
