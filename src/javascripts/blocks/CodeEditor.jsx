/** @jsx React.DOM */;
var CodeEditor, ExpandingTextarea;

ExpandingTextarea = require("../tags/ExpandingTextarea");

CodeEditor = React.createClass({
  handleChange: function() {
    var lang;
    lang = this.refs.lang.getDOMNode().value;
    return this.props.handleChange({
      id: this.props.block.id,
      data: {
        lang: lang
      }
    });
  },
  render: function() {
    return (
      <div>
        {this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)}
        <br />
        <label>Language: </label><input value={this.props.block.data.lang} ref="lang" onChange={this.handleChange} />
      </div>
    );
  }
});

module.exports = CodeEditor;
