/** @jsx React.DOM */;
var CodeDisplay;

CodeDisplay = React.createClass({
  render: function() {
    var html;
    html = prettyPrintOne(this.props.block.data.text, this.props.block.data.lang);
    return (
      <div>
        <pre><code dangerouslySetInnerHTML={{__html: html}}></code></pre>
        <div>{this.props.block.data.lang}</div>
      </div>
    );
  }
});

module.exports = CodeDisplay;
