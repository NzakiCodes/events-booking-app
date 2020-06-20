const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");

const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolvers');

const app = express();

app.use(bodyParser.json());
app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}))

try {
  mongoose.connect(`mongodb://localhost/${process.env.MONGODB_DATABASE}`).then(() => {
    app.listen(3000, () => {
      console.log('App listening on port 3000')
    })
  })
} catch (err) {
  console.log(err);
}