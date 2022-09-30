const urlModel = require("../models/urlModel.js")
const shortId = require('short-id')
const validUrl = require('valid-url')

const isValidField = function (value) {
    if (typeof value === 'undefined' || value === null || typeof value === 'number') { return false }
    if (typeof value === 'string' && value.trim().length == 0) { return false }
    return true
}

const baseUrl = "http://localhost:3000";

const createShortUrl = async (req, res) => {
    try {
        const shortCode = shortId.generate().toLowerCase();
        let data = req.body

        if (Object.keys(data).length === 0) return res.status(400).send({ status: false, message: "Request body cann't be empty,please provide url details" })

        let { longUrl, shortUrl, urlCode } = data

        if (shortUrl || urlCode) return res.status(400).send({ status: false, message: "Invalid parameters in request body!! Only long Url required in request body" })

        if (!isValidField(longUrl)) return res.status(400).send({ status: false, message: "Long Url is mandatory and should be a valid string" })

        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status: false, message: "Please provide a valid Long Url" })

        longUrl = longUrl.toLowerCase();

        const alreadyGenerated = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })

        if (alreadyGenerated) {
            return res.status(409).send({ status: false,message:"Short Url already exsits for this Long Url" ,data: alreadyGenerated })
        }

        const gShortUrl = baseUrl + "/" + shortCode;
        data["shortUrl"] = gShortUrl;
        data["urlCode"] = shortCode;

        const createdShortUrl = await urlModel.create(data)

        const response = await urlModel.findOne({ _id: createdShortUrl._id }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        return res.status(201).send({ status: true, data: response })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const redirectShortUrl = async (req, res) => {
    try {
        let code = req.params.urlCode;

        const findLongUrl = await urlModel.findOne({ urlCode: code })

        if (findLongUrl) {
            return res.redirect(302, findLongUrl.longUrl)
        } else {
            return res.status(404).send({ status: false, message: "No url found with the given url code" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports.createShortUrl = createShortUrl;
module.exports.redirectShortUrl = redirectShortUrl;
