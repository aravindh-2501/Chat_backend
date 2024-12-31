// socket/roomUtils.js

export const getRoomName = (senderId, receiverId, roomMap) => {
  return (
    roomMap.get(`${senderId}_${receiverId}`) ||
    roomMap.get(`${receiverId}_${senderId}`)
  );
};

export const createRoom = (senderId, receiverId, roomMap) => {
  const roomName = `PM_${String(senderId)}_${String(receiverId)}`;
  roomMap.set(`${senderId}_${receiverId}`, roomName);
  roomMap.set(`${receiverId}_${senderId}`, roomName);
  return roomName;
};
