// A node js app that reads and writes data to a sqllite
// database.
//

const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(express.json());

let htmlToSql = {
  string: "VARCHAR(255)",
  number: "INTEGER",
  boolean: "BOOLEAN",
  date: "DATE",
  array: "TEXT",
  object: "TEXT",
  null: "NULL",
  undefined: "NULL",
  function: "TEXT",
  symbol: "TEXT",
  bigint: "BIGINT",
  float: "FLOAT",
  double: "DOUBLE",
  decimal: "DECIMAL",
  any: "TEXT",
  dropdown: "TEXT",
  radio: "TEXT",
  checkbox: "TEXT",
  text: "TEXT",
  textarea: "TEXT",
  password: "TEXT",
  email: "TEXT",
  url: "TEXT",
  tel: "TEXT",
  integer: "INT",
};

// Find out the type of a text from a string.
// @param {string} text - The text to find the type of.
// @return {string} - The type of the text.
function getType(text) {
  if (text === "") {
    return "null";
  }
  if (text === "true" || text === "false") {
    return "boolean";
  }
  if (text.match(/^[0-9]+$/)) {
    return "number";
  }
  if (text.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
    return "date";
  }
  // array
  if (text.match(/^\[.*\]$/)) {
    return "array";
  }
  // object
  if (text.match(/^\{.*\}$/)) {
    return "object";
  }
  // function
  if (text.match(/^function\(.*\)$/)) {
    return "function";
  }
  // symbol
  if (text.match(/^Symbol\(.*\)$/)) {
    return "symbol";
  }
  // bigint
  if (text.match(/^[0-9]+$/)) {
    return "bigint";
  }
  // float
  if (text.match(/^[0-9]+\.[0-9]+$/)) {
    return "float";
  }
  // double
  if (text.match(/^[0-9]+\.[0-9]+$/)) {
    return "double";
  }
  // decimal
  if (text.match(/^[0-9]+\.[0-9]+$/)) {
    return "decimal";
  }
  // any
  if (text.match(/^any$/)) {
    return "any";
  }
  // dropdown
  if (text.match(/^dropdown$/)) {
    return "dropdown";
  }
  // radio
  if (text.match(/^radio$/)) {
    return "radio";
  }
  // checkbox
  if (text.match(/^checkbox$/)) {
    return "checkbox";
  }
  // text
  if (text.match(/^text$/)) {
    return "text";
  }
  // textarea
  if (text.match(/^textarea$/)) {
    return "textarea";
  }
  // password
  if (text.match(/^password$/)) {
    return "password";
  }
  // email
  if (text.match(/^email$/)) {
    return "email";
  }
  // url
  if (text.match(/^url$/)) {
    return "url";
  }
  // tel
  if (text.match(/^tel$/)) {
    return "tel";
  }
  // integer
  if (text.match(/^integer$/)) {
    return "integer";
  }
  return "text";
}

function getSqlDt(text) {
  return htmlToSql[getType(text)];
}

// Make a url to create a database
app.post("/api/v1/create/:database", (req, res) => {
  let db = new sqlite3.Database(`./${req.params.database}.db`);
  db.close();
  res.send("Database created");
});

app.post("/api/v1/create/:database/:table", (req, res) => {
  let db = new sqlite3.Database(`./${req.params.database}.db`);
  const data = req.body.data;
  //   Loop through the data and create the table.
  //   If not exists update it
  let createSql = `CREATE TABLE IF NOT EXISTS ${req.params.table} (`;
  let insertSqlBase = `INSERT INTO ${req.params.table} (`;
  let keys = Object.keys(data[0]);
  keys.forEach((key) => {
    datatype = getSqlDt(key);
    createSql += '"' + key + '" ' + datatype + ", ";
    insertSqlBase += '"' + key + '", ';
  });
  createSql = createSql.slice(0, -2);
  createSql += ")";

  insertSqlBase = insertSqlBase.slice(0, -2);
  insertSqlBase += ") VALUES(";

  db.serialize(() => {
    db.run(createSql);
  });

  // Loop through the data find the values for each row and log it.
  data.forEach((row) => {
    let insertSql = insertSqlBase;
    keys.forEach((key) => {
      key = row[key];

      // Get the type
      let type = getType(key);
      // If the type is a string, add quotes.
      if (type === "string") {
        key = `"${key}"`;
      }
      // If the type is a number, add quotes.
      if (type === "number") {
        key = `${key}`;
      }
      // If the type is a boolean, add quotes.
      if (type === "boolean") {
        key = `${key.toUpperCase()}`;
      }
      // If the type is a decimal or double or bigint, add no quotes.
      if (type === "decimal" || type === "double" || type === "bigint") {
        key = `${key}`;
      }
      // If the type is a null, add no quotes.
      if (type === "null") {
        key = `NULL`;
      }
      // If the type is something else, add quotes.
      if (type !== "string" && type !== "number" && type !== "boolean") {
        key = `"${key}"`;
      }
      insertSql += key + ", ";
    });
    insertSql = insertSql.slice(0, -2);
    insertSql += ")";
    // console.log(insertSql);
    // Execute the query after the creation of the table.
    db.run(insertSql);
  });

  db.close();
  res.send("Table created");
});


app.get("/api/v1/get/:database/:table", (req, res) => {
  let db = new sqlite3.Database(`./${req.params.database}.db`);
  db.all(`SELECT * FROM ${req.params.table}`, (err, rows) => {
    if (err) {
      res.status(500).send(err)
    }
    res.send(rows);
  });
  db.close();
});

// Check if the table exists

app.listen(3000, () => {
  console.log("server started");
});
