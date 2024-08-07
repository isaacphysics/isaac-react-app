import {Button, Col, Container, Row} from "reactstrap";
import {NewsCard} from "../elements/cards/NewsCard";
import React, { useEffect } from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {useGetNewsPodListQuery} from "../../state";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {NEWS_PODS_PER_PAGE, siteSpecific} from "../../services";
import { IsaacPodDTO } from "../../../IsaacApiTypes";

export const News = () => {
    const [page, setPage] = React.useState(0);
    const [allNews, setAllNews] = React.useState([] as IsaacPodDTO[]); // each query fetches a new page; this acts as a cache for all the news fetched so far
    const [disableLoadMore, setDisableLoadMore] = React.useState(false);

    const newsQuery = useGetNewsPodListQuery({subject: siteSpecific("physics", "news"), startIndex: page * NEWS_PODS_PER_PAGE});

    useEffect(() => {
        newsQuery.refetch().then((value) => {
            if (value.status === "fulfilled" && value.data !== undefined) {
                setAllNews(n => n.concat((value.data as IsaacPodDTO[]).slice(0, NEWS_PODS_PER_PAGE)));
                if (value.data.length < NEWS_PODS_PER_PAGE) {
                    setDisableLoadMore(true);
                }
            }
        });
    }, [page]);

    const metaDescription = siteSpecific(
        "Get all the latest news about Isaac Physics.",
        "Get all the latest news about Ada Computer Science, and read the stories of recent graduates who now have exciting careers in computer science.");

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"News"} />
        <MetaDescription description={metaDescription} />
        {allNews.length === 0 ? 
            <ShowLoadingQuery
                query={newsQuery}
                thenRender={() => <div className={"w-100 text-start"}><h4>No news to display...</h4></div>}
                defaultErrorTitle={"Error fetching news stories"}
            /> : 
            <>
                <Row className="d-flex flex-row card-deck row-cols-1 row-cols-sm-2 row-cols-lg-3 justify-content-center mt-4">
                    {allNews.map((n, i) => <Col key={i} className="d-flex my-3 px-0 justify-content-center">
                        <NewsCard key={n.id} newsItem={n} showTitle />
                    </Col>)}
                </Row>
                <div className="w-100 d-flex justify-content-center mb-5">
                    <Button className={"mt-3"} color={"primary"} disabled={disableLoadMore} onClick={() => setPage(p => p + 1)}>Load older news</Button>
                </div>
            </>
        }
    </Container>;
};
