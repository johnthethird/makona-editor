/** @jsx React.DOM */;
var TextPreviewer;

TextPreviewer = React.createClass({
  render: function() {
    return <pre>{this.props.block.data.text}</pre>;
  }
});

module.exports = TextPreviewer;
