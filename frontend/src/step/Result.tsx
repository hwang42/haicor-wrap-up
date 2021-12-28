import React from "react";

const pattern = /^(.+)>(.+)>(.+)$/;

type ResultProps = { parse: boolean; result: [number, string] };

class Result extends React.Component<ResultProps> {
  renderUnstructured() {
    const {
      result: [score, result],
    } = this.props;

    return (
      <div
        className="siimple--display-flex"
        style={{ alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <code
          className="siimple--text-center siimple--pt-3"
          style={{ width: "6rem" }}
        >
          {(score * 100).toFixed(3)}
        </code>
        <pre className="siimple-pre" style={{ width: "calc(100% - 6rem" }}>
          {result}
        </pre>
      </div>
    );
  }

  renderStructured() {
    const {
      result: [score, result],
    } = this.props;
    const match = pattern.exec(result);

    if (match === null) return this.renderUnstructured();

    return (
      <div className="siimple-card">
        <div className="siimple-card-header">
          Score: {(score * 100).toFixed(3)}
        </div>

        <div className="siimple-card-body">{match[1]}</div>

        <div className="siimple-card-body">{match[2]}</div>

        <div className="siimple-card-body">{match[3]}</div>
      </div>
    );
  }

  render() {
    const { parse } = this.props;

    if (parse) return this.renderStructured();
    else return this.renderUnstructured();
  }
}

export default Result;
