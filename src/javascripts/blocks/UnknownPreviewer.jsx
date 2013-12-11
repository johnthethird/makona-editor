/** @jsx React.DOM */;
var UnknownPreviewer;

UnknownPreviewer = React.createClass({
  render: function() {
    return <div><h4>Unknown Block Type: {this.props.block.type}</h4><pre>{JSON.stringify(this.props.block.data, null, 2)}</pre></div>;
  }
});

module.exports = UnknownPreviewer;
