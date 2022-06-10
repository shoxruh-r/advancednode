$(document).ready(function () {
  let socket = io()

  socket.on('user count', data => {
    console.log(data)
  })

  socket.on('connect', () => {
    console.log("Connected")
    
    socket.on('disconnect', () => {
      /*anything you want to do on disconnect*/
      console.log("Disconnected")
    })
  })

  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val()

    $('#m').val('')
    return false // prevent form submit from refreshing page
  })
})
