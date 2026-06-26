import { AlertProps } from "reactstrap";
import { ReactNode } from "react";
import { useResearchNotificationBanner } from "../components/elements/banners/ResearchNotificationBanner";
import { useIsaacScienceLaunchBanner } from "../components/elements/banners/IsaacScienceLaunchBanner";
import { useDowntimeWarningBanner } from "../components/elements/banners/DowntimeWarningBanner";
import { useEmailVerificationBanner } from "../components/elements/banners/EmailVerificationBanner";

interface BannerProps extends AlertProps {
    type: string;
    children: ReactNode;
    theme: "light" | "info" | "warning" | "danger";
    show: boolean;
}

export interface DismissibleBannerProps extends BannerProps {
    type: "dismissibleBanner"
    dismissText?: ReactNode; // undefined generates a close button
    onDismiss?: () => void;
}

// this can't extend the above as using e.g. Omit<> to remove the "type" temporarily breaks type checking of other props (not sure why?)
export interface DismissibleCookieBannerProps extends BannerProps {
    type: "dismissibleCookieBanner",
    dismissText?: ReactNode; // undefined generates a close button
    onDismiss?: () => void;
    cookieName: string;
    cookieExpiry?: number; // in days, default 720 (2 years)
}

export interface SiteBanner {
    banner: DismissibleBannerProps | DismissibleCookieBannerProps;
    startDate?: Date;
    endDate?: Date;
}

export const useSiteBanners = () : SiteBanner[] => {
    const isaacScienceLaunchBanner = useIsaacScienceLaunchBanner();
    const researchNotificationBanner = useResearchNotificationBanner();
    const downtimeWarningBanner = useDowntimeWarningBanner();
    const emailVerificationBanner = useEmailVerificationBanner();
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
