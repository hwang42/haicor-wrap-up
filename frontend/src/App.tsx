import React from "react";
import "siimple";

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
        <div>
          <Story
            story={this.state.story}
            lines={this.state.lines}
            onChange={(story, lines) =>
              this.setState({ story: story, lines: lines })
            }
          />
        </div>
      </div>
    );
  }
}

export default App;
