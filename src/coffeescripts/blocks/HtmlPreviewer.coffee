###* @jsx React.DOM ###

HtmlPreviewer = React.createClass
  displayName: "HtmlPreviewer"
  render: ->
    html = this.props.block.data.text
    `<div  className="mk-block-content" dangerouslySetInnerHTML={{__html: html}}></div>`

module.exports = HtmlPreviewer
