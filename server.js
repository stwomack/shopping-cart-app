require('dotenv').config();
const express = require('express');
const redis = require('redis');

const app = express();
const port = 3000;

console.log("Host: ", process.env.REDIS_HOST);
console.log("Port: ", process.env.REDIS_PORT);

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
});

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('ready', () => {
  console.log('Redis client ready');
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
  // Handle the error gracefully, e.g., log the error and try to reconnect
});

client.on('close', (err) => {
  console.error('Redis Client Closed:', err);
});

// Define a function to check connection status
const isClientConnected = () => {
  return new Promise((resolve, reject) => {
    client.ping((err, pong) => {
      if (err) {
        reject(new Error('Redis client is not connected'));
      } else {
        resolve(true);
      }
    });
  });
};

app.get('/', async (req, res) => {
  try {
    // Check connection status using ping
    await isClientConnected();

    const keys = await client.keys('*');
    console.log("Keys: ", keys);
    res.json(keys);

  } catch (err) {
    console.error('Error getting keys from Redis:', err);
    res.status(500).send('Error fetching data from Redis.');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});