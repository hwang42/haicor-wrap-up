import React from "react";

import Config from "./Config";
import Result from "./Result";

type StepProps = { className?: string; context: string[] };
type StepState = {
  parse: boolean;
  state?: "waiting" | "running" | "stopped";
  result?: [string, string, number][];
};

class Step extends React.Component<StepProps, StepState> {
  state: StepState = { parse: false };

  handleState(state: "waiting" | "running" | "stopped") {
    if (state !== "stopped") this.setState({ result: undefined });
    this.setState({ state: state });
  }

  handleResult(result: [string, string, number][]) {
    this.setState({ result: result });
  }

  renderResult() {
    const mapping = {
      waiting: [`${100 / 3}%`, "Submitted"],
      running: [`${200 / 3}%`, "Reasoning"],
      stopped: [`${300 / 3}%`, "Completed"],
    };
    const { parse, state, result } = this.state;

    if (state === undefined) return;

    return (
      <>
        <div
          className={
            "siimple-progress siimple-progress--primary" +
            (state === "stopped" ? "" : " siimple-progress--striped")
          }
        >
          <span style={{ width: mapping[state][0] }}>{mapping[state][1]}</span>
        </div>

        {result?.map((value, index) => (
          <Result key={index} parse={parse} result={value} />
        ))}
      </>
    );
  }

  render() {
    const { className, context } = this.props;
    const { parse } = this.state;

    return (
      <section className={className} id="reasoning-step">
        <h1>Reasoning Step</h1>

        <Config
          context={context}
          onState={(state) => this.handleState(state)}
          onResult={(result) => this.handleResult(result)}
        />

        <div
          className="siimple--display-flex"
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <h1>Result:</h1>

          <div className="siimple--float-right siimple--my-3">
            <label className="siimple-label">Structured:</label>
            <div className="siimple-switch">
              <input
                type="checkbox"
                id="path-parse"
                checked={parse}
                onChange={({ target: { checked } }) =>
                  this.setState({ parse: checked })
                }
              />
              <label htmlFor="path-parse" />
            </div>
          </div>
        </div>

        {this.renderResult()}
      </section>
    );
  }
}

export default Step;
