import {useEffect, useState} from "react";

const MOBILE_WINDOW_WIDTH = 768;

export const isMobile = () => {
    return window.innerWidth < MOBILE_WINDOW_WIDTH;
};
export const isNotMobile = !isMobile();

export enum DeviceSize {
    XL = "xl",
    LG = "lg",
    MD = "md",
    SM = "sm",
    XS = "xs",
}

const descDeviceSizes = [DeviceSize.XL, DeviceSize.LG, DeviceSize.MD, DeviceSize.SM, DeviceSize.XS];

export const useDeviceSize = () => {
    const getSize = (): DeviceSize => {
        const width = window.innerWidth;
        if (width >= 1200) return DeviceSize.XL;
        else if (width >= 992) return DeviceSize.LG;
        else if (width >= 768) return DeviceSize.MD;
        else if (width >= 576) return DeviceSize.SM;
        else return DeviceSize.XS;
    };

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
        const handleResize = () => {setWindowSize(getSize())};
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

// above(ds) and below(ds) return true if device size === ds to match the scss functions respond-above(ds) and respond-below(ds)
const seenSoFar: DeviceSize[] = [];
export const above: {[ds in DeviceSize]: (currentDS: DeviceSize) => boolean} = Object.fromEntries(
    descDeviceSizes.map(ds => {
        seenSoFar.push(ds);
        return [
            [ds],
            function(greaterThanDSs: DeviceSize[], currentDS: DeviceSize) {
                return greaterThanDSs.includes(currentDS);
            }.bind(null, [...seenSoFar])
        ];
    })
);
export const below: {[ds in DeviceSize]: (currentDS: DeviceSize) => boolean} = Object.fromEntries(
    descDeviceSizes.map(ds => {
        if (seenSoFar[0] !== ds) {
            seenSoFar.shift();
        }
        return [
            [ds],
            function(lessThanDSs: DeviceSize[], currentDS: DeviceSize) {
                return lessThanDSs.includes(currentDS);
            }.bind(null, [...seenSoFar])
        ];
    })
);
