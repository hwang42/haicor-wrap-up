import React from "react";

import API from "../API";

type ConfigProps = {
  context: string[];
  onState: (state: "waiting" | "running" | "stopped") => any;
  onResult: (result: [string, string, number][]) => any;
};
type ConfigState = {
  usage: "general" | "premise";
  order: "forward" | "backward";
  aspect: "causal" | "emotional" | "spatial" | "possession" | "miscellaneous";
  number: number;
  question: string;
};

class Config extends React.Component<ConfigProps, ConfigState> {
  state: ConfigState = {
    usage: "general",
    order: "forward",
    aspect: "causal",
    number: 3,
    question: "",
  };

  handleSubmit() {
    const { context, onState, onResult } = this.props;

    API.step_inference({ context: context, ...this.state }, onState).then(
      (result) => onResult(result)
    );
  }

  render() {
    const { number, question } = this.state;

    return (
      <div className="siimple-grid">
        <div className="siimple-grid-row">
          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label">Reasoning type:</label>
            <select
              className="siimple-select siimple-select--fluid"
              onChange={({ target: { value } }) =>
                this.setState({ usage: value as "general" | "premise" })
              }
            >
              <option value="general">Narrative</option>
              <option value="premise">Statement</option>
            </select>
          </div>

          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label">Reasoning goal:</label>
            <select
              className="siimple-select siimple-select--fluid"
              onChange={({ target: { value } }) =>
                this.setState({ order: value as "forward" | "backward" })
              }
            >
              <option value="forward">Conclusions</option>
              <option value="backward">Hypotheses</option>
            </select>
          </div>

          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label">Reasoning aspect:</label>
            <select
              className="siimple-select siimple-select--fluid"
              onChange={({ target: { value } }) =>
                this.setState({
                  aspect: value as
                    | "causal"
                    | "emotional"
                    | "spatial"
                    | "possession"
                    | "miscellaneous",
                })
              }
            >
              <option value="causal">Causal</option>
              <option value="emotional">Emotional</option>
              <option value="spatial">Spatial</option>
              <option value="possession">Possession</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div className="siimple-grid-col siimple-grid-col--3">
            <label className="siimple-label">Reasoning number:</label>
            <input
              type="number"
              className="siimple-input siimple-input--fluid"
              min="1"
              value={number}
              onChange={({ target: { value } }) =>
                this.setState({ number: parseInt(value) })
              }
            />
          </div>
        </div>

        <div className="siimple-grid-row">
          <div className="siimple-grid-col siimple-grid-col--9">
            <label className="siimple-label">Reasoning question:</label>
            <input
              type="text"
              className="siimple-input siimple-input--fluid"
              value={question}
              onChange={({ target: { value } }) =>
                this.setState({ question: value })
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
      </div>
    );
  }
}

export default Config;
