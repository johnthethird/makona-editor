/** @jsx React.DOM */;
var MarkdownEditor;

MarkdownEditor = React.createClass({
  handleChange: function() {
    var text;
    text = this.refs.text.getDOMNode().value;
    return this.props.handleChange({
      id: this.props.block.id,
      data: {
        text: text
      }
    });
  },
  render: function() {
    return <textarea value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>;
  }
});

module.exports = MarkdownEditor;
