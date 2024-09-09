import express from 'express';
import { createRxDatabase } from 'rxdb';
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import {getRxStorageMemory} from "rxdb/plugins/storage-memory";
import * as bodyParser from "express";
addRxPlugin(RxDBDevModePlugin);


const app = express();
const PORT = 3000;

const schema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100 // <- the primary key must have set maxLength
    },
  },
  required: ['id']
}

let db;
async function createDB() {
  db = await createRxDatabase({
    name: 'workshopdb',
    storage: getRxStorageMemory()
  });
  await db.addCollections({
    workshop: {
      schema
    }
  });
}

createDB();

// create application/json parser
var jsonParser = bodyParser.json()

app.get('/data', async (req, res) => {
  const data = await db.workshop.find().exec();
  res.status(200);
  res.send(data);
});

app.get('/data/:id', async (req, res) => {
  res.status(200);
  res.send(data);
});

app.post('/data', jsonParser, async (req, res) => {
  const data = await db.workshop.find().exec();
  const id = (+((data.reverse()[0]?.id) ?? 0) + 1) + "";
  db.workshop.insert({
    id,
    ...req.body
  });
  res.status(201);
  res.send({
    id,
    ...req.body
  });
});

app.delete('/data/:id', async (req, res) => {
  const item = await db.workshop.findOne(req.params.id).exec();
  console.log(item);
  if(!item) {
    res.status(404);
    res.send();
    return;
  }
  item.remove();
  res.status(200);
  res.send();
});

app.put('/data/:id', jsonParser, async (req, res) => {
  const item = await db.workshop.findOne(req.params.id).exec();
  if (!item) {
    res.status(404);
    res.send();
    return;
  }
  await item.remove();
  await db.workshop.insert({
    id: req.params.id,
    ...req.body
  });
  res.status(201);
  res.send({
    id: req.params.id,
    ...req.body
  });
});

app.listen(PORT, (error) =>{
      if(!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else
      console.log("Error occurred, server can't start", error);
    }
);
