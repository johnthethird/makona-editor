###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

HtmlEditor = React.createClass
  displayName: "HtmlEditor"
  render: ->
          `(<div className="mk-block-content">
             this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)
           </div>
          )`

module.exports = HtmlEditor
