const express = require("express");
const router = express.Router();
const { Playback, PlaybackDetails, User, Song } = require("../db/models");
const db = require("../db");
const { sequelize, col } = require("sequelize/lib/model");

/**
 * Fetch all playbacks and playbackDetails
 * response: 
     [ {
            "song_id": 7,
            "title": "Need You Tonight",
            "artist": "Mr. Gabriel Stokes",
            "image_url": "https://avatars.githubusercontent.com/u/52638733",
            "external_url": "https://avatars.githubusercontent.com/u/71600639",
            "createdAt": "2023-07-14T04:43:12.764Z",
            "updatedAt": "2023-07-14T04:43:12.764Z",
            "latitude": "-24.299200",
            "longitude": "101.344500",
            "user_id": 4
        },]
 */
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`
        SELECT "Songs".*,
               "PlaybackDetails".latitude,
               "PlaybackDetails".longitude,
               "Users".user_id
        FROM "PlaybackDetails"
        INNER JOIN "Playbacks"
            ON "Playbacks".playback_id = "PlaybackDetails".playback_id
        INNER JOIN "Songs"
            ON "Playbacks".song_id = "Songs".song_id
        INNER JOIN "Users"
            ON "Playbacks".user_id = "Users".user_id
    `);

    return res.status(200).json({ content: result[0] });
  } catch (error) {
    next(error);
  }
});

/**
 * Fetch playback and playbackDetails by id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const playback = await Playback.findAll({
      where: { playback_id: req.params.id },
    });
    const playbackDetails = await PlaybackDetails.findAll({
      where: { playback_id: req.params.id },
    });
    const result = {
      playback: playback,
      playbackDetails: playbackDetails,
    };
    playback && playbackDetails
      ? res.status(200).json(result)
      : res.status(404).send("Playback Not Found");
  } catch (error) {
    next(error);
  }
});

// fetch playback and playbackDetails by user id and song id
router.get("/:userId/:songId", async (req, res, next) => {
  try {
    const user_id = parseInt(req.params.userId);
    const song_id = parseInt(req.params.songId);
    console.log(user_id, song_id);
    const playback = await Playback.findOne({
      where: { user_id: user_id, song_id: song_id },
    });
    const playbackDetails = await PlaybackDetails.findAll({
      where: { playback_id: playback.playback_id },
    });

    const result = {
      playback: playback,
      playbackDetails: playbackDetails,
    };
    playback && playbackDetails
      ? res.status(200).json(result)
      : res.status(404).send("Playback Not Found");
  } catch (error) {
    next(error);
  }
});

router.use(express.json());

/* post playback with userid and songid in req.body and post related coordinates in playbackDetails table
 * req.body: { user_id: int, song_id: int, latitude: number, longitude: number }
 * response: {
    "song_id": 5,
    "title": "Every Little Thing She Does is Magic",
    "arist": "Lyle Zboncak",
    "image_url": "https://avatars.githubusercontent.com/u/24090970",
    "external_url": "https://avatars.githubusercontent.com/u/90759936",
    "latitude": "55.130000",
    "longitude": "-13.440000",
    "user_id": 2
} 
*/
router.post("/", async (req, res) => {
  let playback = await Playback.findOne({
    where: { user_id: req.body.user_id, song_id: req.body.song_id },
  });
  console.log(playback);
  if (!playback) {
    try {
      const { user_id, song_id } = req.body;
      console.log(req.body);

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const query =
        'INSERT INTO "Playbacks" (user_id, song_id, "createdAt", "updatedAt") VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *';
      const values = [user_id, song_id];

      const newPlayback = await db.query(query, {
        bind: values,
        type: db.QueryTypes.INSERT,
      });
      playback = newPlayback[0][0];
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  try {
    const { latitude, longitude } = req.body;
    const query =
      'INSERT INTO "PlaybackDetails" (playback_id, latitude, longitude, "createdAt", "updatedAt") VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *';
    const values = [playback.playback_id, latitude, longitude];

    const newPlaybackDetails = await db.query(query, {
      bind: values,
      type: db.QueryTypes.INSERT,
    });
    const song = await Song.findByPk(playback.song_id);
    const user = await User.findByPk(playback.user_id);
    const newPlayback = {
      song_id: song.song_id,
      title: song.title,
      arist: song.artist,
      image_url: song.image_url,
      external_url: song.external_url,
      latitude: newPlaybackDetails[0][0].latitude,
      longitude: newPlaybackDetails[0][0].longitude,
      user_id: user.user_id,
    };
    res.status(201).json(newPlayback);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
