events = require 'events'

class Message extends events.EventEmitter
  @buffer = new Buffer 0
  
  constructor: (@reader, @listener) ->
    if _.isFunction listener
      @on 'message', listener

    reader.on 'data', (data) ->
      buffer = Buffer.concat [
        buffer
        data
      ]

      loop
        if buffer.length >= 3
          length = data.readUInt16BE 1
          if buffer.length >= length + 3
            @emit 'message', buffer.slice 0, length + 3
            buffer = buffer.slice length + 3
          else
            break
        else
          break

module.exports = (reader, listener) ->
  new Message reader, listener