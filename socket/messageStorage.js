const { NODE_ENV, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME } = require('../config');
const { ObjectId } = require('mongodb');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

class MessageStorage {
  saveMessage(message) {}
  findMessagesForUser(userId) {}
  followUser(followerId, followeeId) {}
}

class InMemoryMessageStorage extends MessageStorage {
  constructor() {
    super()
    this.messages = [];
  }

  saveMessage(message) {
    this.messages.push(message);
  }

  findMessagesForUser(userId) {
    return messages.filter((message) => message.from === userId || message.to === userId)
  }

  followUser(followerId, followeeId) {}
}

class RedisMessageStorage extends MessageStorage {
  constructor(redisClient) {
    super()
    this.redisClient = redisClient;
  }
  
  async saveMessage(message) {
    const value = JSON.stringify(message);
    await this.redisClient
    .multi()
    .rpush(`messages:${message.from}`, value)
    .rpush(`messages:${message.to}`, value)
    .exec();
  }
  
  async findMessagesForUser(userId) {
    return this.redisClient
    .lrange(`messages:${userId}`, 0, -1)
    .then((results) => {
      return results.map((res) => JSON.parse(res))
    })
  }

  async followUser(followerId, followeeId) {
    await this.redisClient
    .multi()
    .zadd(`user:${followeeId}:followers`, Math.ceil(new Date() / 1000), followerId)
    .zadd(`user:${followerId}:following`, Math.ceil(new Date() / 1000), followeeId)
    .exec()
  }

  async unFollowUser(followerId, followeeId) {
    await this.redisClient
    .multi()
    .zrem(`user:${followerId}:following`, followeeId)
    .exec();
  }

}

class MongoDBMessageStorage extends MessageStorage {
  constructor(mongoClient) {
    super()
    this.mongoClient = mongoClient
  }

  async saveMessage(message) {
    return this._saveMessagesToDB(message);
  }

  async findMessagesForUser(userId) {
    return this._findMessagesForUserFromDB(userId);
  }

  async _followUser(followerId, followeeId) {
    Promise.all([
      await this.mongoClient.db(DB_NAME)
      .collection('followers')
      .insertOne({
        followeeId: ObjectId(followeeId),
        followeeCollection: 'users',
        followerId: ObjectId(followerId),
        followerCollection: 'users',
        start: new Date(),
        end: new Date(),
        last: new Date(),
        time: Math.ceil(new Date() / 1000)
      }),
      await this.mongoClient.db(DB_NAME)
      .collection('following')
      .insertOne({
        followeeId: ObjectId(followeeId),
        followeeCollection: 'users',
        followerId: ObjectId(followerId),
        followerCollection: 'users',
        start: new Date(),
        end: new Date(),
        last: new Date(),
        time: Math.ceil(new Date() / 1000)
      }),
      await this.mongoClient.db(DB_NAME)
      .collection("activities")
      .insertOne({
        actorId: ObjectId(followerId),
        actorCollection: "users",
        notifierId: ObjectId(followeeId),
        notifierCollection: "users",
        notifierParentId: null,
        action: "follows",
        isRead: false,
      })
    ])
  }

  async _unFollowUser(followerId, followeeId) {
    Promise.all([
      this.mongoClient.db(DB_NAME)
      .collection('following').deleteOne({
        followerId: ObjectId(followerId),
        followeeId: ObjectId(followeeId) 
      }),
      this.mongoClient.db(DB_NAME)
      .collection('followers').deleteOne({
        followerId: ObjectId(followerId),
        followeeId: ObjectId(followeeId) 
      }),
    ])
  }

  async _saveMessagesToDB(message){
    await this.mongoClient.db(DB_NAME).collection('conversations').insertOne({
      ...message,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  async _findMessagesForUserFromDB (userId){
    return await this.mongoClient.db(DB_NAME)
    .collection('conversations')
    .find({ $or: [{ from: ObjectId(userId) }, {to: ObjectId(userId) }] })
    .toArray();
  }

  async followUser(followerId, followeeId) {
    return this._followUser(followerId, followeeId);
  }

  async unFollowUser(followerId, followeeId) {
    return this._unFollowUser(followerId, followeeId);
  }
}

module.exports = {
  InMemoryMessageStorage,
  RedisMessageStorage,
  MongoDBMessageStorage
}