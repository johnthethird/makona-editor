/** @jsx React.DOM */;
var TextPreviewer;

TextPreviewer = React.createClass({
  render: function() {
    return React.DOM.pre(null, this.props.block.data.text);
  }
});

module.exports = TextPreviewer;
