`/** @jsx React.DOM */`

# Generic tag that creates an autoexpanding textarea
# Depends on jQuery
ExpandingTextarea = React.createClass
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
    background: "transparent" #for testing

  preStyle:
    #visibility: "hidden"
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
  render: ->
    `(
      <div style={this.containerStyle}>
        <textarea style={this.textareaStyle} value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>
        <pre ref="pre" style={this.preStyle}><div>{this.props.block.data.text+" "}</div></pre>
      </div>
    )`


module.exports = ExpandingTextarea
