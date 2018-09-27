const Game = require('../../coreGame/TicTacToe');


module.exports = {
  new: async(req, res) => {
    if (!req.body.userName || !req.body.size 
        || !parseInt(req.body.size) 
        || !parseInt(req.body.size) > 2) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: `missing parameters \n 
        Username(String) & Size(2 < Number < 16) required)'`
      });
    } else {
      const {userName, size} = req.body;

      Game.new(userName, parseInt(size))
        .then((result) =>{
          if (result.status === 'ok') {
            return res.status(201).json(result);
          } else {
            return res.status(result.code).json(result);
          }
        }).catch((error) => {
          console.log(error);
          return res.status(500).json({
            status: 'error',
            code: 500,
            message: 'Internal Server Error'
          });
        });     
    }
  },


  join: async(req, res) => {
    if (!req.body.userName || !req.body.gameToken) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: `missing parameters \n 
        Username(String) & GameToken(String) required)'`
      });
    } else {
      const {userName, gameToken} = req.body;
      Game.join(gameToken, userName)
        .then((result) => {
          if (result.status === 'ok') {
            return res.status(201).json(result);
          } else {
            return res.status(result.code).json(result);
          }
        }).catch(error => {
          console.log(error);
          return res.status(404).json({
            status: 'error',
            code: 404,
            message: 'Invalid GameToken'
          });
        });
    }
  },


  doStep: async(req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: `missing headers \n 
        authorization(accessToken) required`
      });
    } /*else if (!req.body.row || !req.body.col 
        || !parseInt(req.body.row) || !parseInt(req.body.col)) {
      res.status(400).json({
        status: 'error',
        code: 400,
        message: `missing parameters \n
        row(Integer) && col(Integer) required`
      });
    }*/ else if (req.body.surrender) {
      const token = req.headers.authorization;
      Game.surrender(token)
      .then(result => {
        if (result.status === 'ok') {
          return res.status(200).json(result);
        } else {
          return res.status(result.code).json(result);
        }
      }).catch(error => {
        console.log(error);
        return res.status(500).json({
          status: 'error',
          code: 500,
          message: 'Internal Server Error'
        });
      });
    } else {
      const token = req.headers.authorization;
      const {row, col} = req.body;
      Game.doStep(token, parseInt(row), parseInt(col))
        .then(result => {
          if (result.status === 'ok') {
            return res.status(200).json(result);
          } else {
            return res.status(result.code).json(result);
          }
        }).catch(error => {
          console.log(error);
          return res.status(500).json({
            status: 'error',
            code: 500,
            message: 'Internal Server Error'
          });
        });
    }
  },


  list: async(req, res) => {
    Game.list()
      .then((result) => {
        if (result.status === 'ok') {
          return res.status(200).json(result);
        } else {
          return res.status(result.code).json(result);
        }
      }).catch((error) => {
        console.log(error);
        return res.status(500).json({
          status: 'error',
          code: 500,
          message: 'Internal Server Error'
        });
      });
  },


  state: async(req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: `missing headers \n 
        authorization(accessToken) required`
      });
    } else {
      const token = req.headers.authorization;
      Game.state(token)
        .then((result) => {
          if (result.status === 'ok') {
            return res.status(200).json(result);
          } else {
            return res.status(result.code).json(result);
          }
        }).catch((error) => {
          console.log(error);
          return res.status(500).json({
            status: 'error',
            code: 500,
            message: 'Internal Server Error'
          });
        });
    }
    
  }
}

