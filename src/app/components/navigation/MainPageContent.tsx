import React, {useEffect, useRef} from "react";
import {withRouter} from "react-router";

interface MainContent {
    children?: React.ReactChildren;
    history: {location: {pathname: string}};
}
export const MainPageContent = withRouter(({children, history: {location: pathname}}: MainContent) => {
    const main = useRef<HTMLMainElement>(null);
    useEffect(() => {
        if (main.current) {
            main.current.focus();
            window.scrollTo({top: 0, left: 0, behavior: "auto"});
        }
    }, [pathname]);

    return <main role="main" id="main" className="flex-fill content-body" ref={main} tabIndex={-1} aria-labelledby="page-heading">
        {children}
    </main>
});
