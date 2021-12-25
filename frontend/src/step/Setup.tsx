import React from "react";

type SetupProps = {
  lines: string[];
  onSubmit: (parameters: {
    usage: "general" | "premise";
    order: "forward" | "backward";
    aspect: "causal" | "emotional" | "spatial" | "possession" | "miscellaneous";
    number: number;
    context: string[];
    question: string;
  }) => void;
};
type SetupState = {
  usage: "general" | "premise";
  order: "forward" | "backward";
  aspect: "causal" | "emotional" | "spatial" | "possession" | "miscellaneous";
  number: number;
  question: string;
};

class Setup extends React.Component<SetupProps, SetupState> {
  state: SetupState = {
    usage: "general",
    order: "forward",
    aspect: "causal",
    number: 5,
    question: "",
  };

  handleSubmit() {
    this.props.onSubmit({
      usage: this.state.usage,
      order: this.state.order,
      aspect: this.state.aspect,
      number: this.state.number,
      context: this.props.lines,
      question: this.state.question,
    });
  }

  render() {
    return (
      <div className="siimple-grid">
        <div className="siimple-grid-row">
          <div className="siimple-grid-col siimple-grid-col--12">
            <input
              type="text"
              className="siimple-input siimple-input--fluid"
              value={this.state.question}
              placeholder="Question"
              onChange={(event) =>
                this.setState({ question: event.target.value })
              }
            />
          </div>
        </div>

        <div className="siimple-grid-row">
          <div className="siimple-grid-col" style={{ width: "16.818%" }}>
            <select
              className="siimple-select siimple-select--fluid"
              onChange={(event) =>
                this.setState({ usage: event.target.value as any })
              }
            >
              <option value="general">Narrative</option>
              <option value="premise">Statement</option>
            </select>
          </div>

          <div className="siimple-grid-col" style={{ width: "16.818%" }}>
            <select
              className="siimple-select siimple-select--fluid"
              onChange={(event) =>
                this.setState({ order: event.target.value as any })
              }
            >
              <option value="forward">Conclusion</option>
              <option value="backward">Hypothesis</option>
            </select>
          </div>

          <div className="siimple-grid-col" style={{ width: "16.818%" }}>
            <select
              className="siimple-select siimple-select--fluid"
              onChange={(event) =>
                this.setState({ aspect: event.target.value as any })
              }
            >
              <option value="causal">Causal</option>
              <option value="emotional">Emotional</option>
              <option value="spatial">Spatial</option>
              <option value="possession">Possession</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div className="siimple-grid-col" style={{ width: "16.818%" }}>
            <input
              type="number"
              className="siimple-input siimple-input--fluid"
              min="1"
              max="100"
              value={this.state.number}
              onChange={(event) =>
                this.setState({ number: parseInt(event.target.value) })
              }
            />
          </div>

          <div className="siimple-grid-col" style={{ width: "16.818%" }}>
            <button
              className="siimple-btn siimple-btn--fluid siimple-btn--primary"
              onClick={(event) => this.handleSubmit()}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Setup;
