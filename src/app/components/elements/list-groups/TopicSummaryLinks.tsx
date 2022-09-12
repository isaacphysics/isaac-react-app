import React from "react";
import * as RS from "reactstrap";
import {ContentSummaryDTO} from "../../../../IsaacApiTypes";
import {
    audienceStyle,
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    isCS,
    isIntendedAudience,
    makeIntendedAudienceComparator,
    notRelevantMessage,
    stringifyAudience,
    useUserContext
} from "../../../services";
import {Link} from "react-router-dom";
import {selectors, useAppSelector} from "../../../state";
import classNames from "classnames";
import {Markup} from "../markup";

export function TopicSummaryLinks({items, search}: {items: ContentSummaryDTO[]; search?: string}) {
    const userContext = useUserContext();
    const user = useAppSelector(selectors.user.orNull);

    return <RS.ListGroup className="mt-3 link-list list-group-links">
        {items
            // For CS we want relevant sections to appear first
            .sort((itemA, itemB) => {
                if (!isCS) {return 0;}
                return makeIntendedAudienceComparator(user, userContext)(itemA, itemB);
            })

            // Handle conditional display settings
            .map(item => {
                const intendedAudience = isIntendedAudience(item.audience, userContext, user);
                const showOtherContent = userContext.showOtherContent;
                return {...item, deEmphasised: !intendedAudience, hidden: !intendedAudience && !showOtherContent};
            })

            // Filter-out hidden items
            .filter(item => !item.hidden)

            // Render remaining items
            .map((item, index) => <RS.ListGroupItem key={item.id} className="topic-summary-link">
                <RS.Button
                    tag={Link} to={{pathname: `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`, search}}
                    block color="link" className={"d-flex align-items-stretch " + classNames({"de-emphasised": item.deEmphasised})}
                >
                    <div className={"stage-label badge-primary d-flex align-items-center justify-content-center " + classNames({[audienceStyle(stringifyAudience(item.audience, userContext))]: isCS})}>
                        {stringifyAudience(item.audience, userContext)}
                    </div>
                    <div className="title pl-3 d-flex">
                        <div className="p-3">
                            <Markup encoding={"latex"}>
                                {item.title}
                            </Markup>
                        </div>
                        {item.deEmphasised && <div className="ml-auto mr-3 d-flex align-items-center">
                            <span id={`audience-help-${index}`} className="icon-help mx-1" />
                            <RS.UncontrolledTooltip placement="bottom" target={`audience-help-${index}`}>
                                {`This content has ${notRelevantMessage(userContext)}.`}
                            </RS.UncontrolledTooltip>
                        </div>}
                    </div>
                </RS.Button>
            </RS.ListGroupItem>)
        }
    </RS.ListGroup>;
}
