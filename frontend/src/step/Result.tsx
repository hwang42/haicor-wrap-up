import React from "react";

type ResultProps = { result: [number, string][]; waiting: boolean };

class Result extends React.Component<ResultProps> {
  render() {
    if (this.props.waiting)
      return <div className="siimple--text-center">Loading...</div>;

    return (
      <>
        {this.props.result.map((value, index) => (
          <pre key={index}>
            {value[0].toFixed(5)} - {value[1]}
          </pre>
        ))}
      </>
    );
  }
}

export default Result;
