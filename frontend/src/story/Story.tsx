import React from "react";

import API from "../API";

import Modify from "./Modify";
import Select from "./Select";

type StoryProps = {
  uuid?: string;
  title: string;
  content: string[];
  onEdit: (uuid: string | undefined, title: string, content: string[]) => any;
};

class Story extends React.Component<StoryProps> {
  render() {
    const { uuid, title, content, onEdit: handler } = this.props;

    return (
      <section id="story-editor">
        <h1>Reasoning Context</h1>

        <Select onSelect={handler} />

        <Modify
          uuid={uuid}
          title={title}
          content={content}
          onModify={handler}
        />
      </section>
    );
  }
}

export default Story;
