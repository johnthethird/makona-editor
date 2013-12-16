`/** @jsx React.DOM */`

marked = require("marked")
marked.setOptions
  gfm: true
  tables: true
  breaks: true
  pedantic: false
  sanitize: true
  smartLists: true
  smartypants: false

MarkdownPreviewer = React.createClass
  render: ->
    html = marked(this.props.block.data.text)
    `<div dangerouslySetInnerHTML={{__html: html}}></div>`

module.exports = MarkdownPreviewer
