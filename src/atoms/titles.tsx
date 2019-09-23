import React from "react";

type State = {
  title: string
};
type Props = {
    componentTitle: string
};

class TitlesComponent extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
        title: "",
    };
  }

  render() {
    return (
      <React.Fragment>
        <div className="dashboard-title-cover margin-top-dashboard">
            <h3 className="dashboard-titles">{this.props.componentTitle}</h3>
            <div className="dashboard-divider"></div>
        </div>
      </React.Fragment>
    );
  }
}

export default TitlesComponent;
