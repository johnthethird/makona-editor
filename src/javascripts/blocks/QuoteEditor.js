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
      React.DOM.div(null, 
        React.DOM.textarea( {value:this.props.block.data.text, ref:"text", onChange:this.handleChange}),
        React.DOM.br(null ),
        React.DOM.input( {value:this.props.block.data.cite, ref:"cite", onChange:this.handleChange} )
      )
    );
  }
});

module.exports = QuoteEditor;
