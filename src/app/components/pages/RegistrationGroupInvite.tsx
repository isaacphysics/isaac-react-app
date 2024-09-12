import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, { useEffect, useState } from "react";
import * as RS from "reactstrap";
import { extractTeacherName, history, KEY, persistence } from "../../services";
import { authorisationsApi, store, useLazyGetTokenOwnerQuery } from "../../state";
import { UserSummaryWithEmailAddressDTO } from "../../../IsaacApiTypes";

export const RegistrationGroupInvite = ()  => {
    const [getTokenOwner] = useLazyGetTokenOwnerQuery();
    const [usersToGrantAccess, setUsersToGrantAccess] = useState<UserSummaryWithEmailAddressDTO[] | undefined>();
    const [isGroupValid, setIsGroupValid] = useState<boolean>(true);
    const urlParams = new URLSearchParams(location.search);
    const token =  urlParams.get("authToken") ?? "";
    const [authenticationToken, _] = useState<string>(token);
    const afterAuthPath = window.location.pathname;

    const getGroupOwners = async (token: string | null) => {
        const sanitisedToken = token?.toUpperCase().replace(/ /g,'') ?? "";
        const {data: usersToGrantAccess} = await getTokenOwner(sanitisedToken);
        if (usersToGrantAccess && usersToGrantAccess.length){
            return usersToGrantAccess;
        }
        else {
            setIsGroupValid(false);
        }
    };

    useEffect(()=>{
        if (authenticationToken && authenticationToken.length > 0) {
            getGroupOwners(authenticationToken).then((result) => {
                setUsersToGrantAccess(result);
            });
        }
    }, []);

    persistence.save(KEY.AFTER_AUTH_PATH, afterAuthPath);

    if(!isGroupValid){
        return <Container>
            <TitleAndBreadcrumb currentPageTitle={`Group not found`} className="mb-4" />
            <p>You came here via a group join link, but the group code is invalid.</p>
        </Container>;
    }
    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Join group`} className="mb-4" />
        <p>You came here via a group join link. Are you happy to join the group and allow
        these teachers to see your work and progress?</p>
        <RS.Table bordered>
            <tbody>
                {usersToGrantAccess?.map((member: any) => (<tr key={member.id}>
                    <td>
                        <span className="group-table-person" />
                        {extractTeacherName(member)} - ({member.email})
                    </td>
                </tr>))}
            </tbody>
        </RS.Table>
        <RS.Button color="primary" outline onClick={() => {history.push("/account");}}>
            No, skip this
        </RS.Button>
        {" "}
        <RS.Button color="secondary" onClick={() => {store.dispatch(authorisationsApi.endpoints.authenticateWithToken.initiate(authenticationToken)); history.push("/account");}}>
            Yes, join the group
        </RS.Button>
    </Container>;
};