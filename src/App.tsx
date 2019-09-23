import React from 'react';
import './App.scss';
import Map from "./organisms/map";
import firebase from "firebase/app";
import config from "./utils/config";
import Notifications from 'react-notify-toast';

firebase.initializeApp(config);

class App extends React.Component {

  render() {
    return (
      <div className="map-section-cover">
        <Notifications />
        <Map></Map>
      </div>
    );
  }
}

export default App;
