import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';

const WARNING_COOKIE = "warningBannerDismissed";

export const WarningBanner = () => {
    const [noCookie, setCookie] = useState(() => {
        const currentCookieValue = Cookies.get(WARNING_COOKIE);
        return currentCookieValue !== "1";
    });

    function clickDismiss() {
        setCookie(false);
        Cookies.set(WARNING_COOKIE, "1", {expires: 30 /* days*/});
    }

    const inDateRange = new Date("2022-12-19") <= new Date() && new Date() <= new Date("2023-01-02");

    return inDateRange ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="warning" className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center", textAlign: "center"}}>
                    <RS.Col xs={12} md={12}>
                        <span>
                            {"From 23rd Dec to 2nd Jan the Isaac team will be taking a festive break; you can too! "}
                            <a href={"/pages/isaac_festive_update"}>Find out more <span className="sr-only">about streak freezes and support over the festive period </span>here</a>.
                        </span>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
