import React from "react";
import marker from "../assets/svg/marker.svg";

type State = {
  title: string
};
type Props = {
    lat: any,
    lng: any,
    text: string,
    data: any,
    selectG: any
};

class MapCardComponent extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
        title: "",
    };
  }

  _onChildClick = () => {
    this.props.selectG(this.props.data);
  }

  render() {
    return (
      <React.Fragment>
        <div className="map-card-items" onClick={this._onChildClick}>
            <img className="church-icon" src={marker} alt="church icon" />
        </div>
      </React.Fragment>
    );
  }
}

export default MapCardComponent;
