const express = require("express")
const router = express.Router()
    const{
        createSong,
        getSong,
        getAllSongs,
        updateSongs,
        favourite
        } = require("../ctrl/user")


    router.route("/createSong").post(createSong);
    router.route("/get1/:id").get(getSong);
    router.route("/getAll").get(getAllSongs);
    router.route("/update/:id").put(updateSongs);
    router.route("/favourite/:id").get(favourite);


    module.exports = router;