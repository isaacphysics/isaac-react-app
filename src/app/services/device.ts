import {useEffect, useState} from "react";
import { siteSpecific } from "./siteConstants";
import { isAda } from "./siteConstants";

const MOBILE_WINDOW_WIDTH = 768;

export const isMobile = () => {
    return window.innerWidth < MOBILE_WINDOW_WIDTH;
};
export const isNotMobile = !isMobile();

export const isTouchDevice = () => {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && navigator.maxTouchPoints != 256);
};

export const isNotTouchDevice = () => !isTouchDevice();

export enum DeviceSize {
    XXXL = "3xl",
    XXL = "xxl",
    XL = "xl",
    LG = "lg",
    MD = "md",
    SM = "sm",
    XS = "xs",
}

export enum DeviceOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape",
}

const descDeviceSizes = [DeviceSize.XXXL, DeviceSize.XXL, DeviceSize.XL, DeviceSize.LG, DeviceSize.MD, DeviceSize.SM, DeviceSize.XS];

export const useDeviceSize = () => {
    const getSize = (): DeviceSize => {
        const shouldIncludeSidebar = isAda && window.innerWidth >= 768;
        const width = window.innerWidth - (shouldIncludeSidebar ? 220 : 0);
        if (width >= 1800) return DeviceSize.XXXL;
        else if (width >= 1400) return DeviceSize.XXL;
        else if (width >= 1200) return DeviceSize.XL;
        else if (width >= 992) return DeviceSize.LG;
        else if (width >= 768) return DeviceSize.MD;
        else if (width >= 576) return DeviceSize.SM;
        else return DeviceSize.XS;
    };

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
        const handleResize = () => {setWindowSize(getSize());};
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

export const useDeviceHeight = () => {
    const getHeight = (): DeviceSize => {
        const height = window.innerHeight;
        if (height >= 1800) return DeviceSize.XXXL;
        else if (height >= 1400) return DeviceSize.XXL;
        else if (height >= 1200) return DeviceSize.XL;
        else if (height >= 992) return DeviceSize.LG;
        else if (height >= 768) return DeviceSize.MD;
        else if (height >= 576) return DeviceSize.SM;
        else return DeviceSize.XS;
    };

    const [windowHeight, setWindowHeight] = useState(getHeight);

    useEffect(() => {
        const handleResize = () => {setWindowHeight(getHeight());};
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowHeight;
};

export const useNavbarExpanded = () => {
    // nav uses a separate breakpoint in the CSS, which doesn't align with the ordered structure of DeviceSize,
    // hence the need for a separate hook
    const isExpanded = (): boolean => {
        const width = window.innerWidth;
        return width >= siteSpecific(992, 1256);
    };

    const [navbarExpanded, setNavbarExpanded] = useState(isExpanded);
    
    useEffect(() => {
        const handleResize = () => {setNavbarExpanded(isExpanded());};
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return navbarExpanded;
};

// above(ds) and below(ds) return true if device size === ds to match the scss functions respond-above(ds) and respond-below(ds)
const seenSoFar: DeviceSize[] = [];
export const above = descDeviceSizes.reduce((map: {[ds: string]: (currentDS: DeviceSize) => boolean}, deviceSize: DeviceSize) => {
    // push yourself to the list of device sizes greater or equal than deviceSize
    seenSoFar.push(deviceSize);
    map[deviceSize] = function(greaterThanDSs: DeviceSize[], currentDS: DeviceSize) {
        return greaterThanDSs.includes(currentDS);
    }.bind(null, [...seenSoFar]);
    return map;
}, {});
export const below = descDeviceSizes.reduce((map: {[ds: string]: (currentDS: DeviceSize) => boolean}, deviceSize: DeviceSize) => {
    // if the largest item on the (reversed) stack is not yourself pop
    if (seenSoFar[0] !== deviceSize) { seenSoFar.shift(); }
    map[deviceSize] = function(greaterThanDSs: DeviceSize[], currentDS: DeviceSize) {
        return greaterThanDSs.includes(currentDS);
    }.bind(null, [...seenSoFar]);
    return map;
}, {});
