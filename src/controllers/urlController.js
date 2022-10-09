const urlModel = require("../models/urlModel.js")
const shortId = require('short-id')
const validUrl = require('valid-url')
const redis = require('redis')
const { promisify } = require('util')
const axios = require('axios')

//Connection to redis server==>

const redisClient = redis.createClient(
    14051,
    "redis-14051.c305.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
)

redisClient.auth("uafhub6SfsQZa6OF2WbaGoD1oVPXcSUQ", function (err) {
    if (err) {
        throw err
    }
})

redisClient.on("connect", async () => {
    console.log("Connected to redis")
})

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)




const createShortUrl = async (req, res) => {
    try {
        let requestBody = req.body

        if (Object.keys(requestBody).length === 0) return res.status(400).send({ status: false, message: "Request body cann't be empty,please provide url details" })

        if (Object.keys(requestBody).length > 1) return res.status(400).send({ status: false, message: "Request body can have only longUrl" })

        if (!requestBody.longUrl) return res.status(400).send({ status: false, message: "Long Url is mandatory" })

        if (!validUrl.isUri(requestBody.longUrl)) return res.status(400).send({ status: false, message: "Please provide a valid Long Url" })

        let correctUrl = false;
        await axios.get(requestBody.longUrl)
            .then((res) => { correctUrl = true })
            .catch((err) => { correctUrl = false });

        if (correctUrl == false) return res.status(400).send({ status: false, message: "Please provide a valid long URL" })

        let cachedUrl = await GET_ASYNC(`${requestBody.longUrl}`)

        if (cachedUrl) {
            console.log("Cached generated for the given long url")

            let data = JSON.parse(cachedUrl)

            let obj = {
                longUrl: data.longUrl,
                shortUrl: data.shortUrl,
                urlCode: data.urlCode
            }
            return res.status(400).send({ status: false, message: "ShortUrl already generated and present in cache for this longUrl", data: obj })
        }

        let alreadyGeneratedUrl = await urlModel.findOne({ longUrl: requestBody.longUrl }).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 })

        if (alreadyGeneratedUrl) {
            return res.status(400).send({ status: false, message: "ShortUrl already generated and present in the DB for this longUrl", data: alreadyGeneratedUrl })
        }

        let shortCode = shortId.generate(requestBody.longUrl)
        let shortUrl = `http://localhost:3001/${shortCode}`

        let obj = {}
        obj.longUrl = req.body.longUrl
        obj.shortUrl = shortUrl
        obj.urlCode = shortCode
        console.log(obj)

        let insertUrl = await urlModel.create(obj)
        console.log(insertUrl)

        await SET_ASYNC(`${insertUrl.longUrl}`, JSON.stringify(insertUrl))

        let response = await urlModel.findOne({ _id: insertUrl._id }).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 })

        return res.status(201).send({ status: true, data: response })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const redirectShortUrl = async (req, res) => {
    try {
        let code = req.params.urlCode;
        if (!code) return res.status(400).send({ status: false, message: "Please enter a valid urlCode" })



        let cachedUrlData = await GET_ASYNC(`${code}`)
        if (cachedUrlData) {
            console.log("Cache comes in picture")
            let data = JSON.parse(cachedUrlData)
            res.status(302).redirect(data.longUrl)
        }
        else {

            let findLongUrl = await urlModel.findOne({ urlCode: code })

            if (findLongUrl) {
                await SET_ASYNC(`${findLongUrl.urlCode}`, JSON.stringify(findLongUrl))
                return res.status(302).redirect(findLongUrl.longUrl)
            } else {
                return res.status(404).send({ status: false, message: "No url found with the given url code" })
            }
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports.createShortUrl = createShortUrl;
module.exports.redirectShortUrl = redirectShortUrl;
