import {CardDeck, Container} from "reactstrap";
import {NewsCard} from "../elements/cards/NewsCard";
import React from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {useGetNewsPodListQuery} from "../../state";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {siteSpecific} from "../../services";

export const News = () => {
    const newsQuery = useGetNewsPodListQuery({subject: siteSpecific("physics", "news"), orderDecending: true});

    const metaDescription = siteSpecific(
        "Get all the latest news about Isaac Physics.",
        "Get all the latest news about Ada Computer Science, and read the stories of recent graduates who now have exciting careers in computer science.");

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"News"} />
        <MetaDescription description={metaDescription} />
        <ShowLoadingQuery
            query={newsQuery}
            thenRender={(news) =>
                news.length > 0
                    ? <CardDeck className={"justify-content-center"}>
                        {news.map(n => <NewsCard key={n.id} newsItem={n} showTitle />)}
                    </CardDeck>
                    : <div className={"w-100 text-left"}><h4>No news to display...</h4></div>
            }
            defaultErrorTitle={"Error fetching news stories"}
        />
    </Container>;
};
