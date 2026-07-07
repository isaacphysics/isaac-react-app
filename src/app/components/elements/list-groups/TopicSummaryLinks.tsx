import React from "react";
import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {
    above,
    audienceStyle,
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    isIntendedAudience,
    makeIntendedAudienceComparator,
    stringifyAudience,
    useDeviceSize,
    useUserViewingContext
} from "../../../services";
import {Link} from "react-router-dom";
import {selectors, useAppSelector} from "../../../state";
import classNames from "classnames";
import {Markup} from "../markup";
import { ListGroup, ListGroupItem, Button } from "reactstrap";
import { Spacer } from "../Spacer";
import { ContentPropertyTags } from "../ContentPropertyTags";

export function TopicSummaryLinks({items, search}: {items: ContentSummaryDTO[]; search?: string}) {
    const userContext = useUserViewingContext();
    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    return <ListGroup className="mt-4 link-list list-group-links">
        {items
            // We want relevant sections to appear first
            .sort((itemA, itemB) => {
                return makeIntendedAudienceComparator(user, userContext)(itemA, itemB);
            })

            // Handle conditional display settings
            .map(item => {
                const intendedAudience = isIntendedAudience(item.audience, userContext, user);
                return {...item, deEmphasised: !intendedAudience};
            })

            // Render items
            .map((item) => {
                const audienceString = stringifyAudience(
                    item.audience, userContext,
                    isIntendedAudience(item.audience, userContext, user)
                );

                const documentPrefix = documentTypePathPrefix[item.type as DOCUMENT_TYPE];

                return <ListGroupItem key={item.id} className="topic-summary-link">
                    <Button
                        tag={Link} to={{pathname: `/${documentPrefix}/${item.id}`, search}}
                        block color="link" className={"d-flex align-items-stretch " + classNames({"de-emphasised": item.deEmphasised})}
                    >
                        <div className={classNames("stage-label d-flex align-items-center justify-content-center", audienceStyle(audienceString))}>
                            {above["sm"](deviceSize) ? audienceString : audienceString.replaceAll(",", "\n").split("\n").map((line, i, arr) => 
                                <>{line}{i < arr.length && <br/>}</>)}
                        </div>
                        <div className="title p-3 ps-6 d-block d-sm-flex">
                            <Markup encoding={"latex"}>
                                {item.title}
                            </Markup>
                            <ContentPropertyTags 
                                className="ps-sm-2"
                                deprecated={item.deprecated}
                                supersededByPath={item.supersededBy ? `/${documentPrefix}/${item.supersededBy}` : undefined}
                                tags={item.tags}
                            />
                        </div>
                        <Spacer />
                        <div className="d-flex align-items-center">
                            <i className="icon icon-chevron-right me-3" />
                        </div>
                    </Button>
                </ListGroupItem>;
            })
        }
    </ListGroup>;
}
