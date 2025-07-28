import React from "react";
import { DismissibleBanner } from "./DismissibleBanner";
import { Link } from "react-router-dom";
import { isPhy } from "../../services";

export const IsaacScienceLaunchBanner = () => {
    return isPhy && <DismissibleBanner cookieName="isaacScienceLaunchBannerDismissed" theme="info">
        Isaac Science is the new home of Isaac Physics.{" "}
        If you haven&apos;t already, please <Link to="/pages/isaacscience" target="_blank" className="d-inline">read more about how the change might affect you</Link>.
    </DismissibleBanner>;
};
