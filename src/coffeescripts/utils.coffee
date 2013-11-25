Utils =
  blockFromId: (blocks, id) ->
    _.findWhere(blocks, {id: parseInt(id,10)})


module.exports = Utils

