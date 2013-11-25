/** @jsx React.DOM */;
var ImageDisplay;

ImageDisplay = React.createClass({
  render: function() {
    return (
      <div>
        <img src={this.props.block.data.src} />
      </div>
    );
  }
});

module.exports = ImageDisplay;
