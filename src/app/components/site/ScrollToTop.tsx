import React, { useCallback, useEffect } from "react";
import classNames from "classnames";

export const ScrollToTop = ({mainContent}: {mainContent: React.MutableRefObject<HTMLElement | null>}) => {
    const [sticky, setSticky] = React.useState(false);

    const isSticky = useCallback(() => {
        setSticky(!!mainContent.current && window.scrollY >= mainContent.current.offsetHeight * 0.2);
    }, [mainContent]);

    useEffect(() => {
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, [isSticky]);

    return <button 
        onClick={() => mainContent.current?.scrollIntoView({behavior: 'smooth'})} 
        className={classNames("scroll-btn d-print-none", {"is-sticky": sticky})}
    >
        <img src="/assets/common/icons/chevron-up.svg" alt="Scroll to top of page"/>
    </button>;
};