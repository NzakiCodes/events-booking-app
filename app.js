const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");

const Event = require('./models/events');
const User = require('./models/users');


const app = express();
app.use(bodyParser.json());

const events = eventsIds => {
  return Event.find({ _id: { $in: eventsIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator)
        }
      })
    }).catch(err => { throw err; })
};

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
          _id: ID!
          email: String!
          password: String
          createdEvents: [Event!]
        }

        input EvenInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events:[Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EvenInput): Event
            createUser(userInput: UserInput): User
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
            return {
              ...event._doc,
              _id: event._doc._id,
              creator: user.bind(this, event._doc.creator)
            };
          });
        })
        .catch(err => {
          console.log(err);
          throw err;
        })
    },
    createEvent: (args) => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5eedad67bbc87f1d8cab7d24'
      });
      let createdEvent;
      return event
        .save()
        .then(result => {
          createdEvent = {
            ...result._doc,
            _id: result._doc._id.toString(),
            creator: user.bind(this, result._doc.creator)
          };
          return User.findById('5eedad67bbc87f1d8cab7d24')

        })
        .then(user => {
          if (!user) {
            throw new Error('User not found')
          }
          user.createdEvents.push(event);
          return user.save();
        })
        .then(result => {
          return createdEvent;
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
      return event;
    },
    createUser: args => {
      return User.findOne({ email: args.userInput.email })
        .then(user => {
          if (user) {
            throw new Error('User exits already')
          }
          return bcrypt
            .hash(args.userInput.password, 12)
            .then(hashedPassword => {
              const user = new User({
                email: args.userInput.email,
                password: hashedPassword
              });
              return user.save();
            })
            .then(result => {
              return { ...result._doc, password: null, _id: result.id }
            })
            .catch(err => {
              throw err;
            })
        });

    }
  },
  graphiql: true
}))

mongoose.connect(`mongodb://localhost/${process.env.MONGODB_DATABASE}`).then(() => {
  app.listen(3000, () => {
    console.log('App listening on port 3000')
  })
}).catch(err => {
  console.log(err);
})
