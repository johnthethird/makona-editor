/** @jsx React.DOM */;
var TextDisplay;

TextDisplay = React.createClass({
  render: function() {
    return React.DOM.pre(null, this.props.block.data.text);
  }
});

module.exports = TextDisplay;
