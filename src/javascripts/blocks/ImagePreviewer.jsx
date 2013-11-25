/** @jsx React.DOM */;
var ImagePreviewer;

ImagePreviewer = React.createClass({
  render: function() {
    return (
      <div>
        <img src={this.props.block.data.src} />
      </div>
    );
  }
});

module.exports = ImagePreviewer;
