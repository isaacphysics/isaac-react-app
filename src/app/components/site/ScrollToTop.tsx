import React, { useCallback, useEffect } from "react";
import classNames from "classnames";
import { siteSpecific } from "../../services";
import { IconButton } from "../elements/AffixButton";

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

    return siteSpecific(
        <IconButton
            color="keyline" 
            icon="icon-chevron-up"
            className={classNames("scroll-btn d-print-none p-2", {"is-sticky": sticky})}
            onClick={() => mainContent.current?.scrollIntoView({behavior: 'smooth'})}
            tabIndex={sticky ? 0 : -1}
            aria-label="Scroll to top of page"
            data-bs-theme="neutral"
        />,
    
        <button 
            onClick={() => mainContent.current?.scrollIntoView({behavior: 'smooth'})} 
            className={classNames("scroll-btn d-print-none", {"is-sticky": sticky})}
            tabIndex={sticky ? 0 : -1}
        >
            <img src="/assets/common/icons/chevron-up.svg" alt="Scroll to top of page"/>
        </button>
    );
};
