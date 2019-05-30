interface deviceProps {
    setMenuOpen: (isOpen: boolean) => void;
    menuOpen: boolean;
}

const MOBILE_WINDOW_WIDTH = 768;

export const deviceSizeMenu = ({setMenuOpen, menuOpen}: deviceProps) => {
    setMenuOpen((window.innerWidth < MOBILE_WINDOW_WIDTH) ? !menuOpen : true);
};

export const isNotMobile = () => {
    return window.innerWidth >= MOBILE_WINDOW_WIDTH;
};

// TODO look at screen size methods so we dont hardcode
