/** @jsx React.DOM */;
var TextDisplay;

TextDisplay = React.createClass({
  render: function() {
    return <pre>{this.props.block.data.text}</pre>;
  }
});

module.exports = TextDisplay;
