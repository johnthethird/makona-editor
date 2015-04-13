###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################
Channel           = postal.channel("makona")
ExpandingTextarea = require("../tags/ExpandingTextarea")


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


MarkdownEditor = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "MarkdownEditor"
  propTypes:
    block: React.PropTypes.object.isRequired

  getInitialState: ->
    selectionPresent: false


  ##############################
  ### Render                 ###
  ##############################
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
        <ExpandingTextarea {...this.props} cursorPosition={0} positionCursor={false} handleSelect={this.handleSelect} handleKeyDown={this.handleKeyDown} ref="eta" />
      </div>
    )`


  ##############################
  ### Life Cycle             ###
  ##############################
  # componentWillMount
  # componentDidMount
  # componentWillReceiveProps
  # shouldComponentUpdate
  # componentWillUpdate
  # componentWillUnmount

  componentDidUpdate: ->
    # Only set the cursor position when the text area is already there and the component has been flagged to set the position.
    if @textArea()? and @props.positionCursor
      @textArea().setSelectionRange(@props.cursorPosition, @props.cursorPosition)


  ##############################
  ### Custom Methods         ###
  ##############################

  handleKeyDown: (e) ->
    if ((e.metaKey || e.ctrlKey) &&  e.keyCode == 13)
      newBlock = _.extend({}, @props.block, {mode: 'preview'})
      Channel.publish "block.change", {block: newBlock} if (e.metaKey || e.ctrlKey) && e.keyCode == 13

  handleSelect: (e, id) ->
    {before, selected, after} = @textArea().getChunks()
    @setState
      selectionPresent: if selected.length > 0 then true else false

  publishChange: (text, cursorPosition) ->
    newBlock = _.cloneDeep(@props.block)
    newBlock.data.text = text
    Channel.publish "block.change", {block: newBlock}

  insertAtCaret: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = @textArea().getChunks()
    text = before + chars + selected + after
    cursorPos = before.length + chars.length
    @publishChange(text, cursorPos)

  insertAtStartOfLine: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = @textArea().getChunks()
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
    @publishChange(text, cursorPos)

  wrapSelectedWith: (chars, e) ->
    e.preventDefault()
    {before, selected, after} = @textArea().getChunks()
    if selected.length > 0 and selected[..chars.length-1] != chars
      text = before + chars + selected + chars + after
      @publishChange(text)
      cursorPos = before.length + chars.length + selected.length + chars.length
    @publishChange(text, cursorPos)

  # Shortcut to select the editor's text area by ref.
  textArea: ->
    if @refs.eta? then @refs.eta else false


# Export to make available
module.exports = MarkdownEditor
