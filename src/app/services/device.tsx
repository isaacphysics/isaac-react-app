const MOBILE_WINDOW_WIDTH = 768;

export const isMobile = () => {
    return window.innerWidth < MOBILE_WINDOW_WIDTH;
};
export const isNotMobile = !isMobile();

// TODO look at screen size methods so we dont hardcode
