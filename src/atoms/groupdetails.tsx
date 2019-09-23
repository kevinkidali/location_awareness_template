import React from "react";
import location from "../assets/svg/location.svg";
import date from "../assets/svg/date.svg";
import study from "../assets/svg/study.svg";
import logo from "../assets/png/logo.png";
import LocationModal from "../organisms/modal";
import * as firebase from "firebase";
import { notify } from "react-notify-toast";
import backarrow from "../assets/svg/left-arrow.svg";

type State = {
  title: string,
  operationDates: any[],
  contact: Contct
};
type Props = {
  group: any
};

interface Contct {
  emailAddress: string;
  message: string;
}

class GroupDetailsComponent extends React.Component<Props, State> {
    private rootRef = firebase.database().ref().child('location');

    private myRef: any;
  constructor(props: any) {
    super(props);
    this.state = {
      contact: {
        emailAddress: "",
        message: ""
      },
      operationDates: [],
      title: ""
    };
    this.myRef = React.createRef();
  }

  activateModal = () => {
    this.myRef.current.openModal();
  };

  sendMessage = () => {
    const { contact } = this.state;

    if (contact.emailAddress === "" || contact.message === "") {
      notify.show("All fields must be filled!", "error");
    } else {
      // ready to send to the server back end
      notify.show("Message sent successfully", "success");
    }
  };

  getOperationDates = () => {
    const { group } = this.props;
    const operationDates = this.rootRef.child(`${group.uid}/operationDate`);

    operationDates.on("value", snap => {
      const objects = snap.val();

      if (objects) {
        const lists = Object.keys(objects).map(key => ({
          ...objects[key],
          uid: key
        }));
        this.setState({
          operationDates: lists
        });
      } else {
        this.setState({ operationDates: [] });
      }
    });
  };

  backAction = () => {
    window.location.href = "/";
  };

  render() {
    const { group } = this.props;
    const { operationDates } = this.state;

    return (
      <React.Fragment>
        <div className="location-details-details">
          <LocationModal ref={this.myRef} />
          <button onClick={this.activateModal} className="btn-get-direction">
            ACCESS ACCOUNT
          </button>
          {group.name ? (
            <React.Fragment>
              {group.distance && (
                <div className="float-distance-cover">
                  <div className="floating-distance-circle">
                    <h1 className="floating-distance">{group.distance} KM</h1>
                  </div>
                  <p className="floating-distance-text">Distance from you</p>
                </div>
              )}

              <img className="file-icon" style={{ cursor: "pointer" }} src={backarrow} onClick={this.backAction} alt="file icon" />
              <h1 className="location-details-header">{group.name}</h1>
              <div className="location-details-divider"></div>

              <ul className="location-details-items">
                <li className="location-details-item">
                  <div className="location-details-sub-item">
                    <img className="location-details-icons" src={location} alt="location icon" />
                    <span className="location-details-sub-item-value">Locations:</span>
                  </div>
                  <p className="location-details-values">{group.location}</p>
                </li>
                <li className="location-details-item">
                  <div className="location-details-sub-item">
                    <img className="location-details-icons" src={date} alt="date icon" />
                    <span className="location-details-sub-item-value">Email Address:</span>
                  </div>
                  <p className="location-details-values">{group.emailAddress}</p>
                </li>
                <li className="location-details-item">
                  <div className="location-details-sub-item">
                    <img className="location-details-icons" src={study} alt="study icon" />
                    <span className="location-details-sub-item-value">Phone Number:</span>
                  </div>
                  <p className="location-details-values">{group.phoneNumber}</p>
                </li>
              </ul>

              <h3 className="operation-date-sub-header">Operation Dates</h3>
              <div className="details-location-divider"></div>

              {operationDates.length > 0 && (
                <ul className="location-details">
                  {operationDates.map(dated => (
                    <li key={dated.uid} className="location-details-list">
                      <img className="location-details-icons" src={date} alt="check icon" />
                      <p className="location-details-values">
                        {dated.day}
                        <br />
                        <span className="operation-time">{dated.time}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <img className="logo" src={logo} alt="logo" />
              <h1 className="logo-text" style={{ color: "#666" }}>
                Contact
              </h1>
              <p className="quote">
                “Communication is the solvent of all problems and is the foundation for personal development.” <br />
              </p>
              <p className="quote-author">– Peter Shepherd</p>
              <div className="divider"></div>
              <div className="contact-form">
                <div className="form-groups">
                  <label className="labels">Email Address</label>
                  <input
                    type="text"
                    onChange={e =>
                      this.setState({
                        contact: {
                          ...this.state.contact,
                          emailAddress: e.target.value
                        }
                      })
                    }
                    className="form-inputs form-input-lg"
                    placeholder="username@somewhere.com"
                  />
                </div>
                <div className="form-groups">
                  <label className="labels">Message</label>
                  <textarea
                    rows={10}
                    onChange={e =>
                      this.setState({
                        contact: {
                          ...this.state.contact,
                          message: e.target.value
                        }
                      })
                    }
                    className="form-textarea"
                    placeholder="You message here .."
                  ></textarea>
                </div>
                <div className="form-groups">
                  <button className="form-btns-lg" onClick={this.sendMessage}>
                    SEND MESSAGE
                  </button>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default GroupDetailsComponent;
