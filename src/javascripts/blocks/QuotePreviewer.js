/** @jsx React.DOM */;
var QuotePreviewer;

QuotePreviewer = React.createClass({
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.pre(null, this.props.block.data.text),
        " By ", React.DOM.i(null, this.props.block.data.cite)
      )
    );
  }
});

module.exports = QuotePreviewer;
