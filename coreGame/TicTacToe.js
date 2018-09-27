const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Model = require('../api/models/Game');

const secretKey = 'Jedi228';

//Create matrix
const createBF = (size) => {
  let bf = Array(size).fill('?');

  for (let key in bf) {
    bf[key] = Array(size).fill('?');
  }

  return bf;
}


class Delete {
  constructor(id) {
    this.id = id;
    this.interval = false; 
    this.start = this.init();
  }

  init() {
    this.interval = setTimeout(function(){
      Model.findByIdAndRemove(this.id).exec()
        .then(result => console.log(`Game ${this.id} was deleted`))
        .catch(error => console.log(`Can't delete ${this.id} game`))
    },300000);
    Delete._games.add(this);
  }

  clear() {
    clearTimeout(this.interval);
  }

  static update(id) {
    for (game of this._games) {
      if (game.id === id) {
        game.init();
        console.log(`Update delete ${id}`)
      } 
    }
  }

  static cancel(id) {
    for (game of this._games) {
      if (game.id === id) {
        game.clear();
        console.log(`Cancel delete ${id}`)
      } 
    }
  }
}

Delete._games = new Set();



const checkWinner = (battlefield, symbol, size) => {
  let isWin;
  for (let key in battlefield) {
    if (battlefield[key].every(elem => elem === symbol)) {
      isWin = true;
    }
    for (let key2 in battlefield[key]) {
      if (battlefield.every(arr => arr[key2][key] === symbol)) {
        isWin = true;
      } else if (battlefield.every(arr => arr[key][key2] === symbol)) {
        isWin = true;
      } else if (battlefield.every(arr => arr[key][size - 1 - key2] === symbol)) {
        isWin = true;
      }
    }
  }

  return isWin;
}

/*
class Game{
  constructor(userName, size) {
    this.owner = {name: userName};
    this.size = size;
    this.state = null;
    this.opponent = {name: ''};
    this.duration = 'Not started';
    this.result = '';
    this.lastupdate = null;
    this.interval = null;
    this.battlefield = null;
    this.gameName = null;
    this.lastStep = 'opponent';
  }

  //Start game
  async start() {
    this.state = 'ready';
    let result = await genString(this.owner.name);
    this.gameName = result.slice(0,7);
    this.owner.token = result.slice(7,20);
    await this.constructor.add(this)
    return {
      accessToken: this.owner.token,
      gameToken: this.gameName
    }
  }

  //Add game to SET
  static async add(GAME) {
    
  }

  //Delete game from SET
  static delete(GAME) {
    this._games.delete(GAME)
  }

  //Return array games
  static async list() {
    let tmpArr = []
    for (let game of this._games) {
      let gameDuration;

      if (game.duration !== 'Not started' && game.state !== 'done') {
        gameDuration = Date.now() - game.duration;
      } else {
        gameDuration = game.duration;
      }
      await tmpArr.push({
        gameToken: game.gameName,
        owner: game.owner.name,
        opponent: game.opponent.name,
        size: game.size,
        gameDuration,
        gameResult: game.result,
        state: game.state
      });
    }
    return tmpArr;
  }

  
  //Join opponent
  static async join(token, opponent) {
      for (let game of this._games) {
        if (game.gameName === token) {
          await game.enemy(opponent);
          await game.lastPrepare()
          return game.opponent.token;
        }
      }
  }

  async enemy(opponent) {
    let result = await genString(opponent);
    this.opponent = {
      name: opponent,
      token: result.slice(7,20)
    }
  }

  //Create BF and start timer
  async lastPrepare() {
    this.duration = Date.now();
    this.lastupdate = this.duration;
    this.state = 'playing';
    this.battlefield = await createBF(this.size);
    this.updateInterval();
  }

  
  //Update 5mins timeout
  updateInterval() {
    clearInterval(this.interval);
    this.interval = setTimeout(function(t) {
      this.constructor.delete(t);
    }, Game._deadTime, this);
  }

  //Do step 
  static async doStep(token, row, col) {
    let tmp;
    let user;
    let turn;
    let step;
    let winOwner;
    let winOpponent;

    for (let game of this._games) {
      if (game.owner.token === token) {
        user = 'owner';
        tmp = game; 
      } else if (game.opponent.token === token) {
        user = 'opponent';
        tmp = game;
      }
    }
    if (!user) {
      return {
        status: 'error',
        code: 401,
        message: 'Invalid access token'
      }
    } else {
      this = tmp;
      turn = await this.checkTurn(user);
      if (!turn) {
        return {
          status: 'error',
          code: 401,
          message: 'Not you turn'
        }
      } else {
        step = await this.Step(user, row, col);
        if (!step) {
          return {
            status: 'error',
            code: 400,
            message: 'Coordinaties is busy'
          }
        } else {
          await this.updateInterval();
          winOwner = await this.checkWinner('X');
          if (winOwner) {
            this.result = 'owner';
            this.state = 'done';
            this.duration = Date.now() - this.duration;
          } else {
            winOpponent = await this.checkWinner('0');
            if (winOpponent) {
              this.result = 'opponent';
              this.state = 'done';
              this.duration = Date.now() - this.duration;
            } else if (this.battlefield.every(arr => {

            })) {

            }
          }
          return true;
        }
      }
    }
  }


  async checkTurn(user) {
    if (this.lastStep === user) {
      return false;
    }
  }


  async Step(user, row, col) {
    let symbol;
    if (user === 'owner') {
      symbol = 'X';
    } else if (user === 'opponent') {
      symbol = '0';
    } 
    if (this.bf[row-1][col-1]) {
      if (this.bf[row-1][col-1] === '?') {
        this.bf[row-1][col-1] = symbol;
        return true;
      } else {
        return false;
      }
    } 
  }

  //Get state of game
  static async state(token) {
    let tmp;
    for (let game of this._games) {
      if (game.owner.token === token || game.opponent.token === token) {
        tmp = game;
      } 
    }
    if (!tmp) {
      return {
        status: 'error',
        code: 401,
        message: 'Invalid access token'
      }
    } else {
      this = tmp;
    }
  }


  async checkWinner(symbol) {
    for (let key in this.battlefield) {
      if (this.battlefield[key].every(elem => elem === symbol)) {
        return true;
      }
      for (let key2 in this.battlefield[key]) {
        if (this.battlefield.every(arr => arr[key2][key] === symbol)) {
          return true;
        } else if (this.battlefield.every(arr => arr[key][key2] === symbol)) {
          return true;
        } else if (this.battlefield.every(arr => arr[key][this.size - 1 - key2])) {
          return true;
        }
      }
    }
  }

  //Get Info
}

Game._deadTime = 300000;
Game._games = new Set();
*/



module.exports = {
  new: async(userName, size) => {
    const game = new Model({
      _id: mongoose.Types.ObjectId(),
      owner: userName,
      size
    });

    game.battlefield = createBF(size);
    game.markModified('battlefield');

    let result; 

    try {
      result = await game.save();
    } catch(error) {
      console.log(error);
      return {
        status: 'error',
        code: 500,
        message: 'Internal Server Error'
      }
    }
    
    if (result) {
      let token;
      
      try {
        token = await jwt.sign({
          id: result._id,
          who: 'owner'
        }, secretKey, { expiresIn: '1h' });
      } catch(error) {
        console.log(error);
        return {
          status: 'error',
          code: 500,
          message: 'Internal Server Error'
        }
      }

      await new Delete(result._id);

      return {
        status: 'ok',
        code: 0,
        accessToken: token,
        gameToken: result._id
      }
    }
  },


  join: async(gameToken, userName) => {
    let game;
    
    try {
      game = await Model.findById(gameToken);
    } catch(error) {
      console.log(error);
      return {
        status: 'error',
        code: 404,
        message: 'Invalid gameToken'
      }   
    }

    if (game) {
      let token;

      if (game.state === 'ready') {
        await Delete.cancel(gameToken);
        game.opponent = userName;
        game.state = 'playing'
        game.duration = Date.now();
        await Delete.update(gameToken);
        await game.save();
        
        try {
          token = await jwt.sign({
            id: game._id,
            who: 'opponent'
          }, secretKey, { expiresIn: '1h' });
        } catch(error) {
          console.log(error);
          return {
            status: 'error',
            code: 500,
            message: 'Internal Server Error'
          }
        }
        
      } else {

        try {
          token = await jwt.sign({
            id: game._id,
            who: 'guest'
          }, secretKey, { expiresIn: '1h' });
        } catch(error) {
          console.log(error);
          return {
            status: 'error',
            code: 500,
            message: 'Internal Server Error'
          }
        }
      }
      
      if (token) {
        return {
          status: 'ok',
          code: 0,
          accessToken: token
        }
      }
    } else {
      return {
        status: 'error',
        code: 404,
        message: 'Game not found'
      }
    }
  },


  doStep: async(accessToken, row, col) => {
    let decoded;

    try {
      decoded = jwt.verify(accessToken, secretKey);
    } catch(error) {
      console.log(error);
      return {
        status: 'error',
        code: 401,
        message: 'Invaild accessToken'
      }
    }

    if (decoded) {
      let game;

      try {
        game = await Model.findById(decoded.id);
      } catch(error) {
        console.log(error);
        return {
          status: 'error',
          code: 500,
          message: 'Internal Server Error'
        } 
      }

      if (game) {
        if (game.lastStep !== decoded.who) {
          let symbol;

          if (decoded.who === 'owner') {
            symbol = 'X';
          } else if (decoded.who === 'opponent') {
            symbol = '0';
          }

          if (game.battlefield[row-1][col-1]) {
            if (game.battlefield[row-1][col-1] === '?') {
              game.battlefield[row-1][col-1] = symbol;
              game.markModified('battlefield');
              game.lastStep = decoded.who;
              await Delete.cancel(decoded.id);
              let isDone = await checkWinner(game.battlefield, symbol, game.size);
              if (isDone) {
                game.duration = Date.now() - game.duration;
                game.state = 'done';
                game.result = decoded.who;
              } else if (game.battlefield.every((arr) => { 
                arr.every(elem => elem !== '?');
              })) {
                game.duration = Date.now() - game.duration;
                game.state = 'done';
                game.result = 'draw';
              } else {
                await Delete.update(decoded.id);
              }
              
              await game.save();

              return {
                status: 'ok',
                code: 0
              }
            } else {
              return {
                status: 'error',
                code: 400,
                message: 'Coordinaties is busy'
              };
            }
          } 
        } else {
          return {
            status: 'error',
            code: 300,
            message: 'Not you turn'
          };
        }
      } else {
        return {
          status: 'error',
          code: 404,
          message: 'Game not found'
        }
      }
    } else {
      return {
        status: 'error',
        code: 401,
        message: 'Invalid accessToken'
      };
    }
  },


  surrender: async(accessToken) => {
    let decoded;

    try {
      decoded = jwt.verify(accessToken, secretKey);
    } catch(error) {
      console.log(error);
      return {
        status: 'error',
        code: 401,
        message: 'Invaild accessToken'
      }
    }

    if (decoded) {
      if (decoded.who === 'owner' || decoded.who === 'opponent') {
        let game;

        try {
          game = await Model.findById(decoded.id);
        } catch(error) {
          console.log(error);
          return {
            status: 'error',
            code: 500,
            message: 'Internal Server Error'
          } 
        }

        if (game) {
          game.duration = Date.now() - game.duration;
          game.state = 'done';
          game.result = decoded.who;
          Delete.cancel(decoded.id);
          await game.save();

          return {
            status: 'ok',
            code: 0,
          }
        } else {
          return {
            status: 'error',
            code: 404,
            message: 'Game not found'
          }
        }
      }  
    } else {
      return {
        status: 'error',
        code: 401,
        message: 'Invalid token'
      }
    }
  },


  list: async() => {
    let games;
    try {
      games = await Model.find();
    } catch(error) {
      console.log(error);
      return {
        status: error,
        code: 500,
        message: 'Internal Server Error'
      }
    }

    if (games && games.length > 0) {
      let tmp = [];
      for (let game of games) {
        if (game.duration !== 'Not started' && game.state !== 'done') {
          gameDuration = Date.now() - game.duration;
        } else {
          gameDuration = game.duration;
        }
        await tmp.push({
          gameToken: game._id,
          owner: game.owner,
          opponent: game.opponent,
          size: game.size,
          gameDuration,
          gameResult: game.result,
          state: game.state
        });
      } 

      return {
        status: 'ok',
        code: 0,
        games: tmp
      }
    } else {
      return {
        status: 'error',
        code: 404,
        message: 'Games not found'
      }
    }
  },


  state: async(accessToken) => {
    let decoded;

    try {
      decoded = jwt.verify(accessToken, secretKey);
    } catch(error) {
      console.log(error);
      return {
        status: 'error',
        code: 401,
        message: 'Invaild accessToken'
      }
    }

    if (decoded) {
      let game;

      try {
        game = await Model.findById(decoded.id);
      } catch(error) {
        console.log(error);
        return {
          status: 'error',
          code: 500,
          message: 'Internal Server Error'
        } 
      }

      if (game) {
        let winner;
        let youTurn = false;
        let you = decoded.who;

        if (game.status === 'done') {
          if (game.result === 'owner') {
            winner = game.owner;
          } else if (game.result === 'opponent') {
            winner = game.opponent;
          }
        }
        
        if (game.duration !== 'Not started' && game.state !== 'done') {
          gameDuration = Date.now() - game.duration;
        } else {
          gameDuration = game.duration;
        }

        if (decoded.who !== game.lastStep) {
          youTurn = true;
        }

        return {
          status: 'ok',
          code: 0,
          you,
          owner: game.owner,
          opponent: game.opponent,
          youTurn,
          gameDuration,
          field: game.battlefield,
          winner
        }
      } else {
        return {
          status: 'error',
          code: 404,
          message: 'Game not found'
        }
      }
    }
  }
}
