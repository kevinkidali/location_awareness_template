import React from "react";
import Modal from "react-modal";
import edit from "../assets/svg/writing.svg";
import backarrow from "../assets/svg/left-arrow.svg";
import * as firebase from "firebase";
import { notify } from "react-notify-toast";

// https://github.com/reactjs/react-modal

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    width: "40%",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

Modal.setAppElement("#root");

type State = {
  modalIsOpen: boolean,
  headerText: string,
  actionStatus: string,
  selecteditem: any,
  loggedIn: boolean,
  items: any[],
  actionBtn: string,
  login: {
    email: string,
    password: any
  },
  dates: {
    day: string,
    time: any
  },
  item: {
    uid?: any,
    name: string,
    location: string,
    phoneNumber: string,
    long: string,
    lat: string,
    emailAddress: string,
    operationDate?: any
  },
  operationDate: Day[]
};
type Props = {};

interface Day {
  uid?: any;
  day: string;
  time: any;
}

class groupModalComponent extends React.Component<Props, State> {
  private rootRef = firebase.database().ref().child('location');

  constructor(props: any) {
    super(props);

    this.state = {
      modalIsOpen: false,
      headerText: "Location Awareness",
      actionStatus: "POST",
      actionBtn: "SAVE RECORD",
      login: {
        email: "contactapp@contactapp.com",
        password: "contactapp@contactapp.com"
      },
      selecteditem: {},
      loggedIn: false,
      dates: {
        day: "",
        time: ""
      },
      item: {
        uid: "",
        name: "",
        location: "",
        long: "",
        lat: "",
        phoneNumber: "",
        emailAddress: "",
        operationDate: []
      },
      items: [],
      operationDate: []
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount = () => {
    this.rootRef.on("value", snap => {
      const groupsObject = snap.val();

      if (groupsObject) {
        const groupList = Object.keys(groupsObject).map(key => ({
          ...groupsObject[key],
          uid: key
        }));
        this.setState({
          items: groupList
        });
      } else {
        this.setState({ items: [] });
      }
    });

    // check firebase auth
    firebase.auth().onAuthStateChanged((user: any) => {
      if (user) {
        this.setState({
          loggedIn: true
        });
      } else {
        this.setState({
          loggedIn: false
        });
      }
    });
  };

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  getLocation = (selectedDetail: any) => {
    const operationDate = this.rootRef.child(`${selectedDetail.uid}/operationDate`);

    operationDate.on("value", snap => {
      const objects = snap.val();

      if (objects) {
        const dates = Object.keys(objects).map(key => ({
          ...objects[key],
          uid: key
        }));
        this.setState({
          operationDate: dates
        });
      } else {
        this.setState({ operationDate: [] });
      }
    });
  };

  submitNewItem = () => {
    const { dates, selecteditem } = this.state;
    const operationDate = this.rootRef.child(`${selecteditem.uid}/operationDate`);

    operationDate
      .push(dates)
      .then(resp => {
        notify.show("Operation date added successfully!", "success");
        this.setState({
          dates: {
            day: "",
            time: ""
          }
        });
      })
      .catch(error => {
        notify.show("Issue adding operation date!", "error");
      });
  };

  additem = () => {
    const { item, actionStatus, selecteditem } = this.state;

    if (actionStatus === "POST") {
      this.rootRef
        .push(item)
        .then(resp => {
          notify.show("Information added successfully!", "success");
          this.setState({
            item: {
              uid: "",
              name: "",
              location: "",
              phoneNumber: "",
              emailAddress: "",
              long: "",
              lat: ""
            }
          });
        })
        .catch(error => {
          notify.show("Issue adding information!", "error");
        });
    } else {
      delete item.uid;
      const itemChild = this.rootRef.child(selecteditem.uid);
      itemChild
        .update(item)
        .then(resp => {
          notify.show("Information updated successfully!", "success");
        })
        .catch(error => {
          notify.show("Issue updating information!", "error");
        });
    }
  };

  removeGrouping = (uid: any) => {
    this.rootRef
      .child(uid)
      .remove()
      .then(resp => {
        notify.show("Life group removed successfully!", "success");
      })
      .catch(error => {
        notify.show("Issue removing life group!", "error");
      });
  };

  removingOperationDate = (uid: any) => {
    const { selecteditem } = this.state;
    const operationDate = this.rootRef.child(`${selecteditem.uid}/operationDate`);

    operationDate
      .child(uid)
      .remove()
      .then(resp => {
        notify.show("Date removed successfully!", "success");
      })
      .catch(error => {
        notify.show("Issue removing operation date!", "error");
      });
  };

  manageDetail = (details: any) => {
    this.getLocation(details);

    this.setState({
      selecteditem: details,
      headerText: "Operation Dates",
      item: details,
      actionStatus: "UPDATE",
      actionBtn: "UPDATE RECORD"
    });
  };

  afterModalClosed = () => {
    this.setState({
      headerText: "Hope church groups",
      actionStatus: "POST",
      actionBtn: "SAVE RECORD",
      selecteditem: {},
      item: {
        uid: "",
        name: "",
        location: "",
        phoneNumber: "",
        emailAddress: "",
        long: "",
        lat: ""
      }
    });
  };

  backAction = () => {
    this.setState({
      headerText: "Hope church groups",
      actionStatus: "POST",
      actionBtn: "SAVE RECORD",
      selecteditem: {},
      item: {
        uid: "",
        name: "",
        location: "",
        phoneNumber: "",
        emailAddress: "",
        long: "",
        lat: ""
      }
    });
  };

  loginAuth = async () => {
    const { login } = this.state;
    await firebase
      .auth()
      .signInWithEmailAndPassword(login.email, login.password)
      .then(resp => {
        notify.show("Login successful!", "success");
      })
      .catch((error: any) => {
        notify.show("Issue with you login credentials!", "error");
      });
  };

  logoutAuth = async () => {
    await firebase
      .auth()
      .signOut()
      .then(resp => {
        notify.show("Logged out successfully!", "success");
        this.closeModal();
      })
      .catch((error: any) => {
        notify.show("Issue login out", "error");
      });
  };

  // handleValidation = (event: any) => {
  // state: -------
  // errors: {
  //   fullName: '',
  //   email: '',
  //   password: '',
  // }
  // ------- : state
  //   event.preventDefault();
  //   const { name, value } = event.target;
  //   let errors = this.state.errors;

  //   switch (name) {
  //     case 'fullName':
  //       errors.fullName =
  //         value.length < 5
  //           ? 'Full Name must be 5 characters long!'
  //           : '';
  //       break;
  //     case 'email':
  //       errors.email =
  //         validEmailRegex.test(value)
  //           ? ''
  //           : 'Email is not valid!';
  //       break;
  //     case 'password':
  //       errors.password =
  //         value.length < 8
  //           ? 'Password must be 8 characters long!'
  //           : '';
  //       break;
  //     default:
  //       break;
  //   }

  //   this.setState({errors, [name]: value}, ()=> {
  //       console.log(errors)
  //   })
  // }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    const { items, headerText, actionStatus, actionBtn, item, operationDate, dates, loggedIn } = this.state;

    return (
      <React.Fragment>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterClose={this.afterModalClosed}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Dashboard"
        >
          <div className="modal-inner-wrap">
            {loggedIn ? (
              <React.Fragment>
                <h1 onClick={this.logoutAuth} className="logout">
                  LOGOUT →
                </h1>
                <div className="modal-left-view">
                  <div className="form-groups">
                    <label className="form-labels">Name</label>
                    <input
                      className="form-inputs"
                      value={item.name}
                      onChange={e =>
                        this.setState({
                          item: {
                            ...this.state.item,
                            name: e.target.value
                          }
                        })
                      }
                      placeholder="The Bereans"
                    />
                  </div>

                  <div className="form-groups">
                    <label className="form-labels">Phone Number</label>
                    <input
                      className="form-inputs"
                      value={item.phoneNumber}
                      onChange={e =>
                        this.setState({
                          item: {
                            ...this.state.item,
                            phoneNumber: e.target.value
                          }
                        })
                      }
                      placeholder="+2546 xxxx xxxx"
                    />
                  </div>

                  <div className="form-groups">
                    <label className="form-labels">Email Address</label>
                    <input
                      className="form-inputs"
                      value={item.emailAddress}
                      onChange={e =>
                        this.setState({
                          item: {
                            ...this.state.item,
                            emailAddress: e.target.value
                          }
                        })
                      }
                      placeholder="username@somewhere.com"
                    />
                  </div>

                  <div className="form-groups">
                    <label className="form-labels">Physical Address</label>
                    <input
                      className="form-inputs"
                      value={item.location}
                      onChange={e =>
                        this.setState({
                          item: {
                            ...this.state.item,
                            location: e.target.value
                          }
                        })
                      }
                      placeholder="59 Hse Kali Estate"
                    />
                  </div>

                  <div className="form-groups">
                    <label className="form-labels">Latitude</label>
                    <input
                      className="form-inputs"
                      value={item.lat}
                      onChange={e =>
                        this.setState({
                          item: {
                            ...this.state.item,
                            lat: e.target.value
                          }
                        })
                      }
                      placeholder="-5.5833995"
                    />
                  </div>

                  <div className="form-groups">
                    <label className="form-labels">Longitude</label>
                    <input
                      className="form-inputs"
                      value={item.long}
                      onChange={e =>
                        this.setState({
                          item: {
                            ...this.state.item,
                            long: e.target.value
                          }
                        })
                      }
                      placeholder="596904840"
                    />
                  </div>

                  <div className="form-groups">
                    <button className="form-btns" onClick={this.additem}>
                      {actionBtn}
                    </button>
                    <button className="form-btns danger" onClick={this.closeModal}>
                      ABORT ACTION
                    </button>
                  </div>
                </div>
                <div className="modal-right-view">
                  {actionStatus === "UPDATE" && (
                    <img className="file-icon" style={{ cursor: "pointer" }} src={backarrow} onClick={this.backAction} alt="file icon" />
                  )}
                  <h4>{headerText}</h4>
                  <div className="groups-divider"></div>
                  <div className="form-groups">
                    <div className="files-area">
                      <ul className="files-inner-area detailed-list-area">
                        {actionStatus === "POST" ? (
                          <React.Fragment>
                            {items.map(group => (
                              <li key={group.uid} className="files-item">
                                <img className="file-icon" src={edit} onClick={this.manageDetail.bind(this, group)} alt="file icon" />
                                <p className="file-text">{group.name}</p>
                                <p onClick={this.removeGrouping.bind(this, group.uid)} className="remove-file">
                                  x
                                </p>
                              </li>
                            ))}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <div>
                              <div className="add-detail-inner-cover">
                                <input
                                  className="form-inputs input-left-detail"
                                  value={dates.day}
                                  onChange={e =>
                                    this.setState({
                                      dates: {
                                        ...this.state.dates,
                                        day: e.target.value
                                      }
                                    })
                                  }
                                  placeholder="Monday - Friday"
                                />
                                <input
                                  className="form-inputs"
                                  value={dates.time}
                                  onChange={e =>
                                    this.setState({
                                      dates: {
                                        ...this.state.dates,
                                        time: e.target.value
                                      }
                                    })
                                  }
                                  placeholder="Opening - closing time"
                                />
                              </div>
                              <div className="action-btn-add-detail">
                                <button className="new-detail-btn" onClick={this.submitNewItem}>
                                  + ADD OPERATION DATE
                                </button>
                              </div>
                            </div>
                            {operationDate.map(dated => (
                              <li key={dated.uid} className="files-item">
                                <img className="file-icon" src={edit} alt="file icon" />
                                <p className="file-text">
                                  {dated.day}: <span className="phoneNumberValue">{dated.time}</span>
                                </p>
                                <p onClick={this.removingOperationDate.bind(this, dated.uid)} className="remove-file">
                                  x
                                </p>
                              </li>
                            ))}
                          </React.Fragment>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="account-cover">
                  <div className="account-title">
                    <h1 className="account-title-text">
                      Sign in | <span className="account-title-sub-text">Company Name</span>
                    </h1>
                  </div>
                  <div className="account-box">
                    {/* <form> */}
                    <div className="form-groups">
                      <label className="labels">Email Address</label>
                      <input
                        type="text"
                        onChange={e =>
                          this.setState({
                            login: {
                              ...this.state.login,
                              email: e.target.value
                            }
                          })
                        }
                        className="form-inputs"
                        placeholder="username@somewhere.com"
                      />
                    </div>
                    <div className="form-groups">
                      <label className="labels">Password</label>
                      <input
                        type="password"
                        onChange={e =>
                          this.setState({
                            login: {
                              ...this.state.login,
                              password: e.target.value
                            }
                          })
                        }
                        className="form-inputs"
                        placeholder="*********"
                      />
                    </div>
                    <div className="form-groups">
                      <button className="form-btns" onClick={this.loginAuth}>
                        Login
                      </button>
                    </div>
                    {/* </form> */}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export default groupModalComponent;
