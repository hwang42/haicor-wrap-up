import React from "react";

type ResultProps = { result: [number, string[]] };

class Result extends React.Component<ResultProps> {
  render() {
    const { result } = this.props;
    const [score, path] = result;

    return (
      <div className="siimple-card">
        <div className="siimple-card-header">
          Score: {(score * 100).toFixed(3)}
        </div>

        {path.map((value, index) => (
          <div className="siimple-card-body" key={index}>
            {value}
          </div>
        ))}
      </div>
    );
  }
}

export default Result;
