type StepParameter = {
  usage: "general" | "premise";
  order: "forward" | "backward";
  aspect: "causal" | "emotional" | "spatial" | "possession" | "miscellaneous";
  number: number;
  context: string[];
  question: string;
};
type StepCallback = (state: "waiting" | "running" | "stopped") => any;

type PathParameter = {
  source: string;
  target: string;
  context: string[];
  length: number;
  branch: number;
  total: number;
};
type PathCallback = (state: string, width: number, message: string) => any;

type GraphParameter = {
  target: string;
  context: string[];
  length: number;
  branch: number;
  total: number;
};
type GraphCallback = (state: string, width: number, message: string) => any;

class API {
  base: string = "http://localhost:3001";

  titles?: [string, string][];
  ranges?: [string, string][];

  // API calls related to the Story component
  async query_and_cache() {
    type ReturnType = { stories: [string, string][] };

    // populate and cache this.titles
    this.titles = await fetch(`${this.base}/api/story`)
      .then((response) => response.json())
      .then((response: ReturnType) => response.stories);

    // populate and cache this.ranges
    this.ranges = [];
    for (let group = 0; group * 1000 < this.titles.length; group++) {
      const lower = group * 1000;
      const upper = Math.min(lower + 1000, this.titles.length);
      this.ranges.push([group.toString(), `${lower} - ${upper}`]);
    }
  }

  async query_ranges() {
    if (this.titles === undefined || this.ranges === undefined)
      await this.query_and_cache();

    return this.ranges!;
  }

  async query_titles(group: string) {
    if (this.titles === undefined || this.ranges === undefined)
      await this.query_and_cache();

    const lower = parseInt(group) * 1000;
    const upper = lower + 1000;

    return this.titles!.slice(lower, upper);
  }

  async query_story(uuid: string) {
    type ReturnType = { uuid: string; title?: string; lines?: string[] };

    return fetch(`${this.base}/api/story/${uuid}`)
      .then((response) => response.json())
      .then((response: ReturnType) => response);
  }

  // API call related to the Step component
  async step_inference(parameters: StepParameter, callback: StepCallback) {
    type POSTReturnType = { uuid: string };
    type GETReturnType = {
      state: "waiting" | "running" | "stopped";
      result?: [number, string][];
    };

    // post inference task and obtain UUID
    const uuid = await fetch(`${this.base}/api/step`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameters),
    })
      .then((response) => response.json())
      .then((response: POSTReturnType) => response.uuid);

    // wait for inference task to finish
    let result: GETReturnType = { state: "waiting" };
    while (result.state !== "stopped") {
      result = await fetch(`${this.base}/api/step/${uuid}`)
        .then((response) => response.json())
        .then((response: GETReturnType) => response);

      callback(result.state);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return result.result!;
  }

  // API call related to the Path component
  async path_inference(parameters: PathParameter, callback: PathCallback) {
    type POSTReturnType = { uuid: string };
    type GETReturnType = {
      state: string;
      result?: [number, string[]][];
    };

    const path_length = parameters.length;
    const total_steps = 4 + 2 * path_length;

    // post inference task and obtain UUID
    const uuid = await fetch(`${this.base}/api/path`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameters),
    })
      .then((response) => response.json())
      .then((response: POSTReturnType) => response.uuid);

    // wait for inference task to finish
    let result: GETReturnType = { state: "waiting" };
    while (result.state !== "stopped") {
      result = await fetch(`${this.base}/api/path/${uuid}`)
        .then((response) => response.json())
        .then((response: GETReturnType) => response);

      let width = 0;
      let message = "";
      if (result.state === "waiting") {
        width = 1 / total_steps;
        message = "Submitted";
      } else if (result.state === "c") {
        width = (1 + 2 * path_length) / total_steps;
        message = "Connecting";
      } else if (result.state === "s") {
        width = (2 + 2 * path_length) / total_steps;
        message = "Searching";
      } else if (result.state === "stopped") {
        width = 1;
        message = "Completed";
      } else if (result.state.startsWith("f")) {
        width = (1 + parseInt(result.state.substring(1))) / total_steps;
        message = `Forward search ${result.state.substring(1)}`;
      } else if (result.state.startsWith("b")) {
        width =
          (1 + path_length + parseInt(result.state.substring(1))) / total_steps;
        message = `Backward search ${result.state.substring(1)}`;
      }

      callback(result.state, width, message);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return result.result!;
  }

  // API call related to the Graph component
  async graph_inference(parameters: GraphParameter, callback: GraphCallback) {
    type POSTReturnType = { uuid: string };
    type GETReturnType = {
      state: string;
      result?: [number, string[]][];
    };

    const path_length = parameters.length;
    const total_steps = 4 + 2 * path_length;

    // post inference task and obtain UUID
    const uuid = await fetch(`${this.base}/api/graph`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameters),
    })
      .then((response) => response.json())
      .then((response: POSTReturnType) => response.uuid);

    // wait for inference task to finish
    let result: GETReturnType = { state: "waiting" };
    while (result.state !== "stopped") {
      result = await fetch(`${this.base}/api/graph/${uuid}`)
        .then((response) => response.json())
        .then((response: GETReturnType) => response);

      let width = 0;
      let message = "";
      if (result.state === "waiting") {
        width = 1 / total_steps;
        message = "Submitted";
      } else if (result.state === "c") {
        width = (1 + 2 * path_length) / total_steps;
        message = "Connecting";
      } else if (result.state === "s") {
        width = (2 + 2 * path_length) / total_steps;
        message = "Searching";
      } else if (result.state === "stopped") {
        width = 1;
        message = "Completed";
      } else if (result.state.startsWith("f")) {
        width = (1 + parseInt(result.state.substring(1))) / total_steps;
        message = `Forward search ${result.state.substring(1)}`;
      } else if (result.state.startsWith("b")) {
        width =
          (1 + path_length + parseInt(result.state.substring(1))) / total_steps;
        message = `Backward search ${result.state.substring(1)}`;
      }

      callback(result.state, width, message);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return result.result!;
  }
}

export default new API();
