import {CardDeck, Container} from "reactstrap";
import {NewsCard} from "../elements/cards/NewsCard";
import React from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {useGetNewsPodListQuery} from "../../state";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";

export const News = () => {
    const newsQuery = useGetNewsPodListQuery({subject: "news", orderDecending: true});

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"News"} />
        <MetaDescription description={"Get all the latest news about Ada Computer Science, and read the stories of recent graduates who now have exciting careers in computer science."} />
        <ShowLoadingQuery
            query={newsQuery}
            thenRender={(news) =>
                news.length > 0
                    ? <CardDeck className={"justify-content-center"}>
                        {news.map(n => <NewsCard newsItem={n} showTitle />)}
                    </CardDeck>
                    : <div className={"w-100 text-left"}><h4>No news to display...</h4></div>
            }
            defaultErrorTitle={"Error fetching news stories"}
        />
    </Container>;
};
