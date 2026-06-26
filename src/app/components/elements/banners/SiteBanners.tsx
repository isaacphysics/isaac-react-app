import React from "react";
import { DismissibleBanner, DismissibleCookieBanner } from "./DismissibleBanner";
import { SiteBanner, useSiteBanners } from "../../../services/siteBanners";
import { isDefined } from "../../../services";

export const SiteBanners = () => {
    const siteBanners: SiteBanner[] = useSiteBanners();
    const now = new Date();

    return siteBanners.map((banner) => {
        if (
            (!isDefined(banner.startDate) || now >= banner.startDate) && 
            (!isDefined(banner.endDate) || now <= banner.endDate) &&
            banner.banner.show
        ) {
            switch (banner.banner.type) {
                case "dismissibleCookieBanner":
                    return <DismissibleCookieBanner key={banner.banner.cookieName} {...banner.banner} />;
                case "dismissibleBanner":
                    return <DismissibleBanner key={banner.banner.cookieName} {...banner.banner} />;
            }
        }
    });
};
