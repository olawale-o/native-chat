class SessionStorage {
  saveSession(sessionId, user) {}
  findSession(sessionId) {}
  findSessions() {}
}

class InMemmoryStore extends SessionStorage {
  constructor() {
    super();
    this.sessions = new Map();
  }

  saveSession(id, user) {
    this.sessions.set(id, user);
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  findSessions() {
    return [...this.sessions.values()];
  }
}


class RedisSessionStorage extends SessionStorage {
  constructor(redisClient) {
    super()
    this.redisClient = redisClient;
  }

  async saveSession(sessionId, user) {
    await this.redisClient
    .multi()
    .hset(
      `session:${sessionId}`,
      "session",
      JSON.stringify(user)
    )
    .exec()
  }

  async findSession(sessionId) {
    return await this.redisClient
    .multi()
    .hget(`session:${sessionId}`, "session")
    .exec()
    .then(([[err, result]]) => {
     //  console.log({redisResult: result})
      return JSON.parse(result)
    }).catch((err) => {
      console.log(err)   
    });
  }

  async findSessions() {
    const keys = new Set();
    let nextIndex = 0;
    do {
      const [nextIndexAsStr, results] = await this.redisClient.scan(
        nextIndex,
        "MATCH",
        "session:*",
        "COUNT",
        "100"
      )
      nextIndex = parseInt(nextIndexAsStr, 10);
      results.forEach((s) => keys.add(s));
    } while (nextIndex !== 0);
    const commands = [];
    keys.forEach((key) => {
      commands.push(["hget", key, "session"]);
    })

    return this.redisClient
    .multi(commands)
    .exec()
    .then((results) => {
      return results.map(([err, session]) => JSON.parse(session))
    })
    .catch((err) => console.log(err))
  }
}

module.exports = {
  InMemmoryStore,
  RedisSessionStorage
}