Setup: Initializes socket.io and configures CORS.
Tracking Users: Maintains a map of connected users and their socket.ids.
Register User: Associates userId with socket.id. Updates the socket ID on user request since the old socket may disconnect in some cases.
Send Message: Sends a message to the receiver's socket if they are connected.
Receive Message: Emits the received message to the intended receiver.