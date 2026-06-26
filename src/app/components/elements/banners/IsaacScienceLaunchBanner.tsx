import React from "react";
import { Link } from "react-router-dom";
import { DismissibleCookieBannerProps } from "../../../services/siteBanners";
import { isPhy } from "../../../services";

const IsaacScienceLaunchBannerBody = () => {
    return <>
        Isaac Science is the new home of Isaac Physics.{" "}
        If you haven&apos;t already, please <Link to="/pages/isaacscience" target="_blank" className="d-inline">read more about how the change <span className="visually-hidden">to Isaac Science</span> might affect you</Link>.
    </>;
};

export const useIsaacScienceLaunchBanner = () : DismissibleCookieBannerProps => {
    return {
        type: "dismissibleCookieBanner",
        cookieName: "isaacScienceLaunchBannerDismissed",
        theme: "info",
        children: <IsaacScienceLaunchBannerBody />,
        show: isPhy,
    };
};
