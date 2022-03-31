// seedRamen.js will be a script we can run from the terminal to create a bunch of ramen at once.
// We"ll need to be careful with our seed when we run it, because it"ll will remove all the ramen first, then add the new ones.

// 1. Require Mongoose to make a database connection in the file
const mongoose = require("mongoose")
// 2. Bring in the ramen model
const Ramen = require("./ramen")
// 3. Get db config string from the file
const db = require("../../config/db")

const starterRamen = [
    { flavor: "Chicken", description: "Not your ordinary chicken noodle soup.", sodium: 1660, haveTried: true },
    { flavor: "Creamy Chicken", description: "Ramen with extra soul.", sodium: 1220, haveTried: true },
    { flavor: "Picante Chicken", description: "Feeling hot, hot, hot!", sodium: 1480, haveTried: true },
    { flavor: "Beef", description: "Hearty goodness in every slurp.", sodium: 1580, haveTried: true },
    { flavor: "Roast Beef", description: "Mouthwatering goodness you can't resist.", sodium: 1620, haveTried: false },
    { flavor: "Shrimp", description: "A wave of seafood flavor in every bowl.", sodium: 1580, haveTried: true },
    { flavor: "Lime Chili Shrimp", description: "There's nothing small about this shrimp flavor.", sodium: 1820, haveTried: false },
]

// 1. Connect to the database via Mongoose. (reference server.js)
mongoose.connect(db, {
	useNewUrlParser: true,
})
    .then(() => {
        // 2. Remove all the ramen
        Ramen.remove({})
        // This is just a basic development app, buy we can add a bunch of javascript stuff here if we wanted, like if the owner still exists, don"t remove, etc.
        // Syntax for that:
        //  Ramen.deleteMany({ owner: null })
            .then(deletedRamen => {
                console.log("Deleted Ramen:", deletedRamen)
                // 3. Create a bunch of new ramen using the starterRamen array
                Ramen.create(starterRamen)
                    .then(newRamen => {
                        console.log("New ramen:", newRamen)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    .catch(error => {
        // 4. We"ll use console logs to check, if it"s working or there are errors.
        console.log(error)
        // 5. At the end, close the database connection.
        mongoose.connection.close()
    })

// Note that whether there"s an error or not, we always close the db connection.
