const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors())

// Connect to MongoDB
require("./db.js").connect()

// Middleware
app.use(express.json())

// Routes
app.use("/trax/api", require("./routes/index.routes.js"))
app.use("/trax/api/auth", require("./routes/auth.routes.js"))

app.use("/trax/api/users", require("./authenticate.js"))
require("./routes/user.routes.js")(app)

app.use("/trax/api/tracks", require("./authenticate.js"))
app.use("/trax/api/tracks", require("./routes/tracks.routes.js"))

module.exports = app
