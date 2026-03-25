import { useParams } from "react-router";
import { LoggedInUser } from "../../../../IsaacAppTypes";
import { Immutable } from "immer";

export const QualtricsRedirect = ({user}: {user: Immutable<LoggedInUser>}) => {
    const params = useParams();
    const redirectURL = `https://cambridge.eu.qualtrics.com/jfe/form/${params.qId}?UID=${user.id}${params.refNo ? `&refno=${params.refNo}` : ''}`;
    window.location.href = redirectURL;
    return null;
};
