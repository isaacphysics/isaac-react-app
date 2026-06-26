import classNames from "classnames";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { Alert, Button, Col, Row } from "reactstrap";
import { DismissibleBannerProps, DismissibleCookieBannerProps } from "../../../services/siteBanners";
import { useAppDispatch } from "../../../state";

// a banner type that tracks a cookie to determine whether it should be shown or not (so as to persist across page reloads and sessions)
export const DismissibleCookieBanner = (props: DismissibleCookieBannerProps) => {
    const { cookieName, cookieExpiry=720, children, dismissText, theme, onDismiss, ...rest } = props;
    const dispatch = useAppDispatch();

    const [show, setShown] = useState(() => {
        const currentCookieValue = Cookies.get(cookieName);
        return currentCookieValue != "1";
    });

    function clickDismiss() {
        setShown(false);
        Cookies.set(cookieName, "1", {expires: cookieExpiry /* days*/});
        onDismiss?.(dispatch);
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
                            <Button color="keyline" onClick={clickDismiss}>
                                {dismissText}
                            </Button>
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

// a banner type that can be dismissed in a session, but will reappear when state is lost (e.g. on page reload)
export const DismissibleBanner = (props: DismissibleBannerProps) => {
    const { children, dismissText, theme, onDismiss, ...rest } = props;
    const dispatch = useAppDispatch();
    const [show, setShown] = useState(true);

    function clickDismiss() {
        setShown(false);
        onDismiss?.(dispatch);
    }

    return show && <Alert 
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
                            <Button color="keyline" onClick={clickDismiss}>
                                {dismissText}
                            </Button>
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
