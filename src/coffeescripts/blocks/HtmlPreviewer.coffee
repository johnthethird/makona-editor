`/** @jsx React.DOM */`

HtmlPreviewer = React.createClass
  render: ->
    html = this.props.block.data.text
    `<div dangerouslySetInnerHTML={{__html: html}}></div>`

module.exports = HtmlPreviewer
