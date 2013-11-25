/** @jsx React.DOM */;
var CodePreviewer;

CodePreviewer = React.createClass({
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

module.exports = CodePreviewer;
