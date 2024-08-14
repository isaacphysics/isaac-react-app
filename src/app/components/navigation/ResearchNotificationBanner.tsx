import React, {useState} from 'react';
import {Link} from "react-router-dom";
import * as RS from 'reactstrap';
import Cookies from 'js-cookie';
import {logAction, useAppDispatch} from "../../state";
import {isAda, isPhy, siteSpecific} from "../../services";

const RESEARCH_NOTIFICATION_COOKIE = "researchNotificationDismissed";

export const ResearchNotificationBanner = () => {
    const dispatch = useAppDispatch();
    const [show, setShown] = useState(() => {
        const currentCookieValue = Cookies.get(RESEARCH_NOTIFICATION_COOKIE);
        return currentCookieValue != "1";
    });

    function clickDismiss() {
        setShown(false);
        Cookies.set(RESEARCH_NOTIFICATION_COOKIE, "1", {expires: 720 /* days*/});
        const eventDetails = {type: "RESEARCH_NOTIFICATION_DISMISSED"};
        dispatch(logAction(eventDetails));
    }

    return show ? <div className="banner d-print-none" id="research-banner">
        <RS.Container className="py-3">
            <RS.Row style={{alignItems: "center"}}>
                <RS.Col xs={12} sm={2} md={1}>
                    <h3 className="text-center">
                        <span role="presentation" aria-labelledby="research-heading">
                            <img className={siteSpecific("mt-n2 mt-sm-0 mt-md-n1", "mt-n1 mt-sm-1")} src="/assets/common/icons/info.svg" style={{height: "1.5rem"}} alt="" />
                        </span>
                        <span id="research-heading" className="d-inline-block d-sm-none">&nbsp;Research</span>
                    </h3>
                </RS.Col>
                <RS.Col xs={12} sm={10} md={8}>
                    <small>
                        Use of this website and the information entered is being recorded.
                        This data is used to support research into online learning at the University of Cambridge{isAda ? " and the Raspberry Pi Foundation" : ""}.
                        Full details are in the <Link to="/privacy">privacy policy</Link>.
                    </small>
                </RS.Col>
                <RS.Col xs={12} md={3} className="text-center">
                    <RS.Button color="primary" outline={isPhy} className="mt-3 mb-2 d-block d-md-inline-block banner-button" onClick={clickDismiss}>
                        Got it
                    </RS.Button>
                </RS.Col>
            </RS.Row>
        </RS.Container>
    </div>: null;
};
