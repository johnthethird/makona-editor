var BLOCK_REGISTRY, Utils;

BLOCK_REGISTRY = {
  "text": {
    editorClass: require("./blocks/TextEditor"),
    previewClass: require("./blocks/TextPreviewer"),
    editable: true,
    newBlockData: {
      text: "New text block..."
    }
  },
  "markdown": {
    editorClass: require("./blocks/MarkdownEditor"),
    previewClass: require("./blocks/MarkdownPreviewer"),
    editable: true,
    newBlockData: {
      text: "#New MD block..."
    }
  },
  "quote": {
    editorClass: require("./blocks/QuoteEditor"),
    previewClass: require("./blocks/QuotePreviewer"),
    editable: true,
    newBlockData: {
      text: "new quote",
      cite: "a person"
    }
  },
  "code": {
    editorClass: require("./blocks/QuoteEditor"),
    previewClass: require("./blocks/CodePreviewer"),
    editable: true,
    newBlockData: {
      text: "new code"
    }
  },
  "image": {
    editorClass: require("./blocks/ImageEditor"),
    previewClass: require("./blocks/ImagePreviewer"),
    editable: false,
    newBlockData: {
      src: ""
    }
  },
  "document": {
    editorClass: require("./blocks/DocumentEditor"),
    previewClass: require("./blocks/DocumentPreviewer"),
    editable: false,
    newBlockData: {
      title: ""
    }
  }
};

Utils = {
  defaultBlock: {
    mode: 'preview',
    data: {}
  },
  newBlock: function(type) {
    return _.extend({}, this.defaultBlock, {
      mode: 'edit'
    }, {
      type: type,
      data: this.blockTypeFromRegistry(type).newBlockData
    });
  },
  blockFromId: function(blocks, id) {
    return _.findWhere(blocks, {
      id: parseInt(id, 10)
    });
  },
  blockTypeFromRegistry: function(type) {
    return BLOCK_REGISTRY[type];
  }
};

module.exports = Utils;
