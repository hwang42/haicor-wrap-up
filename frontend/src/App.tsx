import React from "react";

import "siimple";

import Step from "./step";
import Story from "./story";

type AppProps = {};
type AppState = {
  mode: "step" | "path" | "graph";
  uuid?: string;
  title: string;
  content: string[];
};

class App extends React.Component<AppProps, AppState> {
  state: AppState = { mode: "step", title: "", content: ["", "", "", "", ""] };

  handleEdit(uuid: string | undefined, title: string, content: string[]) {
    this.setState({ uuid: uuid, title: title, content: content });
  }

  renderModes() {
    const active = "siimple-navbar-item siimple--text-bold";
    const inactive = "siimple-navbar-item";

    const { mode } = this.state;

    return (
      <div className="siimple--float-right">
        <nav
          className={mode === "step" ? active : inactive}
          onClick={() => this.setState({ mode: "step" })}
        >
          Reasoning Step
        </nav>
        <nav
          className={mode === "path" ? active : inactive}
          onClick={() => this.setState({ mode: "path" })}
        >
          Reasoning Path
        </nav>
        <nav
          className={mode === "graph" ? active : inactive}
          onClick={() => this.setState({ mode: "graph" })}
        >
          Reasoning Graph
        </nav>
      </div>
    );
  }

  renderBody() {
    const { mode, content: context } = this.state;

    return (
      <>
        <Step
          className={mode === "step" ? undefined : "siimple--display-none"}
          context={context}
        />

        <div className={mode === "path" ? undefined : "siimple--display-none"}>
          <h1>Path mode</h1>
        </div>

        <div className={mode === "graph" ? undefined : "siimple--display-none"}>
          <h1>Graph mode</h1>
        </div>
      </>
    );
  }

  render() {
    const { uuid, title, content } = this.state;

    return (
      <>
        <header className="siimple-navbar siimple-navbar--primary siimple-navbar--large">
          <nav className="siimple-navbar-title">HAICOR Project</nav>
          <nav className="siimple-navbar-subtitle">Technical Interface</nav>

          {this.renderModes()}
        </header>

        <main className="siimple-content siimple-content--large">
          <Story
            uuid={uuid}
            title={title}
            content={content}
            onEdit={(uuid, title, content) =>
              this.handleEdit(uuid, title, content)
            }
          />

          <section className="siimple-rule" />

          {this.renderBody()}
        </main>
      </>
    );
  }
}

export default App;
