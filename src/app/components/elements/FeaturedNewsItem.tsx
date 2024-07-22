import React from "react";
import {NewsCard} from "./cards/NewsCard";
import {IsaacPodDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";

export const FeaturedNewsItem = ({item}: {item: IsaacPodDTO | undefined}) =>
    <ShowLoading until={item} thenRender={newsItem =>
        <div className={"mb-lg-1 mt-3 mx-auto p-lg-4 featured-news-item"}>
            <NewsCard newsItem={newsItem} showTitle />
        </div>
    } />;
