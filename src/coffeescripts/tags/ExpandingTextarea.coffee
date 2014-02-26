###* @jsx React.DOM ###

# Generic tag that creates an autoexpanding textarea
# Depends on jQuery
ExpandingTextarea = React.createClass
  displayName: "ExpandingTextarea"
  cloneCSSProperties: [
    'lineHeight', 'textDecoration', 'letterSpacing',
    'fontSize', 'fontFamily', 'fontStyle',
    'fontWeight', 'textTransform', 'textAlign',
    'direction', 'wordSpacing', 'fontSizeAdjust',
    'wordWrap', 'word-break',
    'borderLeftWidth', 'borderRightWidth',
    'borderTopWidth','borderBottomWidth',
    'paddingLeft', 'paddingRight',
    'paddingTop','paddingBottom',
    'marginLeft', 'marginRight',
    'marginTop','marginBottom',
    'boxSizing', 'webkitBoxSizing', 'mozBoxSizing', 'msBoxSizing'
  ]

  containerStyle:
    position: "relative"

  textareaStyle:
    position: "absolute"
    height: "100%"
    width: "100%"
    resize: "none"
    marginBottom: "5px"
    background: "transparent" #for testing

  preStyle:
    visibility: "hidden"
    border: "0 solid"
    whiteSpace: "pre-wrap"

  originalTextareaStyles: {}

  componentDidMount: ->
    $textarea = $(this.refs.text.getDOMNode())
    @originalTextareaStyles = _.zipObject(@cloneCSSProperties, _.map(@cloneCSSProperties, (p) -> $textarea.css(p)))
    # Copy any styles from the textarea to the pre, so they stay aligned
    $pre = $(this.refs.pre.getDOMNode())
    _.forIn @originalTextareaStyles, (val, prop) ->
      $pre.css(prop, val) if $pre.css(prop) != val

  handleChange: ->
    text = this.refs.text.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {text: text}})

  # The <pre> is hidden behind the textarea and mirrors the content. In this way the pre controls the size.
  # The +" " is a hack so the scrollbar doesnt show up
  # if a props.handleSelect exists it is connected up to onSelect
  render: ->
    `(
      <div style={this.containerStyle}>
        <textarea onSelect={this.props.handleSelect} style={this.textareaStyle} value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>
        <pre ref="pre" style={this.preStyle}><div>{this.props.block.data.text+" "}</div></pre>
      </div>
    )`

  # {before: "Ill", selected: "be", after: "back"}
  getChunks: () ->
    {start, end} = @getSelection()
    text = this.props.block.data.text

    before: if start is 0 then "" else text[0..start-1]
    selected: if end is 0 then "" else text[start..end-1]
    after: text[end..text.length]

  # {start: 2, end: 18} caret position or selection range of textarea
  # Thanks to http://stackoverflow.com/questions/263743/how-to-get-caret-position-in-textarea
  getSelection: () ->
    # IE only works if the textarea has focus
    el = this.refs['text'].getDOMNode()
    el.focus()
    start = end = 0
    normalizedValue = range = textInputRange = len = endRange = undefined
    if typeof el.selectionStart is "number" and typeof el.selectionEnd is "number"
      start = el.selectionStart
      end = el.selectionEnd
    else
      range = document.selection.createRange()
      if range and range.parentElement() is el
        len = el.value.length
        normalizedValue = el.value.replace(/\r\n/g, "\n")

        # Create a working TextRange that lives only in the input
        textInputRange = el.createTextRange()
        textInputRange.moveToBookmark range.getBookmark()

        # Check if the start and end of the selection are at the very end
        # of the input, since moveStart/moveEnd doesn't return what we want
        # in those cases
        endRange = el.createTextRange()
        endRange.collapse false
        if textInputRange.compareEndPoints("StartToEnd", endRange) > -1
          start = end = len
        else
          start = -textInputRange.moveStart("character", -len)
          start += normalizedValue.slice(0, start).split("\n").length - 1
          if textInputRange.compareEndPoints("EndToEnd", endRange) > -1
            end = len
          else
            end = -textInputRange.moveEnd("character", -len)
            end += normalizedValue.slice(0, end).split("\n").length - 1
    start: start
    end: end

  setSelectionRange: (selectionStart, selectionEnd) ->
    input = this.refs['text'].getDOMNode()
    if input.setSelectionRange
      input.focus()
      input.setSelectionRange selectionStart, selectionEnd
    else if input.createTextRange
      range = input.createTextRange()
      range.collapse true
      range.moveEnd "character", selectionEnd
      range.moveStart "character", selectionStart
      range.select()

module.exports = ExpandingTextarea
