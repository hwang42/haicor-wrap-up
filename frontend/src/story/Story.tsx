import React from "react";
import "siimple";

import API from "../API";

import Select from "./Select";

type StoryProps = {
  story?: string;
  lines: string[];
  onChange: (story: string | undefined, lines: string[]) => void;
};
type StoryState = {
  ranges?: [string, string][];
  titles?: [string, string][];
};

class Story extends React.Component<StoryProps, StoryState> {
  state: StoryState = {};

  handleRangeChange(value: string) {
    if (value === "") this.setState({ titles: undefined });
    else
      API.query_titles(value).then((titles) =>
        this.setState({ titles: titles })
      );
  }

  handleTitleChange(value: string) {
    API.query_story(value)
      .then((story) => ({
        story: story.title,
        lines: story.lines === undefined ? ["", "", "", "", ""] : story.lines,
      }))
      .then((value) => this.props.onChange(value.story, value.lines));
  }

  handleLineChange(line: number, content: string) {
    this.props.onChange(
      undefined,
      this.props.lines.map((value, index) => (index === line ? content : value))
    );
  }

  componentDidMount() {
    API.query_ranges().then((ranges) => this.setState({ ranges: ranges }));
  }

  render() {
    return (
      <div className="siimple-card">
        <div className="siimple-card-header">Story Context</div>
        <div className="siimple-card-body">
          <Select
            label="Ranges:"
            options={this.state.ranges}
            onChange={(value) => this.handleRangeChange(value)}
          />

          <Select
            label="Titles:"
            options={this.state.titles}
            onChange={(value) => this.handleTitleChange(value)}
          />

          <div className="siimple-field siimple--my-2">
            <label className="siimple-field-label">Story:</label>
            <input
              type="text"
              className="siimple-input siimple-input--fluid siimple--my-1"
              value={this.props.lines[0]}
              onChange={(event) => this.handleLineChange(0, event.target.value)}
            />
            <input
              type="text"
              className="siimple-input siimple-input--fluid siimple--my-1"
              value={this.props.lines[1]}
              onChange={(event) => this.handleLineChange(1, event.target.value)}
            />
            <input
              type="text"
              className="siimple-input siimple-input--fluid siimple--my-1"
              value={this.props.lines[2]}
              onChange={(event) => this.handleLineChange(2, event.target.value)}
            />
            <input
              type="text"
              className="siimple-input siimple-input--fluid siimple--my-1"
              value={this.props.lines[3]}
              onChange={(event) => this.handleLineChange(3, event.target.value)}
            />
            <input
              type="text"
              className="siimple-input siimple-input--fluid siimple--my-1"
              value={this.props.lines[4]}
              onChange={(event) => this.handleLineChange(4, event.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Story;
