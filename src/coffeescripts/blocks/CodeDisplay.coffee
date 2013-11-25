`/** @jsx React.DOM */`

CodeDisplay = React.createClass
  render: ->
    html = prettyPrintOne(this.props.block.data.text, this.props.block.data.lang)
    `(
      <div>
        <pre><code dangerouslySetInnerHTML={{__html: html}}></code></pre>
        <div>{this.props.block.data.lang}</div>
      </div>
    )`

module.exports = CodeDisplay