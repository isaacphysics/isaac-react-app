import React, { useEffect } from "react";
import ReactGA, { FieldsObject } from "react-ga";
import { RouteComponentProps } from "react-router";

function getDisplayName(WrappedComponent: any) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

ReactGA.initialize("UA-137475074-1");
ReactGA.set({ anonymizeIp: true });

export const withTracker = <P extends RouteComponentProps>(
    WrappedComponent: React.ComponentType<P>,
    options: FieldsObject = {},
) => {
    const trackPage = (page: string) => {
        ReactGA.set({ page, ...options });
        ReactGA.pageview(page);
    };

    const HOC = (props: P) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            trackPage(props.location.pathname);
        }, [props.location.pathname]);

        return <WrappedComponent {...props} />;
    };
    HOC.displayName =  `withTracker(${getDisplayName(WrappedComponent)})`;

    return HOC;
};