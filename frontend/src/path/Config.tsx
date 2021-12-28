import React from "react";

import API from "../API";

type ConfigProps = {
  context: string[];
  onState: (state: string, width: number, message: string) => any;
  onResult: (result: [number, string[]][]) => any;
};
type ConfigState = {
  source: string;
  target: string;
  length: number;
  branch: number;
  total: number;
};

class Config extends React.Component<ConfigProps, ConfigState> {
  state: ConfigState = {
    source: "",
    target: "",
    length: 2,
    branch: 2,
    total: 3,
  };

  handleSubmit() {
    const { context, onState, onResult } = this.props;

    API.path_inference({ context: context, ...this.state }, onState).then(
      (result) => onResult(result)
    );
  }

  render() {
    const { source, target, length, branch, total } = this.state;

    return (
      <div className="siimple-grid">
        <div className="siimple-grid-row">
          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label">Reasoning length:</label>
            <input
              type="number"
              className="siimple-input siimple-input--fluid"
              min="1"
              value={length}
              onChange={({ target: { value } }) =>
                this.setState({ length: parseInt(value) })
              }
            />
          </div>
          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label">Reasoning branch:</label>
            <input
              type="number"
              className="siimple-input siimple-input--fluid"
              min="1"
              value={branch}
              onChange={({ target: { value } }) =>
                this.setState({ branch: parseInt(value) })
              }
            />
          </div>
          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label">Reasoning total:</label>
            <input
              type="number"
              className="siimple-input siimple-input--fluid"
              min="1"
              value={total}
              onChange={({ target: { value } }) =>
                this.setState({ total: parseInt(value) })
              }
            />
          </div>

          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label"></label>
            <button
              className="siimple-btn siimple-btn--primary siimple-btn--fluid"
              onClick={() => this.handleSubmit()}
            >
              Submit
            </button>
          </div>
        </div>

        <div className="siimple-grid-row">
          <div className="siimple-grid-col siimple-grid-col--6">
            <label className="siimple-label">Reasoning source:</label>
            <input
              type="text"
              className="siimple-input siimple-input--fluid"
              value={source}
              onChange={({ target: { value } }) =>
                this.setState({ source: value })
              }
            />
          </div>

          <div className="siimple-grid-col siimple-grid-col--6">
            <label className="siimple-label">Reasoning target:</label>
            <input
              type="text"
              className="siimple-input siimple-input--fluid"
              value={target}
              onChange={({ target: { value } }) =>
                this.setState({ target: value })
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Config;
