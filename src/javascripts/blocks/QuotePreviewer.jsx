/** @jsx React.DOM */;
var QuotePreviewer;

QuotePreviewer = React.createClass({
  render: function() {
    return (
      <div>
        <pre>{this.props.block.data.text}</pre>
        By <i>{this.props.block.data.cite}</i>
      </div>
    );
  }
});

module.exports = QuotePreviewer;
