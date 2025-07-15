const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const Person = require('../models/person.model');

async function createChat(participants, isGroup = false, groupName = '') {
  const chat = new Chat({ participants, isGroup, groupName });
  await chat.save();
  return chat;
}

async function getChatsForUser(userId) {
  return Chat.find({ participants: userId }).populate('participants');
}

async function addMessage(chatId, senderId, text) {
  const message = new Message({ chat: chatId, sender: senderId, text });
  await message.save();
  return message;
}

async function getMessages(chatId) {
  return Message.find({ chat: chatId }).populate('sender');
}

async function updateUserLocation(userId, lat, lng) {
  return Person.findByIdAndUpdate(userId, { location: { lat, lng } }, { new: true });
}

async function setUserOnline(userId, online) {
  return Person.findByIdAndUpdate(userId, { online }, { new: true });
}

module.exports = {
  createChat,
  getChatsForUser,
  addMessage,
  getMessages,
  updateUserLocation,
  setUserOnline,
};
