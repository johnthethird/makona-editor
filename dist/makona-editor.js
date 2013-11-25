/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function require(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, require);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// The bundle contains no chunks. A empty chunk loading function.
/******/ 	require.e = function requireEnsure(_, callback) {
/******/ 		callback.call(null, this);
/******/ 	};
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	require.modules = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	require.cache = installedModules;
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return require(0);
/******/ })
/************************************************************************/
/******/ ({
/******/ // __webpack_public_path__
/******/ c: "",

/***/ 0:
/***/ function(module, exports, require) {

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

	TextEditor = require(1);

	TextDisplay = require(2);

	MarkdownEditor = require(3);

	MarkdownDisplay = require(4);

	CodeEditor = require(5);

	CodeDisplay = require(6);

	QuoteEditor = require(7);

	QuoteDisplay = require(8);

	ImageEditor = require(9);

	ImageDisplay = require(10);

	DocumentEditor = require(11);

	DocumentDisplay = require(12);

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
	        MakonaPreviewList( {blocks:this.state.blocks, opts:this.props.opts} ),
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
	      return React.renderComponent(MakonaDisplayRow( {block:block, opts:this.props.opts} ), this.refs['preview' + block.id].getDOMNode());
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
	  handleDelete: function(e) {
	    var id;
	    id = $(e.target).data("id");
	    return this.props.handleDelete(id);
	  },
	  render: function() {
	    return (
	      React.DOM.ol( {className:"mk-edit", ref:"sortable"}, 
	        this.props.blocks.map(
	          function(block){
	            return (
	              React.DOM.li( {className:"Bfc", id:block.id, key:"ks"+block.id, 'data-position':block.position}, 
	                React.DOM.div( {className:"mk-block mk-block-"+block.type, ref:"editor"+block.id}, 
	                  MakonaEditorRow( {block:block, opts:this.props.opts, handleChange:this.props.handleChange} )
	                ),
	                React.DOM.div( {className:"mk-block-controls"}, 
	                  React.DOM.i( {className:"fa fa-bars m-r-20"} ),
	                  (this.props.blocks.length > 1) ?
	                    React.DOM.a( {href:"#", 'data-id':block.id, onClick:this.handleDelete}, "Delete") : ""
	                  
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


/***/ },

/***/ 1:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var TextEditor;

	TextEditor = React.createClass({
	  handleChange: function() {
	    var text;
	    text = this.refs.text.getDOMNode().value;
	    return this.props.handleChange({
	      id: this.props.block.id,
	      data: {
	        text: text
	      }
	    });
	  },
	  render: function() {
	    return React.DOM.textarea( {value:this.props.block.data.text, ref:"text", onChange:this.handleChange});
	  }
	});

	module.exports = TextEditor;


/***/ },

/***/ 2:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var TextDisplay;

	TextDisplay = React.createClass({
	  render: function() {
	    return React.DOM.pre(null, this.props.block.data.text);
	  }
	});

	module.exports = TextDisplay;


/***/ },

/***/ 3:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var MarkdownEditor;

	MarkdownEditor = React.createClass({
	  handleChange: function() {
	    var text;
	    text = this.refs.text.getDOMNode().value;
	    return this.props.handleChange({
	      id: this.props.block.id,
	      data: {
	        text: text
	      }
	    });
	  },
	  render: function() {
	    return React.DOM.textarea( {value:this.props.block.data.text, ref:"text", onChange:this.handleChange});
	  }
	});

	module.exports = MarkdownEditor;


/***/ },

/***/ 4:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var MarkdownDisplay, SHOWDOWN_CONVERTER;

	SHOWDOWN_CONVERTER = new Showdown.converter();

	MarkdownDisplay = React.createClass({
	  render: function() {
	    var html;
	    html = SHOWDOWN_CONVERTER.makeHtml(this.props.block.data.text);
	    return React.DOM.div( {dangerouslySetInnerHTML:{__html: html}});
	  }
	});

	module.exports = MarkdownDisplay;


/***/ },

/***/ 5:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var CodeEditor;

	CodeEditor = React.createClass({
	  handleChange: function() {
	    var lang, text;
	    text = this.refs.text.getDOMNode().value;
	    lang = this.refs.lang.getDOMNode().value;
	    return this.props.handleChange({
	      id: this.props.block.id,
	      data: {
	        text: text,
	        lang: lang
	      }
	    });
	  },
	  render: function() {
	    return (
	      React.DOM.div(null, 
	        React.DOM.textarea( {value:this.props.block.data.text, ref:"text", onChange:this.handleChange}),
	        React.DOM.br(null ),
	        React.DOM.label(null, "Language: " ),React.DOM.input( {value:this.props.block.data.lang, ref:"lang", onChange:this.handleChange} )
	      )
	    );
	  }
	});

	module.exports = CodeEditor;


/***/ },

/***/ 6:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var CodeDisplay;

	CodeDisplay = React.createClass({
	  render: function() {
	    var html;
	    html = prettyPrintOne(this.props.block.data.text, this.props.block.data.lang);
	    return (
	      React.DOM.div(null, 
	        React.DOM.pre(null, React.DOM.code( {dangerouslySetInnerHTML:{__html: html}})),
	        React.DOM.div(null, this.props.block.data.lang)
	      )
	    );
	  }
	});

	module.exports = CodeDisplay;


/***/ },

/***/ 7:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var QuoteEditor;

	QuoteEditor = React.createClass({
	  handleChange: function() {
	    var cite, text;
	    text = this.refs.text.getDOMNode().value;
	    cite = this.refs.cite.getDOMNode().value;
	    return this.props.handleChange({
	      id: this.props.block.id,
	      data: {
	        text: text,
	        cite: cite
	      }
	    });
	  },
	  render: function() {
	    return (
	      React.DOM.div(null, 
	        React.DOM.textarea( {value:this.props.block.data.text, ref:"text", onChange:this.handleChange}),
	        React.DOM.br(null ),
	        React.DOM.input( {value:this.props.block.data.cite, ref:"cite", onChange:this.handleChange} )
	      )
	    );
	  }
	});

	module.exports = QuoteEditor;


/***/ },

/***/ 8:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var QuoteDisplay;

	QuoteDisplay = React.createClass({
	  render: function() {
	    return (
	      React.DOM.div(null, 
	        React.DOM.pre(null, this.props.block.data.text),
	        " By ", React.DOM.i(null, this.props.block.data.cite)
	      )
	    );
	  }
	});

	module.exports = QuoteDisplay;


/***/ },

/***/ 9:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var ImageDisplay, ImageEditor;

	ImageDisplay = require(10);

	ImageEditor = React.createClass({
	  componentDidMount: function() {
	    var defaults, node, opts, _ref,
	      _this = this;
	    if (((_ref = this.refs) != null ? _ref.fineuploader : void 0) != null) {
	      node = this.refs.fineuploader.getDOMNode();
	      defaults = {
	        element: node,
	        debug: false,
	        request: {
	          inputName: 'asset',
	          endpoint: 'http://bsg.mil/upload_image',
	          params: {}
	        },
	        validation: {
	          acceptFiles: ["image/jpeg", "image/png", "image/gif"],
	          allowedExtensions: ["gif", "jpg", "jpeg", "png"],
	          sizeLimit: 5000000
	        },
	        deleteFile: {
	          enabled: false,
	          method: "DELETE",
	          endpoint: "http://bsg.mil/delete_uploaded_image",
	          params: {}
	        },
	        retry: {
	          enableAuto: true
	        },
	        resume: {
	          enabled: false
	        },
	        callbacks: {
	          onComplete: function(id, name, response) {
	            if (response.success) {
	              return _this.props.handleChange({
	                id: _this.props.block.id,
	                data: {
	                  src: response.url,
	                  id: response.id
	                }
	              }, true);
	            }
	          }
	        }
	      };
	      opts = $.extend({}, defaults, this.props.opts.ImageEditor);
	      return this.uploader = new qq.FineUploader(opts);
	    }
	  },
	  shouldComponentUpdate: function() {
	    return false;
	  },
	  componentWillUnmount: function() {
	    var container, _results;
	    this.uploader = null;
	    container = this.getDOMNode();
	    _results = [];
	    while (container.lastChild) {
	      _results.push(container.removeChild(container.lastChild));
	    }
	    return _results;
	  },
	  render: function() {
	    return (
	      React.DOM.div(null, 
	         (this.props.block.data.src.length > 0) ? ImageDisplay( {block:this.props.block} ) : React.DOM.div( {ref:"fineuploader"})
	      )
	    );
	  }
	});

	module.exports = ImageEditor;


/***/ },

/***/ 10:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var ImageDisplay;

	ImageDisplay = React.createClass({
	  render: function() {
	    return (
	      React.DOM.div(null, 
	        React.DOM.img( {src:this.props.block.data.src} )
	      )
	    );
	  }
	});

	module.exports = ImageDisplay;


/***/ },

/***/ 11:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var DocumentDisplay, DocumentEditor;

	DocumentDisplay = require(12);

	DocumentEditor = React.createClass({
	  componentDidMount: function() {
	    var defaults, node, opts, _ref,
	      _this = this;
	    if (((_ref = this.refs) != null ? _ref.fineuploader : void 0) != null) {
	      node = this.refs.fineuploader.getDOMNode();
	      defaults = {
	        element: node,
	        debug: false,
	        request: {
	          inputName: 'asset',
	          endpoint: 'http://bsg.mil/upload_document',
	          params: {}
	        },
	        validation: {
	          acceptFiles: [],
	          allowedExtensions: [],
	          sizeLimit: 5000000
	        },
	        deleteFile: {
	          enabled: false,
	          method: "DELETE",
	          endpoint: "http://bsg.mil/delete_uploaded_document",
	          params: {}
	        },
	        retry: {
	          enableAuto: true
	        },
	        resume: {
	          enabled: false
	        },
	        callbacks: {
	          onComplete: function(id, name, response) {
	            if (response.success) {
	              return _this.props.handleChange({
	                id: _this.props.block.id,
	                data: {
	                  src: response.url,
	                  id: response.id,
	                  icon_url: response.icon_url,
	                  title: response.title
	                }
	              }, true);
	            }
	          }
	        }
	      };
	      opts = $.extend({}, defaults, this.props.opts.DocumentEditor);
	      return this.uploader = new qq.FineUploader(opts);
	    }
	  },
	  shouldComponentUpdate: function() {
	    return false;
	  },
	  componentWillUnmount: function() {
	    var container, _results;
	    this.uploader = null;
	    container = this.getDOMNode();
	    _results = [];
	    while (container.lastChild) {
	      _results.push(container.removeChild(container.lastChild));
	    }
	    return _results;
	  },
	  render: function() {
	    return (
	      React.DOM.div(null, 
	         (this.props.block.data.title.length > 0) ? DocumentDisplay( {block:this.props.block} ) : React.DOM.div( {ref:"fineuploader"})
	      )
	    );
	  }
	});

	module.exports = DocumentEditor;


/***/ },

/***/ 12:
/***/ function(module, exports, require) {

	/** @jsx React.DOM */;
	var DocumentDisplay;

	DocumentDisplay = React.createClass({
	  render: function() {
	    return (
	      React.DOM.a( {href:this.props.block.data.url} , 
	        React.DOM.img( {src:"http://t1.development.kaleosoftware.com" + this.props.block.data.icon_url} ),React.DOM.span(null, this.props.block.data.title)
	      )
	    );
	  }
	});

	module.exports = DocumentDisplay;


/***/ }
/******/ })