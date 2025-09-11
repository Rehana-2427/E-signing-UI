const express = require("express");
const path = require("path");
const app = express();
// Serve static files from the 'build' directory
app.use(express.static("./"));
// Catch-all handler to send the React app's index.html file for any route
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });
app.use('/', express.static(path.join(__dirname, 'ts-site-build')));
app.use(['/login', '/register', '/dashboard'], express.static(path.join(__dirname, 'react-build')));
// Define the port to run the server on
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log("Server is running on port ${PORT}");
});
