const songModel = require("../model/song")

exports.createSong = async(req,res)=>{
    try {
        const newSong = await songModel.create(req.body);
        res.json(newSong)
    } catch (error) {
        throw new Error(error)
    }
};

exports.getSong = async(req,res)=>{
    const {_id} = req.params
    try {
        const getSong = await songModel.findById(_id);
        if(!getSong){
          return "Not find"
        }else{
        res.json(getSong)
        }
    } catch (error) {
        throw new Error(error)
    }
};

exports.getAllSongs = async(req,res)=>{
    try {
        const getSongs = await songModel.find()
        if(!getSongs){
          res.status(401).json({
            message: "Not find at all"
          })
        }else{
          res.json(getSongs);
        }
    } catch (error) {
        throw new Error(error)
    }
};

exports.updateSongs = async(req,res)=>{
  const {_id} = req.params
  try {
      const update = await songModel.findByIdAndUpdate(_id,req.body,
          {new: true});
      res.json(update)
  } catch (error) {
      throw new Error(error)
  }
};

exports.favourite = async(req,res)=>{
    const{_id} = req.user
    const {songId} = req.body
    try {
      const song = await songModel.findById(_id);
      const alreadyadded = song.wishList.find((id) => id.toString() === songId);
      if(alreadyadded){
        let song = await songModel.findByIdAndUpdate(_id,
          {
            $pull: {wishList: songId},
          },
          {
            new: true
          }
        );
        res.json(song)
      }
      else{
        let song = await songModel.findByIdAndUpdate(_id,
          {
            $push: {wishList: songId},
          },
          {
            new: true
          }
        );
        res.json(song)
      }
    } catch (error) {
      res.status(500).json({
        Error: error.message
      })
    }
  };