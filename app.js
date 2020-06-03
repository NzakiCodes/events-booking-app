const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const events = [];


app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EvenInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events:[Event!]!
        }
        
        type RootMutation {
            createEvent(eventInput: EvenInput): Event
        }

        schema {
          query: RootQuery
          mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return events;
        },
        createEvent:(args)=>{
            const event = {
                _id:Math.random().toString(),
                title: args.title,
                description: args.description,
                price: +args.price,
                date: new Date().toISOString()
            }
            events.push(event);
        }
    },
    graphiql:true
  }))

app.listen(3000, () => {
  console.log('App listening on port 3000')
})
