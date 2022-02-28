import React from "react";
import {StaticRouter} from "react-router";
import { Provider } from "react-redux";

import {ContentDTO} from "./IsaacApiTypes";
import {IsaacContent} from "./app/components/content/IsaacContent";
import {store} from "./app/state/store";

const WrappedIsaacContent = (props: {doc: ContentDTO; contentIndex?: number}) => {
    return <Provider store={store}>
        <StaticRouter location="/">
            <IsaacContent {...props} />
        </StaticRouter>
    </Provider>;
};

export default WrappedIsaacContent;
