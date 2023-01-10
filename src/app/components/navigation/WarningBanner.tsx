import React, {useState} from 'react';
import * as RS from 'reactstrap';
import {Alert} from 'reactstrap';
import Cookies from 'js-cookie';
import {SITE_SUBJECT_TITLE} from "../../services";

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

    const inDateRange = new Date("2022-01-09") <= new Date() && new Date() <= new Date("2023-01-14");

    return inDateRange ? <div className="banner d-print-none" id="downtime-banner">
        <Alert color="warning" className="mb-0">
            <RS.Container>
                <RS.Row style={{alignItems: "center", textAlign: "center"}}>
                    <RS.Col xs={12} md={12}>
                        <span>
                            {`On 13 Jan, there is a slightly increased chance that Isaac ${SITE_SUBJECT_TITLE} will be unavailable for a period due to maintenance work.`}
                        </span>
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </Alert>
    </div>: null;
};
