/** @jsx React.DOM */;
var BLOCK_REGISTRY, CodeEditor, CodePreviewer, DocumentEditor, DocumentPreviewer, ImageEditor, ImagePreviewer, Makona, MakonaEditor, MakonaEditorRow, MakonaPlusRow, MakonaPreviewList, MakonaPreviewerRow, MakonaRaw, MakonaSortableList, MarkdownEditor, MarkdownPreviewer, QuoteEditor, QuotePreviewer, TextEditor, TextPreviewer, Utils;

Makona = (function() {
  function Makona(opts) {
    opts.node_name = $("#" + opts.node_id).attr("name");
    $("#" + opts.node_id).replaceWith("<div id='" + opts.node_id + "' class='makona-editor'></div>");
    React.renderComponent(MakonaEditor({
      opts: opts
    }), document.getElementById(opts.node_id));
  }

  return Makona;

})();

TextEditor = require("./blocks/TextEditor");

TextPreviewer = require("./blocks/TextPreviewer");

MarkdownEditor = require("./blocks/MarkdownEditor");

MarkdownPreviewer = require("./blocks/MarkdownPreviewer");

CodeEditor = require("./blocks/CodeEditor");

CodePreviewer = require("./blocks/CodePreviewer");

QuoteEditor = require("./blocks/QuoteEditor");

QuotePreviewer = require("./blocks/QuotePreviewer");

ImageEditor = require("./blocks/ImageEditor");

ImagePreviewer = require("./blocks/ImagePreviewer");

DocumentEditor = require("./blocks/DocumentEditor");

DocumentPreviewer = require("./blocks/DocumentPreviewer");

Utils = require("./utils");

MakonaEditor = React.createClass({
  loadBlocksFromServer: function() {
    var _this = this;
    return $.ajax({
      url: this.props.opts.url,
      success: function(blocks) {
        return _this.setState({
          blocks: blocks
        });
      }
    });
  },
  getInitialState: function() {
    return {
      blocks: []
    };
  },
  componentWillMount: function() {
    return this.loadBlocksFromServer();
  },
  componentDidMount: function() {
    var _this = this;
    return $(this.getDOMNode()).on("addRow", function(e, position, block) {
      e.preventDefault();
      return _this.handleAddRow(position, block);
    });
  },
  handleAddRow: function(position, block) {
    var newBlocks;
    block.id = _.max(this.state.blocks, "id").id + 1;
    block.position = position + 0.5;
    newBlocks = this.resortBlocks(this.state.blocks.concat(block));
    return this.setState({
      blocks: newBlocks
    });
  },
  handleChange: function(changedBlock, replaceFlag) {
    var newBlocks;
    newBlocks = this.state.blocks.map(function(block) {
      if (block.id === changedBlock.id) {
        block.data = changedBlock.data;
      }
      return block;
    });
    if (replaceFlag === true) {
      this.replaceState({
        blocks: []
      });
      return this.replaceState({
        blocks: newBlocks
      });
    } else {
      return this.setState({
        blocks: newBlocks
      });
    }
  },
  handleDelete: function(id) {
    var newBlocks;
    newBlocks = _.reject(this.state.blocks, function(block) {
      return block.id === id;
    });
    return this.replaceState({
      blocks: newBlocks
    });
  },
  handleReorder: function(sortedBlocks) {
    this.replaceState({
      blocks: []
    });
    return this.replaceState({
      blocks: sortedBlocks
    });
  },
  resortBlocks: function(blocks) {
    var i;
    i = 0;
    return _.sortBy(blocks, "position").map(function(b, i) {
      b.position = i++;
      return b;
    });
  },
  render: function() {
    return (
      React.DOM.div( {className:"mk-editor"}, 
        React.DOM.h1(null, "Makona Editor"),
        MakonaSortableList(
          {blocks:this.state.blocks,
          opts:this.props.opts,
          handleReorder:this.handleReorder,
          handleChange:this.handleChange,
          handleDelete:this.handleDelete}
        ),
        React.DOM.hr(null ),
        /*<MakonaPreviewList blocks={this.state.blocks} opts={this.props.opts} /> */
        React.DOM.hr(null ),
        MakonaRaw( {blocks:this.state.blocks, opts:this.props.opts})
      )
    );
  }
});

MakonaPreviewList = React.createClass({
  componentDidMount: function() {
    return this.renderRows();
  },
  componentDidUpdate: function() {
    return this.renderRows();
  },
  renderRows: function() {
    return this.props.blocks.map(function(block) {
      return React.renderComponent(MakonaPreviewerRow( {block:block, opts:this.props.opts} ), this.refs['preview' + block.id].getDOMNode());
    }, this);
  },
  render: function() {
    return (
      React.DOM.ol( {className:"mk-preview", ref:"preview"}, 
        this.props.blocks.map(
          function(block){
            return (
              React.DOM.li( {key:"kp"+block.id, 'data-position':block.position}, 
                React.DOM.div( {className:"mk-block mk-block-"+block.type, ref:"preview"+block.id}, 
                  " *Row gets rendered in here* "
                )
              )
            )
          }.bind(this)
        )
      )
    );
  }
});

MakonaSortableList = React.createClass({
  componentDidMount: function() {
    var _this = this;
    return $(this.refs.sortable.getDOMNode()).sortable({
      update: function(event, ui) {
        var sortedBlocks;
        sortedBlocks = [];
        $(_this.refs.sortable.getDOMNode()).find(">li").map(function(i, el) {
          var theBlock;
          theBlock = _.findWhere(_this.props.blocks, {
            id: parseInt(el.id, 10)
          });
          theBlock.position = i;
          return sortedBlocks.push(theBlock);
        });
        return _this.props.handleReorder(sortedBlocks);
      }
    });
  },
  handleDelete: function(id, e) {
    return this.props.handleDelete(id);
  },
  handleEdit: function(id, e) {
    var block;
    block = Utils.blockFromId(this.props.blocks, id);
    block = $.extend(block, {
      mode: 'edit'
    });
    return this.props.handleChange(block);
  },
  handlePreview: function(id, e) {
    var block;
    block = Utils.blockFromId(this.props.blocks, id);
    block = $.extend(block, {
      mode: 'preview'
    });
    return this.props.handleChange(block);
  },
  editClasses: function(id) {
    var block, cx, editClasses;
    block = Utils.blockFromId(this.props.blocks, id);
    cx = React.addons.classSet;
    return editClasses = cx({
      "mk-editor": true,
      "mk-mode-edit": block.mode === 'edit'
    });
  },
  previewClasses: function(id) {
    var block, cx, editClasses;
    block = _.findWhere(this.props.blocks, {
      id: parseInt(id, 10)
    });
    cx = React.addons.classSet;
    return editClasses = cx({
      "mk-previewer": true,
      "mk-mode-preview": (block.mode == null) || (block.mode === 'preview')
    });
  },
  render: function() {
    return (
      React.DOM.ol( {className:"mk-edit", ref:"sortable"}, 
        this.props.blocks.map(
          function(block){
            return (
              React.DOM.li( {className:"Bfc", id:block.id, key:"ks"+block.id, 'data-position':block.position} , 
                React.DOM.div( {className:"mk-block mk-block-"+block.type}, 
                  React.DOM.div( {className:this.editClasses(block.id), ref:"editor"+block.id, onBlur:this.handlePreview.bind(this, block.id)} , 
                    MakonaEditorRow( {block:block, opts:this.props.opts, handleChange:this.props.handleChange} )
                  ),
                  React.DOM.div( {className:this.previewClasses(block.id), ref:"preview"+block.id, onDoubleClick:this.handleEdit.bind(this, block.id)}, 
                    MakonaPreviewerRow( {block:block, opts:this.props.opts} )
                  )
                ),
                React.DOM.div( {className:"mk-block-controls"}, 
                  React.DOM.i( {className:"fa fa-bars m-r-20"} ),
                  React.DOM.a( {href:"#", onClick:this.handleEdit.bind(this, block.id)}, "Edit"),
                  React.DOM.a( {href:"#", onClick:this.handlePreview.bind(this, block.id)}, "Done"),
                  (this.props.blocks.length > 1) ?
                    React.DOM.a( {href:"#", onClick:this.handleDelete.bind(this, block.id)}, "Delete") : ""
                  
                ),
                React.DOM.div( {className:"clear"}),
                MakonaPlusRow( {block:block, opts:this.props.opts} )
              )
            )
          }.bind(this)
        )
      )
    );
  }
});

MakonaEditorRow = React.createClass({
  render: function() {
    return BLOCK_REGISTRY[this.props.block.type].editorClass({block: this.props.block, opts: this.props.opts, handleChange: this.props.handleChange});
  }
});

MakonaPreviewerRow = React.createClass({
  render: function() {
    return BLOCK_REGISTRY[this.props.block.type].previewClass({block: this.props.block, opts: this.props.opts});
  }
});

MakonaPlusRow = React.createClass({
  addRow: function(e, reactid) {
    var newBlock, type;
    type = $("[data-reactid='" + reactid + "'").data("type");
    newBlock = {
      type: type,
      data: BLOCK_REGISTRY[type].newBlockData
    };
    return $(this.getDOMNode()).trigger("addRow", [this.props.block.position, newBlock]);
  },
  render: function() {
    return (
      React.DOM.div( {className:"mk-plus"}, 
        React.DOM.i( {className:"fa fa-plus size-huge"} ),
        React.DOM.a( {href:"#", onClick:this.addRow, 'data-type':"text"}, "Text"),
        React.DOM.a( {href:"#", onClick:this.addRow, 'data-type':"markdown"}, "Markdown"),
        React.DOM.a( {href:"#", onClick:this.addRow, 'data-type':"quote"}, "Quote"),
        React.DOM.a( {href:"#", onClick:this.addRow, 'data-type':"code"}, "Code"),
        React.DOM.a( {href:"#", onClick:this.addRow, 'data-type':"document"}, "Doc"),
        React.DOM.a( {href:"#", onClick:this.addRow, 'data-type':"image"}, "Image")

      )
    );
  }
});

MakonaRaw = React.createClass({
  render: function() {
    return React.DOM.textarea( {name:this.props.opts.node_name, value:JSON.stringify(this.props.blocks)});
  }
});

BLOCK_REGISTRY = {
  text: {
    editorClass: TextEditor,
    previewClass: TextPreviewer,
    newBlockData: {
      mode: 'preview',
      text: "New text block..."
    }
  },
  markdown: {
    editorClass: MarkdownEditor,
    previewClass: MarkdownPreviewer,
    newBlockData: {
      mode: 'preview',
      text: "#New MD block..."
    }
  },
  quote: {
    editorClass: QuoteEditor,
    previewClass: QuotePreviewer,
    newBlockData: {
      mode: 'preview',
      text: "new quote",
      cite: "a person"
    }
  },
  code: {
    editorClass: CodeEditor,
    previewClass: CodePreviewer,
    newBlockData: {
      mode: 'preview',
      text: "new code"
    }
  },
  image: {
    editorClass: ImageEditor,
    previewClass: ImagePreviewer,
    newBlockData: {
      mode: 'preview',
      src: ""
    }
  },
  document: {
    editorClass: DocumentEditor,
    previewClass: DocumentPreviewer,
    newBlockData: {
      mode: 'preview',
      title: ""
    }
  }
};

module.exports = window.Makona = Makona;
