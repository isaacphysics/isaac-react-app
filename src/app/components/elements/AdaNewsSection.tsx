import React from "react";
import { Row, Button } from "reactstrap";
import { useDeviceSize } from "../../services";
import { IconCard } from "./cards/IconCard";
import { NewsCard } from "./cards/NewsCard";
import classNames from "classnames";
import { selectors, useAppSelector, useGetNewsPodListQuery } from "../../state";
import { useLinkableSetting } from "../../services/linkableSetting";

export const AdaNewsSection = ({isHomepage}: {isHomepage?: boolean}) => {
    const deviceSize = useDeviceSize();
    const {data: news} = useGetNewsPodListQuery({subject: "news"});
    const userPreferences = useAppSelector(selectors.user.preferences);
    const showNewsletterPrompts = !userPreferences?.EMAIL_PREFERENCE?.NEWS_AND_UPDATES;
    const {setLinkedSetting} = useLinkableSetting();

    return ((news && news.length > 0) || showNewsletterPrompts) && <>
        <h2 className={classNames({"font-size-1-75 mb-4": isHomepage})}>Tips, tools & support</h2>
        {news && news.length > 0 &&
            <>
                <Row xs={12} data-testid={"news-pod-deck"} className="d-flex flex-row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 isaac-cards-body justify-content-around mt-3 mb-1">
                    {news.slice(0, deviceSize === "lg" ? 3 : 4).map((n, i) => <NewsCard key={i} newsItem={n} showTitle cardClassName="bg-cultured-grey" />)}
                </Row>
                <div className={"mt-4 mt-lg-5 w-100 text-center"}>
                    <Button href={"/news"} color={"link"}><h4 className={"mb-0"}>See more</h4></Button>
                </div>
            </>}
        {showNewsletterPrompts &&
            <Row xs={12} className={classNames({"pt-4": !isHomepage}, "mt-7")}>
                <IconCard
                    card={{
                        title: "Stay updated",
                        icon: {name: "icon-mail", color: "tertiary"},
                        bodyText: "Get fresh teaching ideas, student study tips, and development news about our tools and resources delivered straight to your inbox.",
                        clickUrl: "/account#notifications",
                        buttonText: "Get tips and updates",
                        onButtonClick: () => {setLinkedSetting("news-preference");},
                        className: classNames({"bg-cultured-grey": isHomepage}, "px-0")
                    }}
                />
            </Row>
        }
    </>;
};
    