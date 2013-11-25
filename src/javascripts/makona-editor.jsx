/** @jsx React.DOM */;
var BLOCK_REGISTRY, CodeDisplay, CodeEditor, DocumentDisplay, DocumentEditor, ImageDisplay, ImageEditor, Makona, MakonaDisplayRow, MakonaEditor, MakonaEditorRow, MakonaPlusRow, MakonaPreviewList, MakonaRaw, MakonaSortableList, MarkdownDisplay, MarkdownEditor, QuoteDisplay, QuoteEditor, TextDisplay, TextEditor;

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

TextDisplay = require("./blocks/TextDisplay");

MarkdownEditor = require("./blocks/MarkdownEditor");

MarkdownDisplay = require("./blocks/MarkdownDisplay");

CodeEditor = require("./blocks/CodeEditor");

CodeDisplay = require("./blocks/CodeDisplay");

QuoteEditor = require("./blocks/QuoteEditor");

QuoteDisplay = require("./blocks/QuoteDisplay");

ImageEditor = require("./blocks/ImageEditor");

ImageDisplay = require("./blocks/ImageDisplay");

DocumentEditor = require("./blocks/DocumentEditor");

DocumentDisplay = require("./blocks/DocumentDisplay");

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
      <div className='mk-editor'>
        <h1>Makona Editor</h1>
        <MakonaSortableList
          blocks={this.state.blocks}
          opts={this.props.opts}
          handleReorder={this.handleReorder}
          handleChange={this.handleChange}
          handleDelete={this.handleDelete}
        />
        <hr />
        <MakonaPreviewList blocks={this.state.blocks} opts={this.props.opts} />
        <hr />
        <MakonaRaw blocks={this.state.blocks} opts={this.props.opts}/>
      </div>
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
      return React.renderComponent(<MakonaDisplayRow block={block} opts={this.props.opts} />, this.refs['preview' + block.id].getDOMNode());
    }, this);
  },
  render: function() {
    return (
      <ol className="mk-preview" ref='preview'>
        {this.props.blocks.map(
          function(block){
            return (
              <li key={"kp"+block.id} data-position={block.position}>
                <div className={"mk-block mk-block-"+block.type} ref={"preview"+block.id}>
                  *Row gets rendered in here*
                </div>
              </li>
            )
          }.bind(this)
        )}
      </ol>
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
  handleDelete: function(e) {
    var id;
    id = $(e.target).data("id");
    return this.props.handleDelete(id);
  },
  render: function() {
    return (
      <ol className="mk-edit" ref='sortable'>
        {this.props.blocks.map(
          function(block){
            return (
              <li className="Bfc" id={block.id} key={"ks"+block.id} data-position={block.position}>
                <div className={"mk-block mk-block-"+block.type} ref={"editor"+block.id}>
                  <MakonaEditorRow block={block} opts={this.props.opts} handleChange={this.props.handleChange} />
                </div>
                <div className="mk-block-controls">
                  <i className="fa fa-bars m-r-20" />
                  {(this.props.blocks.length > 1) ?
                    <a href="#" data-id={block.id} onClick={this.handleDelete}>Delete</a> : ""
                  }
                </div>
                <div className='clear'></div>
                <MakonaPlusRow block={block} opts={this.props.opts} />
              </li>
            )
          }.bind(this)
        )}
      </ol>
    );
  }
});

MakonaEditorRow = React.createClass({
  render: function() {
    return BLOCK_REGISTRY[this.props.block.type].editorClass({block: this.props.block, opts: this.props.opts, handleChange: this.props.handleChange});
  }
});

MakonaDisplayRow = React.createClass({
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
      <div className="mk-plus">
        <i className="fa fa-plus size-huge" />
        <a href="#" onClick={this.addRow} data-type="text">Text</a>
        <a href="#" onClick={this.addRow} data-type="markdown">Markdown</a>
        <a href="#" onClick={this.addRow} data-type="quote">Quote</a>
        <a href="#" onClick={this.addRow} data-type="code">Code</a>
        <a href="#" onClick={this.addRow} data-type="document">Doc</a>
        <a href="#" onClick={this.addRow} data-type="image">Image</a>

      </div>
    );
  }
});

MakonaRaw = React.createClass({
  render: function() {
    return <textarea name={this.props.opts.node_name} value={JSON.stringify(this.props.blocks)}></textarea>;
  }
});

BLOCK_REGISTRY = {
  text: {
    editorClass: TextEditor,
    previewClass: TextDisplay,
    newBlockData: {
      text: "New text block..."
    }
  },
  markdown: {
    editorClass: MarkdownEditor,
    previewClass: MarkdownDisplay,
    newBlockData: {
      text: "#New MD block..."
    }
  },
  quote: {
    editorClass: QuoteEditor,
    previewClass: QuoteDisplay,
    newBlockData: {
      text: "new quote",
      cite: "a person"
    }
  },
  code: {
    editorClass: CodeEditor,
    previewClass: CodeDisplay,
    newBlockData: {
      text: "new code"
    }
  },
  image: {
    editorClass: ImageEditor,
    previewClass: ImageDisplay,
    newBlockData: {
      src: ""
    }
  },
  document: {
    editorClass: DocumentEditor,
    previewClass: DocumentDisplay,
    newBlockData: {
      title: ""
    }
  }
};

module.exports = window.Makona = Makona;
