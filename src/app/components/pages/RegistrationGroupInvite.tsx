import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import React, { useEffect, useState } from "react";
import * as RS from "reactstrap";
import { extractTeacherName, history, KEY, persistence } from "../../services";
import { authorisationsApi, store, useLazyGetTokenOwnerQuery } from "../../state";
import { UserSummaryWithEmailAddressDTO } from "../../../IsaacApiTypes";

export const RegistrationGroupInvite = ()  => {
    const [getTokenOwner] = useLazyGetTokenOwnerQuery();
    const authenticateWithTokenAfterPrompt = async (token: string | null) => {
        const sanitisedToken = token?.split("?authToken=").at(-1)?.toUpperCase().replace(/ /g,'') ?? "";
        const {data: usersToGrantAccess} = await getTokenOwner(sanitisedToken);
        if (usersToGrantAccess && usersToGrantAccess.length){
            return usersToGrantAccess;
        }
    };
    
    persistence.save(KEY.AFTER_AUTH_PATH, window.location.pathname);
    const urlParams = new URLSearchParams(location.search);
    const afterAuthPath = urlParams.get("authToken") ?? "";
    const [authenticationToken, _] = useState<string>(afterAuthPath);
    // need to handle persistence.remove etc
    const codeIsValid = authenticationToken && authenticationToken.length > 0;
    
    const [usersToGrantAccess, setUsersToGrantAccess] = useState<UserSummaryWithEmailAddressDTO[] | undefined>();

    useEffect(()=>{
        if (codeIsValid) {
            authenticateWithTokenAfterPrompt(authenticationToken).then((result) => {
                setUsersToGrantAccess(result);
            });
        }
    }, []) ;

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
        <RS.Button color="secondary" onClick={() => {store.dispatch(authorisationsApi.endpoints.authenticateWithToken.initiate("NGVZVB")); history.push("/account");}}>
            Yes, join the group
        </RS.Button>
    </Container>;
};