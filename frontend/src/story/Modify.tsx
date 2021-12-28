import React from "react";

type ModifyProps = {
  uuid?: string;
  title: string;
  content: string[];
  onModify: (uuid: string | undefined, title: string, content: string[]) => any;
};

class Modify extends React.Component<ModifyProps> {
  handleTitle(event: React.ChangeEvent<HTMLInputElement>) {
    const { content, onModify: handler } = this.props;
    const {
      target: { value },
    } = event;

    handler(undefined, value, content);
  }

  handleContent(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const { uuid, title, content, onModify: handler } = this.props;
    const {
      target: { value },
    } = event;

    handler(
      undefined,
      uuid === undefined ? title : title + " (modified)",
      content.map((val, idx) => (idx === index ? value : val))
    );
  }

  render() {
    const { title, content } = this.props;

    return (
      <>
        <div className="siimple-grid-row">
          <div className="siimple-grid-col siimple-grid-col--12">
            <label className="siimple-label">Story Title:</label>
            <input
              type="text"
              className="siimple-input siimple-input--fluid"
              value={title}
              onChange={(event) => this.handleTitle(event)}
            />
          </div>
        </div>

        <div className="siimple-grid-row">
          <div className="siimple-grid-col siimple-grid-col--12">
            <label className="siimple-label">Story Content:</label>

            {content.map((value, index) => (
              <input
                type="text"
                className={
                  index === content.length - 1
                    ? "siimple-input siimple-input--fluid"
                    : "siimple-input siimple-input--fluid siimple--mb-2"
                }
                value={value}
                key={index}
                onChange={(event) => this.handleContent(index, event)}
              />
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default Modify;
