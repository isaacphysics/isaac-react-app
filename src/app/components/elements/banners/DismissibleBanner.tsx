import classNames from "classnames";
import Cookies from "js-cookie";
import React, { ReactNode, useState } from "react";
import { Alert, AlertProps, Col, Row } from "reactstrap";

interface DismissibleBannerProps extends AlertProps {
    cookieName: string;
    dismissText?: string; // undefined generates a close button
    children: ReactNode;
    theme: "light" | "info" | "warning" | "danger";
}

export const DismissibleBanner = (props: DismissibleBannerProps) => {
    const { cookieName, children, dismissText, theme, ...rest } = props;

    const [show, setShown] = useState(() => {
        const currentCookieValue = Cookies.get(cookieName);
        return currentCookieValue != "1";
    });

    function clickDismiss() {
        setShown(false);
        Cookies.set(cookieName, "1", {expires: 720 /* days*/});
    }

    if (!show) {
        return null;
    }

    return <Alert 
        {...rest}
        color={theme} 
        className={classNames("mb-0 border-radius-0 mx-0 px-5 no-print", {"d-flex align-items-center": !dismissText})} 
        fade={false} 
        toggle={!dismissText ? clickDismiss : undefined} 
        closeClassName="py-2 px-4 position-static order-1">
        <div className="container">
            <Row className="align-items-center">
                {dismissText 
                    ? <>
                        <Col xs={12} md={9}>
                            {children}
                        </Col>
                        <Col xs={12} md={3} className="text-center">
                            <button className="btn btn-primary" onClick={clickDismiss}>
                                {dismissText}
                            </button>
                        </Col>
                    </>
                    : <Col className="text-center">
                        {children}
                    </Col>
                }
            </Row>
        </div>
    </Alert>;
};
