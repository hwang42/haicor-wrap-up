import React from "react";

import Result from "./Result";
import Setup from "./Setup";

import API from "../API";

type StepProps = {
  lines: string[];
};
type StepState = {
  result: [number, string][];
  waiting: boolean;
};

class Step extends React.Component<StepProps, StepState> {
  state: StepState = { result: [], waiting: false };

  render() {
    return (
      <div className="siimple-card" style={{ width: "calc(40vw - 0.75rem)" }}>
        <div className="siimple-card-header">Single Step Reasoning</div>

        <div className="siimple-card-body">
          <Setup
            lines={this.props.lines}
            onSubmit={(parameters) => {
              this.setState({ waiting: true });
              API.step_inference(parameters).then((response) =>
                this.setState({ result: response, waiting: false })
              );
            }}
          />
        </div>

        <div
          className="siimple-card-body siimple--px-4"
          style={{
            height: "calc(50vh - 192px - 0.75rem)",
            overflow: "auto",
          }}
        >
          <Result result={this.state.result} waiting={this.state.waiting} />
        </div>
      </div>
    );
  }
}

export default Step;
