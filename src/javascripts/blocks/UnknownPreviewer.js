/** @jsx React.DOM */;
var UnknownPreviewer;

UnknownPreviewer = React.createClass({
  render: function() {
    return React.DOM.div(null, React.DOM.h4(null, "Unknown Block Type: ", this.props.block.type),React.DOM.pre(null, JSON.stringify(this.props.block.data, null, 2)));
  }
});

module.exports = UnknownPreviewer;
