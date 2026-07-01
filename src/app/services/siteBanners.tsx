import React, { ReactNode } from "react";
import { AlertProps } from "reactstrap";
import { ResearchNotificationBanner } from "../components/elements/banners/ResearchNotificationBanner";
import { DowntimeWarningBanner } from "../components/elements/banners/DowntimeWarningBanner";
import { EmailVerificationBanner } from "../components/elements/banners/EmailVerificationBanner";
import { IsaacScienceLaunchBanner } from "../components/elements/banners/IsaacScienceLaunchBanner";

interface BannerProps extends AlertProps {
    theme: "light" | "info" | "warning" | "danger";
    show: boolean;
}

export interface DismissibleBannerProps extends BannerProps {
    dismissText?: ReactNode; // undefined generates a close button
    onDismiss?: () => void;
}

// this can't extend the above as using e.g. Omit<> to remove the "type" temporarily breaks type checking of other props (not sure why?)
export interface DismissibleCookieBannerProps extends BannerProps {
    dismissText?: ReactNode; // undefined generates a close button
    onDismiss?: () => void;
    cookieName: string;
    cookieExpiry?: number; // in days, default 720 (2 years)
}

export interface SiteBanner {
    banner: ReactNode;
    startDate?: Date;
    endDate?: Date;
}

export const useSiteBanners = () : SiteBanner[] => {
    return [
        {
            banner: <IsaacScienceLaunchBanner />,
            endDate: new Date("2026-08-01T00:00:00Z"),
        },
        {
            banner: <ResearchNotificationBanner />,
        },
        {
            banner: <DowntimeWarningBanner />,
            startDate: new Date("2023-01-01T00:00:00Z"),
            endDate: new Date("2023-01-01T00:00:00Z"),
        },
        {
            banner: <EmailVerificationBanner />,
        },
    ];
};
