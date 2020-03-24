import React from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {AllTopics} from "../../pages/AllTopics";
import {Topic} from "../../pages/Topic";

let key = 0;
export const RoutesCS = [
    // Topic pages
    <TrackedRoute key={key++} exact path="/topics" component={AllTopics} />,
    <TrackedRoute key={key++} exact path="/topics/:topicName" component={Topic} />,
];
