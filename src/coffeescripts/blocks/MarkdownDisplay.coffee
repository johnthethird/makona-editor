`/** @jsx React.DOM */`

SHOWDOWN_CONVERTER = new Showdown.converter()
MarkdownDisplay = React.createClass
  render: ->
    html = SHOWDOWN_CONVERTER.makeHtml(this.props.block.data.text)
    `<div dangerouslySetInnerHTML={{__html: html}}></div>`

module.exports = MarkdownDisplay
