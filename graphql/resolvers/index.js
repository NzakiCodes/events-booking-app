const bcrypt = require('bcryptjs');

const Event = require('../..//models/events');
const User = require('../../models/users');

const events = eventsIds => {
    return Event.find({ _id: { $in: eventsIds } })
      .then(events => {
        return events.map(event => {
          return {
            ...event._doc,
            _id: event.id,
            date: new Date(event.date).toISOString(),
            creator: user.bind(this, event.creator)
          }
        })
      }).catch(err => { throw err; })
  };
  
  const user = async userId => {
    try {
          const user = await User.findById(userId);
          return {
              ...user._doc,
              _id: user.id.toString(),
              createdEvents: events.bind(this, user._doc.createdEvents)
          };
      }
      catch (err) {
          throw err;
      }
  };

module.exports = {
    events: async () => {
        try {
            const events = await Event
                .find();
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event._doc._id.toString(),
                    date: new Date(event.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    createEvent: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5f0c2a1f3d3f781a84a64b94'
        });
        let createdEvent;
        return event
            .save()
            .then(result => {
                createdEvent = {
                    ...result._doc,
                    _id: result._doc._id.toString(),
                    date: new Date(result.date).toISOString(),
                    creator: user.bind(this, result._doc.creator)
                };
                return User.findById('5f0c2a1f3d3f781a84a64b94')

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
    createUser: async args => {
        const user = await User.findOne({ email: args.userInput.email });
        if (user) {
            throw new Error('User exits already');
        }
        try {
            const hashedPassword = await bcrypt
                .hash(args.userInput.password, 12);
            const user_1 = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user_1.save();
            return { ...result._doc, password: null, _id: result.id };
        }
        catch (err) {
            throw err;
        }

    }
};