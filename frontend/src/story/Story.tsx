import React from "react";
import "siimple";

import API from "../API";

import Select from "./Select";

type StoryProps = {
  story?: string;
  lines?: string[];
  onSubmit: (story: string, lines: string[]) => void;
};
type StoryState = {
  ranges?: [string, string][];
  titles?: [string, string][];

  story: string;
  lines: string[];
};

class Story extends React.Component<StoryProps, StoryState> {
  state: StoryState = { story: "", lines: ["", "", "", "", ""] };

  handleRangeChange(value: string) {
    if (value === "") this.setState({ titles: [] });

    API.query_stories(value)
      .then((stories) => this.setState({ titles: stories }))
      .catch((error) => alert(error));
  }

  handleTitleChange(value: string) {
    this.setState({ story: value });
    if (value === "") this.setState({ lines: ["", "", "", "", ""] });
    else
      API.query_content(value)
        .then((content) => this.setState({ lines: content }))
        .catch((error) => alert(error));
  }

  handleContentChange(index: number, value: string) {}

  componentDidMount() {
    API.query_ranges()
      .then((ranges) => this.setState({ ranges: ranges }))
      .catch((error) => alert(error));
  }

  render() {
    return (
      <div className="siimple-card">
        <div className="siimple-card-header">Story Selection</div>
        <div className="siimple-card-body">
          {/* Story selection region */}

          <div className="siimple-grid">
            <div className="siimple-grid-row">
              <div className="siimple-grid-col siimple-grid-col--4">
                {/* To select a story, first select a range (performance reason) */}

                <Select
                  label="Range:"
                  options={this.state.ranges || []}
                  onChange={(value) => this.handleRangeChange(value)}
                />
              </div>
              <div className="siimple-grid-col siimple-grid-col--8">
                {/* To select a story, then select a title (title may repeat) */}

                <Select
                  label="Title:"
                  options={this.state.titles || []}
                  onChange={(value) => this.handleTitleChange(value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Story modification region */}
        <div className="siimple-card-body">
          {this.state.lines.map((value, index) => (
            <>
              <input
                key={index}
                type="text"
                value={value}
                className="siimple--my-1 siimple-input siimple-input--fluid"
                onChange={(event) =>
                  this.handleContentChange(index, event.target.value)
                }
              />
            </>
          ))}
        </div>

        {/* Story submission region */}
        <div className="siimple-card-body">
          <div className="siimple--clearfix">
            <div className="siimple--float-right">
              <button
                className="siimple-btn siimple-btn--primary"
                onClick={(event) =>
                  this.props.onSubmit(this.state.story, this.state.lines)
                }
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Story;
