import {useEffect, useState} from "react";

const MOBILE_WINDOW_WIDTH = 768;

export const isMobile = () => {
    return window.innerWidth < MOBILE_WINDOW_WIDTH;
};
export const isNotMobile = !isMobile();

export type DeviceSize = "xl" | "lg" | "md" | "sm" | "xs";
export const useDeviceSize = () => {
    const getSize = (): DeviceSize => {
        const width = window.innerWidth;
        if (width >= 1200) return "xl";
        else if (width >= 992) return "lg";
        else if (width >= 768) return "md";
        else if (width >= 576) return "sm";
        else return "xs";
    };

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
        const handleResize = () => {setWindowSize(getSize())};
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};
