`/** @jsx React.DOM */`

require("script!../../../vendor/prettify.js")

CodePreviewer = React.createClass
  displayName: "CodePreviewer"
  render: ->
    html = prettyPrintOne(this.props.block.data.text, this.props.block.data.lang)
    `(
      <div>
        <pre><code dangerouslySetInnerHTML={{__html: html}}></code></pre>
        <div>{this.props.block.data.lang}</div>
      </div>
    )`

module.exports = CodePreviewer