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
      .then((response: ReturnType) => response.stories)
      .catch((error) => {
        alert(error);
        return [];
      });

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

    return this.ranges;
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
}

export default new API();
