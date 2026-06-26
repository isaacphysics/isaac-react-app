import { AlertProps } from "reactstrap";
import { ReactNode } from "react";
import { AppDispatch } from "../state";
import { researchNotificationBanner } from "../components/elements/banners/ResearchNotificationBanner";
import { isaacScienceLaunchBanner } from "../components/elements/banners/IsaacScienceLaunchBanner";
import { downtimeWarningBanner } from "../components/elements/banners/DowntimeWarningBanner";
import { emailVerificationBanner } from "../components/elements/banners/EmailVerificationBanner";

interface BannerProps extends AlertProps {
    type: string;
    children: ReactNode;
    theme: "light" | "info" | "warning" | "danger";
}

export interface DismissibleBannerProps extends BannerProps {
    type: "dismissibleBanner"
    dismissText?: ReactNode; // undefined generates a close button
    onDismiss?: (dispatch: AppDispatch) => void;
}

export interface DismissibleCookieBannerProps extends BannerProps {
    type: "dismissibleCookieBanner",
    dismissText?: ReactNode; // undefined generates a close button
    onDismiss?: (dispatch: AppDispatch) => void;
    cookieName: string;
}

export interface SiteBanner {
    banner: DismissibleBannerProps | DismissibleCookieBannerProps;
    startDate?: Date;
    endDate?: Date;
}

export const useSiteBanners = () : SiteBanner[] => {
    return [
        {
            banner: isaacScienceLaunchBanner,
            endDate: new Date("2026-08-01T00:00:00Z"),
        },
        {
            banner: researchNotificationBanner,
        },
        {
            banner: downtimeWarningBanner,
            startDate: new Date("2023-01-01T00:00:00Z"),
            endDate: new Date("2023-01-01T00:00:00Z"),
        },
        {
            banner: emailVerificationBanner,
        },
    ];
};
