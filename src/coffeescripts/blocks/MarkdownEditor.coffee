###* @jsx React.DOM ###
Channel = postal.channel("makona")

ExpandingTextarea = require("../tags/ExpandingTextarea")

MarkdownEditor = React.createClass
  displayName: "MarkdownEditor"
  propTypes:
    block: React.PropTypes.object.isRequired

  getInitialState: ->
    selectionPresent: false

  render: ->
    `(
      <div className="mk-block-content">
        <div className="mk-toolbar">
          <button onClick={this.wrapSelectedWith.bind(this, "**")} disabled={!this.state.selectionPresent}>Bold</button>
          <button onClick={this.wrapSelectedWith.bind(this, "*")} disabled={!this.state.selectionPresent}>Italic</button>
          <button onClick={this.insertAtCaret.bind(this, "\n---\n")}>HR</button>
          <button onClick={this.insertAtStartOfLine.bind(this, "# ")}>H1</button>
          <button onClick={this.insertAtStartOfLine.bind(this, "## ")}>H2</button>
        </div>
        <ExpandingTextarea {...this.props} handleSelect={this.handleSelect} handleKeyDown={this.handleKeyDown} ref="eta" />
      </div>
    )`

  handleKeyDown: (e) ->
    if ((e.metaKey || e.ctrlKey) &&  e.keyCode == 13)
      newBlock = _.extend({}, this.props.block, {mode: 'preview'})
      Channel.publish "block.change", {block: newBlock} if (e.metaKey || e.ctrlKey) && e.keyCode == 13

  handleSelect: (e, id) ->
    {before, selected, after} = this.refs['eta'].getChunks()
    this.setState
      selectionPresent: if selected.length > 0 then true else false

  publishChange: (text) ->
    newBlock = _.cloneDeep(this.props.block)
    newBlock.data.text = text
    Channel.publish "block.change", {block: newBlock}

  insertAtCaret: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = this.refs['eta'].getChunks()
    text = before + chars + selected + after
    this.publishChange(text)
    @setCursorPos before.length + chars.length

  insertAtStartOfLine: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = this.refs['eta'].getChunks()
    lines = before.split("\n")
    theLine = lines.pop()
    # Remove the chars if they already exist at start of line
    if theLine[..chars.length-1] == chars
      combinedLines = if lines.length is 0 then "" else (lines.join("\n") + "\n")
      text = combinedLines + theLine[chars.length..theLine.length] + selected + after
      cursorPos = before.length - chars.length
    else
      combinedLines = if lines.length is 0 then "" else (lines.join("\n") + "\n")
      text = combinedLines + chars + theLine + selected + after
      cursorPos = before.length + chars.length

    this.publishChange(text)
    @setCursorPos cursorPos


  wrapSelectedWith: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = this.refs['eta'].getChunks()
    if selected.length > 0 and selected[..chars.length-1] != chars
      text = before + chars + selected + chars + after
      this.publishChange(text)
      @setCursorPos before.length + chars.length + selected.length + chars.length


  setCursorPos: (pos) ->
    # We have to wait for React to re-render. Is there a more deterministic way to do this?
    setTimeout () =>
      this.refs['eta'].setSelectionRange(pos, pos)
    , 100



module.exports = MarkdownEditor
