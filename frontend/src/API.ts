class API {
  base: string = "http://localhost:3001";

  ranges?: [string, string][];
  titles?: [string, string][];

  // Story related API calls
  async populate_stories() {
    return fetch(`${this.base}/api/story`)
      .then((response) => response.json())
      .then(({ stories }) => (this.titles = stories));
  }

  async query_ranges() {
    if (this.titles === undefined)
      await this.populate_stories().catch((error) => alert(error));

    if (this.ranges === undefined) {
      this.ranges = [];
      for (let i = 0; i * 1000 < this.titles!.length; i++) {
        this.ranges.push([
          `${i}`,
          `${i * 1000} - ${Math.min((i + 1) * 1000, this.titles!.length)}`,
        ]);
      }
    }

    return this.ranges;
  }

  async query_stories(range: string) {
    if (this.titles === undefined)
      await this.populate_stories().catch((error) => alert(error));

    const value = parseInt(range);

    return this.titles!.slice(value * 1000, (value + 1) * 1000);
  }

  async query_content(uuid: string) {
    return fetch(`${this.base}/api/story/${uuid}`)
      .then((response) => response.json())
      .then(({ content }) => content);
  }
}

export default new API();
