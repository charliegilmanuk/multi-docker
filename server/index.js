const keys = require('./keys');
const pg = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pgClient = new pg.Pool({
  host: keys.pgHost,
  database: keys.pgDatabase,
  port: keys.pgPort,
  user: keys.pgUser,
  password: keys.pgPassword,
});

pgClient.on('error', (err) => {
  console.log('Lost PG connection', err);
});

pgClient.on('connect', client => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch(err => console.error(err));
});

const redisClient = redis.createClient({
  socket: {
    host: keys.redisHost,
    port: keys.redisPort,
  }
});

redisClient.connect();

const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hello world');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');

  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hGetAll('values', (err, values) => {
    res.send(values);
  });
});

app.get('/values', async (req, res) => {
  const index = req.body.index;

  if (+index > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hSet('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values (number) VALUES ($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, () => {
  console.log(`Listening on http://localhost:5000/`);
});
