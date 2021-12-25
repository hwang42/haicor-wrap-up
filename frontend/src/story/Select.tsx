import React from "react";
import "siimple";

type SelectProps = {
  label: string;
  options: [string, string][];
  onChange: (value: string) => void;
};

class Select extends React.Component<SelectProps> {
  render() {
    return (
      <div className="siimple-form-field">
        <span className="siimple-form-field-label">{this.props.label}</span>
        <select
          className="siimple-select siimple-select--fluid"
          onChange={(event) => this.props.onChange(event.target.value)}
        >
          <option value="">Select option</option>
          {this.props.options.map((value, index) => (
            <option key={index} value={value[0]}>
              {value[1]}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

export default Select;
