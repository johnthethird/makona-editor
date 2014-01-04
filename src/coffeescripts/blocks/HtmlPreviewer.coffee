`/** @jsx React.DOM */`

HtmlPreviewer = React.createClass
  displayName: "HtmlPreviewer"
  render: ->
    html = this.props.block.data.text
    `<div dangerouslySetInnerHTML={{__html: html}}></div>`

module.exports = HtmlPreviewer
