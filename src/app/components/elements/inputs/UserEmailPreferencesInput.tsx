import {StyledCheckbox} from "./StyledCheckbox";
import {FormGroup, Table} from "reactstrap";
import React, {SetStateAction, useState} from "react";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {EMAIL_PREFERENCE_DEFAULTS, isPhy, siteSpecific} from "../../../services";
import {Dispatch} from "react";
import { TrueFalseRadioInput } from "./TrueFalseRadioInput";
import classNames from "classnames";
import {WithLinkableSetting} from "../WithLinkableSetting";
import { useTranslation } from 'react-i18next'

interface UserEmailPreferencesProps {
    emailPreferences: UserEmailPreferences | null | undefined;
    setEmailPreferences: (e: UserEmailPreferences) => void;
    submissionAttempted?: boolean;
    idPrefix?: string;
}

export const UserEmailPreferencesInput = ({emailPreferences, setEmailPreferences, submissionAttempted, idPrefix="my-account-"}: UserEmailPreferencesProps) => {
    const { t } = useTranslation()
    const isaacEmailPreferenceDescriptions = {
        assignments: siteSpecific(
            t('getNotifiedWhenYourTeacherGivesYourGroupANewAssignment', 'Get notified when your teacher gives your group a new assignment.'),
            t('receiveNotificationsWhenYourTeacherSetsYouWorkTheseAreSentAsNeededByYourTeacher', 'Receive notifications when your teacher sets you work. These are sent as needed by your teacher.')
        ),
        news: siteSpecific(
            t('newContentAndWebsiteFeatureUpdatesAsWellAsInterestingNewsAboutIsaac', 'New content and website feature updates, as well as interesting news about Isaac.'),
            t('beTheFirstToHearAboutNewFeaturesChallengesTopicsAndImprovementsOnThePlatformPlusGetHelpfulTipsOnMakingTheMostOfNewTools', 'Be the first to hear about new features, challenges, topics, and improvements on the platform. Plus, get helpful tips on making the most of new tools.')
        ),
        events: siteSpecific(
            t('informationAboutNewOnlineOrInpersonEvents', 'Information about new online or in-person events.'),
            t('findOutAboutUpcomingEventsDesignedToSupportYourLearningAndProfessionalDevelopment', 'Find out about upcoming events designed to support your learning and professional development.')
        )
    };

    return <FormGroup className={classNames("form-group", {"pt-4": isPhy})}>
        {isPhy && submissionAttempted !== undefined ? <> {/* submissionAttempted should always exist on phy, just here for typing */}
            <Table className="mb-0">
                <thead>
                    <tr>
                        <th>{t('emailType', 'Email type')}</th>
                        <th className="d-none d-sm-table-cell">{t('description', 'Description')}</th>
                        <th className="text-center">{t('preference', 'Preference')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="form-required">{t('assignments', 'Assignments')}</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.assignments}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}assignments`} stateObject={emailPreferences}
                                propertyName="ASSIGNMENTS" accessibleName="assignments"
                                setStateFunction={setEmailPreferences} submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="form-required">{t('news', 'News')}</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.news}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}news`} stateObject={emailPreferences}
                                propertyName="NEWS_AND_UPDATES" accessibleName="news and updates"
                                setStateFunction={setEmailPreferences} submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>
                    {<tr>
                        <td className="form-required">{t('events', 'Events')}</td>
                        <td className="d-none d-sm-table-cell">
                            {isaacEmailPreferenceDescriptions.events}
                        </td>
                        <td className="text-center">
                            <TrueFalseRadioInput
                                id={`${idPrefix}events`} stateObject={emailPreferences}
                                propertyName="EVENTS" accessibleName="events"
                                setStateFunction={setEmailPreferences} submissionAttempted={submissionAttempted}
                            />
                        </td>
                    </tr>}
                </tbody>
            </Table>
        </> : <>
            <WithLinkableSetting className={"email-preference"} id={"assignments-preference"}>
                <StyledCheckbox checked={emailPreferences?.ASSIGNMENTS ?? false} id={`${idPrefix}assignments`}
                    onChange={(e) => setEmailPreferences({...emailPreferences, ASSIGNMENTS: e.target.checked})}
                    label={<span><b>{t('assignments', 'Assignments')}</b></span>}
                />
                <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.assignments}</span>
            </WithLinkableSetting>

            <WithLinkableSetting className={"email-preference"} id={"news-preference"}>
                <StyledCheckbox checked={emailPreferences?.NEWS_AND_UPDATES ?? false} id={`${idPrefix}news`}
                    onChange={(e) => setEmailPreferences({
                        ...emailPreferences,
                        NEWS_AND_UPDATES: e.target.checked
                    })}
                    label={<span><b>{t('tipsAndUpdates', 'Tips and updates')}</b></span>}
                />
                <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.news}</span>
            </WithLinkableSetting>

            <WithLinkableSetting className={"email-preference"} id={"events-preference"}>
                <StyledCheckbox checked={emailPreferences?.EVENTS ?? false} id={`${idPrefix}events`}
                    onChange={(e) => setEmailPreferences({...emailPreferences, EVENTS: e.target.checked})}
                    label={<span><b>{t('events', 'Events')}</b></span>}
                />
                <span className="d-block mb-4">{isaacEmailPreferenceDescriptions.events}</span>
            </WithLinkableSetting>
        </>}
    </FormGroup>;
};

// Extended useState hook for email preferences, setting defaults
export const useEmailPreferenceState = (initialEmailPreferences?: Nullable<UserEmailPreferences>): [Nullable<UserEmailPreferences>, Dispatch<SetStateAction<Nullable<UserEmailPreferences>>>] => {
    const [emailPreferences, _setEmailPreferences] = useState<Nullable<UserEmailPreferences>>({...EMAIL_PREFERENCE_DEFAULTS, ...initialEmailPreferences});
    const setEmailPreferences = (newEmailPreferences: Nullable<UserEmailPreferences> | ((ep: Nullable<UserEmailPreferences>) => Nullable<UserEmailPreferences>)) => {
        if (typeof newEmailPreferences === "function") {
            return _setEmailPreferences((old) => ({...EMAIL_PREFERENCE_DEFAULTS, ...(newEmailPreferences(old))}));
        }
        return _setEmailPreferences({...EMAIL_PREFERENCE_DEFAULTS, ...newEmailPreferences});
    };
    return [emailPreferences, setEmailPreferences];
};
