/** @jsx React.DOM */;
var ExpandingTextarea, QuoteEditor;

ExpandingTextarea = require("../tags/ExpandingTextarea");

QuoteEditor = React.createClass({
  handleChange: function() {
    var cite;
    cite = this.refs.cite.getDOMNode().value;
    return this.props.handleChange({
      id: this.props.block.id,
      data: {
        cite: cite
      }
    });
  },
  render: function() {
    return (
      React.DOM.div(null, 
        this.transferPropsTo(ExpandingTextarea(null)),
        React.DOM.br(null ),
        React.DOM.input( {value:this.props.block.data.cite, ref:"cite", onChange:this.handleChange} )
      )
    );
  }
});

module.exports = QuoteEditor;
