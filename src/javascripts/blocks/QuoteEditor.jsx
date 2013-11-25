/** @jsx React.DOM */;
var QuoteEditor;

QuoteEditor = React.createClass({
  handleChange: function() {
    var cite, text;
    text = this.refs.text.getDOMNode().value;
    cite = this.refs.cite.getDOMNode().value;
    return this.props.handleChange({
      id: this.props.block.id,
      data: {
        text: text,
        cite: cite
      }
    });
  },
  render: function() {
    return (
      <div>
        <textarea value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>
        <br />
        <input value={this.props.block.data.cite} ref="cite" onChange={this.handleChange} />
      </div>
    );
  }
});

module.exports = QuoteEditor;
