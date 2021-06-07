const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  'dialect': 'sqlite',
  'storage': 'development.db',
});

const { Model } = require('sequelize');

class Task extends Model {}

(async () => {
  // creates requirement props for each field passed in
  function makeRequireOptions(...fields) {
    // takes an array of field names and returns an object
    return fields.reduce((option, prop) => {
      const msg = `${prop[0].toUpperCase() + prop.slice(1)} must have a value`;
      // adds field to the object as a property, adds validators/contraints
      option[prop] = {
        allowNull: false,
        validate: {
          notNull: {
            msg,
          },
          notEmpty: {
            msg,
          },
        },
      };
      return option;
    }, {});
  }

  const requiredOptions = makeRequireOptions('user', 'task');

  await Task.init(
    {
      user: { type: Sequelize.DataTypes.STRING, ...requiredOptions.user },
      task: { type: Sequelize.DataTypes.STRING, ...requiredOptions.task },
      finished: { type: Sequelize.DataTypes.BOOLEAN },
    },
    { sequelize },
  );
  try {
    await sequelize.authenticate();
    console.log('Connection has been established');
    try {
      await sequelize.sync({ force: true });
      console.log('Sync succeeded');
    } catch (err) {
      console.log("Database couldn't be synced", err);
    }
  } catch (err) {
    console.log("Database couldn't be authenticated.", err);
  }
})();

module.exports = { sequelize, Task };
