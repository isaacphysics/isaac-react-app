import React from "react";
import { Link } from "react-router-dom";
import { isPhy } from "../../../services";
import { DismissibleCookieBanner } from "./DismissibleBanner";

const IsaacScienceLaunchBannerBody = () => {
    return <>
        Isaac Science is the new home of Isaac Physics.{" "}
        If you haven&apos;t already, please <Link to="/pages/isaacscience" target="_blank" className="d-inline">read more about how the change <span className="visually-hidden">to Isaac Science</span> might affect you</Link>.
    </>;
};

export const IsaacScienceLaunchBanner = () => {
    return <DismissibleCookieBanner 
        cookieName="isaacScienceLaunchBannerDismissed"
        theme="info"
        show={isPhy}
    >
        <IsaacScienceLaunchBannerBody />
    </DismissibleCookieBanner>;
};
