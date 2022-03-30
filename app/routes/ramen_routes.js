// Express docs: http://expressjs.com/en/api.html
const express = require("express")
// Passport docs: http://www.passportjs.org/docs/
const passport = require("passport")

// pull in Mongoose model for ramen
const Ramen = require("../models/ramen")

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require("../../lib/custom_errors")

// we"ll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we"ll use this function to send 401 when a user tries to modify a resource
// that"s owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { ramen: { flavor: "", description: "foo" } } -> { ramen: { description: "foo" } }
const removeBlanks = require("../../lib/remove_blank_fields")
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate("bearer", { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /ramen
router.get("/ramen", (req, res, next) => {
	Ramen.find()
		.then((ramen) => {
			// `ramen` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return ramen.map((ramen) => ramen.toObject())
		})
		// respond with status 200 and JSON of the ramen
		.then((ramen) => res.status(200).json({ ramen: ramen }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /ramen/5a7db6c74d55bc51bdf39793
router.get("/ramen/:id", (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Ramen.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "ramen" JSON
		.then((ramen) => res.status(200).json({ ramen: ramen.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /ramen
router.post("/ramen", requireToken, (req, res, next) => {
	// set owner of new ramen to be current user
	req.body.ramen.owner = req.user.id

	Ramen.create(req.body.ramen)
		// respond to succesful `create` with status 201 and JSON of new "ramen"
		.then(ramen => {
			res.status(201).json({ ramen: ramen.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /ramen/5a7db6c74d55bc51bdf39793
router.patch("/ramen/:id", requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.ramen.owner

	Ramen.findById(req.params.id)
		.then(handle404)
		.then((ramen) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn"t the owner
			requireOwnership(req, ramen)

			// pass the result of Mongoose"s `.update` to the next `.then`
			return ramen.updateOne(req.body.ramen)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /ramen/5a7db6c74d55bc51bdf39793
router.delete("/ramen/:id", requireToken, (req, res, next) => {
	Ramen.findById(req.params.id)
		.then(handle404)
		.then((ramen) => {
			// throw an error if current user doesn"t own `ramen`
			requireOwnership(req, ramen)
			// delete the ramen ONLY IF the above didn"t throw
			ramen.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
