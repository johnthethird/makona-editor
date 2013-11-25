/** @jsx React.DOM */;
var CodeDisplay;

CodeDisplay = React.createClass({
  render: function() {
    var html;
    html = prettyPrintOne(this.props.block.data.text, this.props.block.data.lang);
    return (
      React.DOM.div(null, 
        React.DOM.pre(null, React.DOM.code( {dangerouslySetInnerHTML:{__html: html}})),
        React.DOM.div(null, this.props.block.data.lang)
      )
    );
  }
});

module.exports = CodeDisplay;
