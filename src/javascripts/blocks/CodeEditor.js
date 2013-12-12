/** @jsx React.DOM */;
var CodeEditor, ExpandingTextarea;

ExpandingTextarea = require("../tags/ExpandingTextarea");

CodeEditor = React.createClass({
  handleChange: function() {
    var lang;
    lang = this.refs.lang.getDOMNode().value;
    return this.props.handleChange({
      id: this.props.block.id,
      data: {
        lang: lang
      }
    });
  },
  render: function() {
    return (
      React.DOM.div(null, 
        this.transferPropsTo(ExpandingTextarea(null)),
        React.DOM.br(null ),
        React.DOM.label(null, "Language: " ),React.DOM.input( {value:this.props.block.data.lang, ref:"lang", onChange:this.handleChange} )
      )
    );
  }
});

module.exports = CodeEditor;
