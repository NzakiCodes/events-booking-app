const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/events');

const app = express(); 


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
           return Event
              .find()
              .then(events => {
                return events.map(event => {
                  return { ...event._doc };
                });
              })
              .catch(err => {
                console.log(err);
                throw err;
              })
        },
        createEvent:(args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            return event
              .save()
              .then(result => {
                console.log(result);
                return {...result._doc};
              })
              .catch(err => {
              console.log(err);
              throw err;
            });
            return event;
        }
    },
    graphiql:true
  }))

mongoose.connect(`mongodb://localhost/${process.env.MONGODB_DATABASE}`).then(()=>{
  app.listen(3000, () => {
    console.log('App listening on port 3000')
  })  
}).catch(err=>{
  console.log(err);
})
