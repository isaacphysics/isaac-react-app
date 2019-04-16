import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {storeFactory} from "../../app/state/store";
import IsaacApp from '../../app/components/navigation/IsaacApp';

describe('IsaacApp', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    const store = storeFactory({});
    ReactDOM.render(<React.StrictMode><Provider store={store}><IsaacApp/></Provider></React.StrictMode>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

});
