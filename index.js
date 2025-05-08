const http = require("http");
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const PORT = 3716;
const MONGO_URI = "mongodb+srv://npadi1:4DgfLc5dcEZ1K3j7@cluster0.az89lol.mongodb.net/echohits?retryWrites=true&w=majority";

http.createServer(async (req, res) => {
  if (req.url === "/api") {
    const client = new MongoClient(MONGO_URI);
    try {
      await client.connect();
      console.log("Connected to MongoDB");

      // Fetch the data from MongoDB
      const db = client.db("MusicHits_DB"); // Correct database name
      const collection = db.collection("MusicHits_Collection"); // Correct collection name
      const musicHitsData = await collection.find({}).toArray();

      if (musicHitsData.length === 0) {
        console.log("No data found in the database");
      } else {
        console.log(`Found ${musicHitsData.length} records in MongoDB`);
      }

      // Return the data in the response
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(musicHitsData));
    } catch (err) {
      console.log("Error connecting to MongoDB", err);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error connecting to the database");
    } finally {
      await client.close();
      console.log("MongoDB connection closed");
    }
  } else if (req.url === "/") {
    // Serve the portfolio HTML file
    fs.readFile(path.join(__dirname, "public", "index.html"), (err, content) => {
      if (err) throw err;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    });
  } else if (req.url.startsWith("/assets/")) {
    // Serve static images from the assets folder
    const assetPath = path.join(__dirname, "public", req.url);
    fs.readFile(assetPath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }

      const contentType = path.extname(assetPath) === ".png" ? "image/png" : "image/jpeg";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("<h1>404 Not Found</h1>");
  }
}).listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
