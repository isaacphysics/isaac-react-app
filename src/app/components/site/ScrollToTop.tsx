import React, {useEffect, useRef} from "react";

export const ScrollToTop = ({mainContent}: {mainContent: React.RefObject<any>}) => {
    const scrollButton = useRef(null);

    const isSticky = () => {
        const scrollTop = window.scrollY;
        // @ts-ignore
        scrollTop >= mainContent.current.offsetTop + 1 ? scrollButton.current.classList.add('is-sticky') : scrollButton.current.classList.remove('is-sticky');
    }

    const scroll = () => {
        mainContent.current.scrollIntoView({behavior: 'smooth'});
    }

    useEffect(() => {
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    });

    return <div ref={scrollButton} onClick={scroll} className="scroll-btn d-print-none">
        <button>
            <img src="/assets/common/icons/chevron-up.svg" alt="Scroll to top of page"/>
        </button>
    </div>
}