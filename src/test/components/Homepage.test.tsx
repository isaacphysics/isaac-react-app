import React from 'react';
import {shallow} from 'enzyme';
import {HomepageComponent} from "../../app/components/pages/Homepage";
import {RegisteredUserDTO} from "../../IsaacApiTypes";

describe('HomepageComponent', () => {

    it('renders correctly with a null valued user', () => {
        const component = shallow(<HomepageComponent user={null} />);
        expect(component).toMatchSnapshot();
    });

    it("prints out the user's name when it is provided", () => {
        const user: RegisteredUserDTO = {givenName: "Alan"};
        const component = shallow(<HomepageComponent user={user} />);
        expect(component).toMatchSnapshot();
    })

});
