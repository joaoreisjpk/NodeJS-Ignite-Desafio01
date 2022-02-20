const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checkUserAccountExists = (request, response, next) => {
  const { username } = request.headers;

  const userAlreadyExists = users.find((user) => username === user.username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = userAlreadyExists;

  return next();
};

app.post("/users", (request, response) => {
  const {
    body: { name, username },
  } = request;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checkUserAccountExists, (request, response) => {
  const {
    user: { todos },
  } = request;

  return response.status(200).json(todos);
});

app.post("/todos", checkUserAccountExists, (request, response) => {
  const {
    user,
    body: { title, deadline },
  } = request;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

module.exports = app;
