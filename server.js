require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const MOVIES = require("./movies.json");

const app = express();

const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get("Authorization");

    if (!authToken || authToken.split("_")[1] !== apiToken) {
        return res.status(401).json({ error: "Unauthorized request" });
    }

    next();
});

function handleGetMovies(req, res) {
    const { genre = "", country = "", avg_vote = "" } = req.query;
    let moviesFiltered = MOVIES;

    if (genre) {
        const regGenre = new RegExp(genre, "i");
        moviesFiltered = moviesFiltered.filter((val) => {
            return regGenre.test(val.genre);
        });
    }

    if (country) {
        const regCountry = new RegExp(country, "i");
        moviesFiltered = moviesFiltered.filter((val) => {
            return regCountry.test(val.country);
        });
    }

    if (avg_vote) {
        moviesFiltered = moviesFiltered.filter((val) => {
            const compAvgVote = Number(avg_vote);

            return Number(val.avg_vote) >= compAvgVote;
        });
    }

    res.json(moviesFiltered);
}

app.get("/movies", handleGetMovies);

// function handleFavicon(req, res) {
// 	res.get('./ico/favicon.ico');
// }

// app.get("/favicon.ico", handleFavicon);

app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === "production") {
        response = { error: { message: "server error" } };
    } else {
        response = { error };
    }
    res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT);
