import React from "react";

import "siimple";

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
    const { mode } = this.state;

    switch (mode) {
      case "step": {
        return <h1>Step mode</h1>;
      }
      case "path": {
        return <h1>Path mode</h1>;
      }
      case "graph": {
        return <h1>Graph mode</h1>;
      }
    }
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

          <section>{this.renderBody()}</section>
        </main>
      </>
    );
  }
}

export default App;
