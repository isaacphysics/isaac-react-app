import {Button, Container, Row} from "reactstrap";
import {NewsCard} from "../elements/cards/NewsCard";
import React, {useEffect, useState} from "react";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {MetaDescription} from "../elements/MetaDescription";
import {useGetNewsPodListQuery} from "../../state";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {NEWS_PODS_PER_PAGE} from "../../services";
import {IsaacPodDTO} from "../../../IsaacApiTypes";
import {PageFragment} from "../elements/PageFragment";

export const CSProjects = () => {
    const [page, setPage] = useState(0);
    const [allCourses, setAllCourses] = useState([] as IsaacPodDTO[]); // each query fetches a new page; this acts as a cache for all the news fetched so far
    const [disableLoadMore, setDisableLoadMore] = useState(false);

    const projectsQuery = useGetNewsPodListQuery({subject: "projects_pods", startIndex: page * NEWS_PODS_PER_PAGE});

    useEffect(() => {
        let cancelled = false; // prevents multiple additions to list on unmount/remount (from e.g. strict mode)

        projectsQuery.refetch().then((value) => {
            if (!cancelled && value.status === "fulfilled" && value.data !== undefined) {
                setAllCourses(n => n.concat((value.data as IsaacPodDTO[]).slice(0, NEWS_PODS_PER_PAGE)));
                if (value.data.length < NEWS_PODS_PER_PAGE) {
                    setDisableLoadMore(true);
                }
            }
        });

        return () => {
            cancelled = true;
        };
    }, [page]);

    const metaDescription = "Browse the Raspberry Pi Foundation’s free online courses for educators and choose from a range of computing topics.";

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Projects"} />
        <MetaDescription description={metaDescription} />
        <PageFragment fragmentId={"projects_help"} />
        {allCourses.length === 0 ?
            <ShowLoadingQuery
                query={projectsQuery}
                thenRender={() => <div className={"w-100 text-start"}><h4>No projects to display...</h4></div>}
                defaultErrorTitle={"Error fetching projects"}
            /> :
            <>
                <Row className="d-flex flex-row card-deck row-cols-1 row-cols-md-2 row-cols-lg-3 justify-content-between my-3">
                    {allCourses.map(n => <NewsCard key={n.id} newsItem={n} showTitle />)}
                </Row>
                <div className="w-100 d-flex justify-content-center mb-5">
                    <Button className={"mt-3"} color={"primary"} disabled={disableLoadMore} onClick={() => setPage(p => p + 1)}>Load more projects</Button>
                </div>
            </>
        }
    </Container>;
};
