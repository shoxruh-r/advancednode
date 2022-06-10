$(document).ready(function () {
  let socket = io()

  
  ++currentUsers

  io.emit('user count', currentUsers)

  socket.on('user count', data => {
    console.log(data)
  })

  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val()

    $('#m').val('')
    return false // prevent form submit from refreshing page
  })
})
