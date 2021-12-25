import React from "react";
import "siimple";

import Step from "./step/Step";
import Story from "./story/Story";

type AppProps = {};
type AppState = {
  story?: string;
  lines: string[];
};

class App extends React.Component<AppProps, AppState> {
  state: AppState = { lines: ["", "", "", "", ""] };

  render() {
    return (
      <div className="layout">
        <Story
          story={this.state.story}
          lines={this.state.lines}
          onChange={(story, lines) =>
            this.setState({ story: story, lines: lines })
          }
        />

        <div />

        <Step lines={this.state.lines} />
      </div>
    );
  }
}

export default App;
