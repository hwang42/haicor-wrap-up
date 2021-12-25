import React from "react";
import "siimple";

type SelectProps = {
  label: string;
  options?: [string, string][];
  onChange: (value: string) => void;
};

class Select extends React.Component<SelectProps> {
  renderOptions() {
    return (
      <>
        <option value="">
          {this.props.options === undefined ? "Loading..." : "Select one"}
        </option>
        {this.props.options?.map((value) => (
          <option key={value[0]} value={value[0]}>
            {value[1]}
          </option>
        ))}
      </>
    );
  }

  render() {
    return (
      <div className="siimple-form-field">
        <label className="siimple-form-field-label">{this.props.label}</label>
        <select
          className="siimple-select siimple-select--fluid"
          onChange={(event) => this.props.onChange(event.target.value)}
        >
          {this.renderOptions()}
        </select>
      </div>
    );
  }
}

export default Select;
