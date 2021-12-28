import React from "react";

import API from "../API";

type SelectProps = {
  onSelect: (uuid: string | undefined, title: string, content: string[]) => any;
};
type SelectState = {
  uuid?: string;
  ranges?: [string, string][];
  titles?: [string, string][];
};

class Select extends React.Component<SelectProps, SelectState> {
  state: SelectState = {};

  handleRanges(event: React.ChangeEvent<HTMLSelectElement>) {
    const {
      target: { value },
    } = event;

    if (value === "") this.setState({ titles: undefined });
    else
      API.query_titles(value).then((titles) =>
        this.setState({ titles: titles })
      );
  }

  handleTitles(event: React.ChangeEvent<HTMLSelectElement>) {
    const { onSelect: handler } = this.props;
    const {
      target: { value },
    } = event;

    if (value === "") this.setState({ uuid: undefined });
    else
      API.query_story(value).then(({ uuid, title, lines }) => {
        handler(uuid, title!, lines!);
      });
  }

  componentDidMount() {
    API.query_ranges().then((ranges) => this.setState({ ranges: ranges }));
  }

  renderOptions(placeholder: string, options?: [string, string][]) {
    if (options == undefined) return <option value="">{placeholder}</option>;

    return (
      <>
        <option value="">Select one</option>
        {options.map(([value, text], index) => (
          <option value={value} key={index}>
            {text}
          </option>
        ))}
      </>
    );
  }

  render() {
    const { ranges, titles } = this.state;

    return (
      <div className="siimple-grid-row">
        <div className="siimple-grid-col siimple-grid-col--6">
          <label className="siimple-label">Ranges:</label>
          <select
            className="siimple-select siimple-select--fluid"
            onChange={(event) => this.handleRanges(event)}
          >
            {this.renderOptions("Loading...", ranges)}
          </select>
        </div>

        <div className="siimple-grid-col siimple-grid-col--6">
          <label className="siimple-label">Titles:</label>
          <select
            className="siimple-select siimple-select--fluid"
            onChange={(event) => this.handleTitles(event)}
          >
            {this.renderOptions("Select range", titles)}
          </select>
        </div>
      </div>
    );
  }
}

export default Select;
