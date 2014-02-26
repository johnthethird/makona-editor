###* @jsx React.DOM ###

DocumentPreviewer = React.createClass
  displayName: "DocumentPreviewer"
  render: ->
    `(
      <div className="mk-block-content">
        <a href={this.props.block.data.url} target="_blank" >
          <img src={"http://t1.development.kaleosoftware.com" + this.props.block.data.icon_url} /><span>{this.props.block.data.title}</span>
        </a>
      </div>
    )`

module.exports = DocumentPreviewer
