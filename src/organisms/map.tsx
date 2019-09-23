import React from "react";
import GoogleMapReact from 'google-map-react';
import MapCardComponent from '../atoms/mapcard';
import GroupDetailsComponent from '../atoms/groupdetails';
import * as firebase from "firebase";
import haversine from "haversine";

// https://github.com/google-map-react/google-map-react/blob/master/README.md

type State = {
  items: any[]
  locationStatus: boolean,
  googleUrl: string,
  modalIsOpen: boolean,
  selectedGroup: any,
  coordinates: coord,
  defaultProps: {
    center: {
      lat: any,
      lng: any
    },
    zoom: 13
  };
};
type Props = {};

interface coord {
  accuracy: number,
  altitude: any,
  altitudeAccuracy: any,
  heading: any,
  latitude: any,
  longitude: any,
  speed: any
}

class MapComponent extends React.Component<Props, State> {
  private rootRef = firebase.database().ref().child('location');
  private myRef: any;

  constructor(props: any) {
    super(props);
    this.state = {
      items: [],
      selectedGroup: {},
      modalIsOpen: false,
      googleUrl: "",
      locationStatus: false,
      coordinates: {
        accuracy: 0,
        altitude: "",
        altitudeAccuracy: "",
        heading: "",
        latitude: "",
        longitude: "",
        speed: ""
      },
      defaultProps: {
        center: {
          lat: -1.28333,
          lng: 36.81667
        },
        zoom: 13
      }
    };

    this.myRef = React.createRef();
  }

  componentDidMount = () => {
    this.getCurrentLocation();
  };

  getLocationDetails = (dist: number) => {
    this.rootRef.on("value", snap => {
      const groupsObject = snap.val();

      if (groupsObject) {
        const groupList = Object.keys(groupsObject).map(key => ({
          ...groupsObject[key],
          uid: key
        }));

        let groups;

        dist === 1 ? groups = this.refinedResults(groupList) : groups = groupList;

        this.setState({
          items: groups
        }, () => {
          // console.log(this.state.items)
        });
      } else {
        this.setState({ items: [] });
      }
    });
  }

  refinedResults = (items: any) => {
    const { coordinates } = this.state;

    const groupsNearYou: any = [];

    const start = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    };

    items.forEach((group: any) => {
      const end = {
        latitude: group.lat,
        longitude: group.long
      };

      let distance = this.calculateDistance(start, end);

      if (distance < 10) {
        group.distance = distance.toFixed();
        groupsNearYou.push(group)
      }
    });

    return groupsNearYou;
  }

  calculateDistance = (start: any, end: any) => {
    return haversine(start, end);
  }

  getCurrentLocation = async () => {
    if (!!navigator.geolocation) {

      navigator.geolocation.getCurrentPosition((position: any) => {
        const coordinates = position.coords;
        const center = {
          lat: coordinates.latitude,
          lng: coordinates.longitude
        };

        this.getLocationDetails(0);
        /* Below code: if you want to compare nearby location of a user with the available map items */
        // coordinates ? this.getLocationDetails(1) : this.getLocationDetails(0);
        this.setState({
          defaultProps: { ...this.state.defaultProps, center: center },
          locationStatus: coordinates ? true : false,
          coordinates
        });
      });
      // Support
    } else {
      this.getLocationDetails(0);
      // No support
    }
  }

  selectedItem = (selectedGroup: any) => {
    this.setState({
      selectedGroup
    }, () => {
      this.myRef.current.getOperationDates();
    });
  }

  getDirection = () => {
    const { selectedGroup, coordinates } = this.state;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${coordinates.latitude},${coordinates.longitude}&destination=${selectedGroup.lat},${selectedGroup.long}`;

    window.open(url, '_blank');
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterModalClosed = () => {
    //
  }

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  }

  beforeCloseModal = () => {
    //
  }

  render() {
    const { items, locationStatus, selectedGroup } = this.state;

    return (
      <React.Fragment>
        <div className="map-container">
          <div className="map" style={{ position: "relative" }}>
            <div className="inner-map">
              {items && <GoogleMapReact
                bootstrapURLKeys={{ key: "" }}
                defaultCenter={this.state.defaultProps.center}
                center={this.state.defaultProps.center}
                defaultZoom={this.state.defaultProps.zoom}
              >
                {items && items.map((item) => <MapCardComponent
                  key={item.uid}
                  lat={item.lat}
                  lng={item.long}
                  selectG={this.selectedItem}
                  data={item}
                  text={item.name}
                />)}
              </GoogleMapReact>}
            </div>
          </div>
          <div className="map-item-details">
            {(selectedGroup.name && locationStatus) && <div className="user-direction" onClick={this.getDirection}>
              <h2 className="user-direction-text">GET DIRECTION ↘</h2>
            </div>}
            <GroupDetailsComponent ref={this.myRef} group={this.state.selectedGroup} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default MapComponent;
