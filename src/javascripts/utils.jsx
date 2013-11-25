var Utils;

Utils = {
  blockFromId: function(blocks, id) {
    return _.findWhere(blocks, {
      id: parseInt(id, 10)
    });
  }
};

module.exports = Utils;
