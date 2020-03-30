import React from "react";
import {TrackedRoute} from "../../navigation/TrackedRoute";
import {AllTopics} from "../../pages/AllTopics";
import StaticPageRoute from "../../navigation/StaticPageRoute";

let key = 0;
export const RoutesCS = [
    // Static pages:
    <StaticPageRoute key={key++} exact path="/about" pageId="about_us" />,
    <StaticPageRoute key={key++} exact path="/teaching_order" pageId="teaching_order" />,

    // Topic index:
    <TrackedRoute key={key++} exact path="/topics" component={AllTopics} />,
];
