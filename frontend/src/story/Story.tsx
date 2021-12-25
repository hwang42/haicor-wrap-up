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

  handleStoryChange(index: number, content: string) {
    this.props.onChange(
      this.props.story,
      this.props.lines.map((v, i) => (i === index ? content : v))
    );
  }

  componentDidMount() {
    API.query_ranges().then((ranges) => this.setState({ ranges: ranges }));
  }

  render() {
    return (
      <div className="siimple-card">
        <div className="siimple-card-header">Story Selection</div>
        <div className="siimple-card-body">
          <div className="siimple-grid">
            <div className="siimple-grid-row">
              <div className="siimple-grid-col siimple-grid-col--4">
                <Select
                  label="Ranges:"
                  options={this.state.ranges}
                  onChange={(value) => this.handleRangeChange(value)}
                />
              </div>
              <div className="siimple-grid-col siimple-grid-col--8">
                <Select
                  label="Titles:"
                  options={this.state.titles}
                  onChange={(value) => this.handleTitleChange(value)}
                />
              </div>
            </div>

            <div className="siimple-grid-row">
              <div className="siimple-grid-col siimple-grid-col--12 siimple-form-field">
                <label className="siimple-form-field-label">Content:</label>
                {this.props.lines.map((value, index) => (
                  <input
                    type="text"
                    className="siimple-input siimple-input--fluid siimple--my-1"
                    key={index}
                    value={value}
                    onChange={(event) =>
                      this.handleStoryChange(index, event.target.value)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Story;
