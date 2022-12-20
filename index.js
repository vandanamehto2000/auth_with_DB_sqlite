const express = require("express");
const route = require("./routes/authRoutes");
const PORT = 1338;
const app = express();

// Middlewares
app.use(express.json()); //* used for parsing json data
app.use(express.static("public")); //* used to serve html files from public folder

// Routes
app.use("/api/v1", route);

app.listen(PORT, () => {
    console.log("Server is running at port=", PORT);
})