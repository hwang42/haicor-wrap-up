import React from "react";

import Config from "./Config";
import Result from "./Result";

type GraphProps = { className?: string; context: string[] };
type GraphState = {
  state?: [string, number, string];
  result?: [number, string[]][];
};

class Graph extends React.Component<GraphProps, GraphState> {
  state: GraphState = {};

  handleState(state: string, width: number, message: string) {
    if (state !== "stopped") this.setState({ result: undefined });
    this.setState({ state: [state, width, message] });
  }

  handleResult(result: [number, string[]][]) {
    this.setState({ result: result });
  }

  renderResult() {
    const { state, result } = this.state;

    if (state === undefined) return;

    return (
      <>
        <div
          className={
            "siimple-progress siimple-progress--primary" +
            (state[0] === "stopped" ? "" : " siimple-progress--striped")
          }
        >
          <span style={{ width: `${state[1] * 100}%` }}>{state[2]}</span>
        </div>

        {result?.map((value, index) => (
          <Result key={index} result={value} />
        ))}
      </>
    );
  }

  render() {
    const { className, context } = this.props;

    return (
      <section className={className} id="reasoning-step">
        <h1>Reasoning Step</h1>

        <Config
          context={context}
          onState={(state, width, message) =>
            this.handleState(state, width, message)
          }
          onResult={(result) => this.handleResult(result)}
        />

        <h1>Result:</h1>

        {this.renderResult()}
      </section>
    );
  }
}

export default Graph;
