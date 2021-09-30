require("dotenv/config");
var helper = require("./App/master-helper.js");
var app = require("express")();
const bodyParser = require("body-parser");
var cache = require("memory-cache");
var cors = require("cors");
const masterHelper = require("./App/master-helper.js");
const { use } = require("./Routes/index");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", require("./Routes/index"));

const port = process.env.PORT || 3030;

var http = require("http").Server(app);

http.listen(port, async () => {
  websites = await helper.getWebsites();
  websites.forEach((website) => {
    cache.put(`scan_${website.id}`, 1);
    setInterval(() => {
      helper.scan(website);
    }, website.timeout * 1000);
  });
  console.log("Connected to express server @" + port);
});
