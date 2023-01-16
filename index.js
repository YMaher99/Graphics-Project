import express from "express"
import path from "path"
const app = express();
const port = 3000;

const root = path.resolve()
app.use(express.static(path.join(root, "./")))

app.get("/", (req, res) =>{
    res.sendFile("index.html")
})

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});