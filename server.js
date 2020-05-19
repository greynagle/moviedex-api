require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const helmet = require('helmet')
const MOVIES = require("./movies.json");

const app = express();

app.use(morgan("dev"));
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get("Authorization");

    if (!authToken || authToken.split(" ")[1] !== apiToken) {
        return res.status(401).json({ error: "Unauthorized request" });
    }

    next();
});

function handleGetMovies(req, res) {
    const { genre = "", country = "", avg_vote = "" } = req.query;
	let moviesFiltered = MOVIES

	if(genre){
		const regGenre = new RegExp(genre, 'i')
		moviesFiltered = moviesFiltered.filter((val) => {
			return regGenre.test(val.genre)

		})
	}
    
	if(country){
		const regCountry = new RegExp(country, 'i')
		moviesFiltered=moviesFiltered.filter((val) => {
			return regCountry.test(val.country)
		})
	}
	
	if(avg_vote){
		moviesFiltered=moviesFiltered.filter((val) => {
			const compAvgVote = Number(avg_vote)
			
			return Number(val.avg_vote)>=compAvgVote
		})
	}

	res.json(moviesFiltered)
}

app.get("/movies", handleGetMovies);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});