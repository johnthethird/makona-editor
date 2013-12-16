`/** @jsx React.DOM */`

ExpandingTextarea = require("../tags/ExpandingTextarea")

MarkdownEditor = React.createClass

  render: ->
    `(
      <div>
        <div className="mk-toolbar">
          <button onClick={this.wrapSelectedWith.bind(this, "**")}>Bold</button>
          <button onClick={this.wrapSelectedWith.bind(this, "*")}>Italic</button>
          <button onClick={this.insertAtCaret.bind(this, "\n---\n")}>HR</button>
          <button onClick={this.insertAtStartOfLine.bind(this, "# ")}>H1</button>
          <button onClick={this.insertAtStartOfLine.bind(this, "## ")}>H2</button>
        </div>
        {this.transferPropsTo(<ExpandingTextarea ref="eta"></ExpandingTextarea>)}
      </div>
    )`

  insertAtCaret: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = this.refs['eta'].getChunks()
    text = before + chars + selected + after
    this.props.handleChange(id: this.props.block.id, data: {text: text})
    @setCursorPos before.length + chars.length

  insertAtStartOfLine: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = this.refs['eta'].getChunks()
    lines = before.split("\n")
    theLine = lines.pop()
    # Remove the chars if they already exist at start of line
    if theLine.match(new RegExp("^#{chars}", 'gi'))
      combinedLines = if lines.length is 0 then "" else (lines.join("\n") + "\n")
      text = combinedLines + theLine[chars.length..theLine.length] + selected + after
      cursorPos = before.length - chars.length
    else
      combinedLines = if lines.length is 0 then "" else (lines.join("\n") + "\n")
      text = combinedLines + chars + theLine + selected + after
      cursorPos = before.length + chars.length

    this.props.handleChange(id: this.props.block.id, data: {text: text})
    @setCursorPos cursorPos


  wrapSelectedWith: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = this.refs['eta'].getChunks()
    if selected.length > 0
      text = before + chars + selected + chars + after
      this.props.handleChange(id: this.props.block.id, data: {text: text})
      @setCursorPos before.length + chars.length + selected.length + chars.length


  setCursorPos: (pos) ->
    # We have to wait for React to re-render. Is there a more deterministic way to do this?
    setTimeout () =>
      this.refs['eta'].setSelectionRange(pos, pos)
    , 100



module.exports = MarkdownEditor
