const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(`./.env`) });
const [, dbParams] = process.env.DATABASE_URI.split('://');
const [creds,hostdb] = dbParams.split('@')
const [user,password] = creds.split(':')
const [hostPort,dbname] = hostdb.split('/')
const [host,port] = hostPort.split(':')

const dbConfig = {
  dialect: 'postgresql',
  username: user,
  database: dbname,
  password: password,
  port: port,
  operatorsAliases: 0,
  host: host || '127.0.0.1',
  logging: console.log,
  define: {
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 2,
    idle: 20000,
    acquire: 20000,
  },
  use_env_variable: 'DBHOST',
  dialectOptions: {
    //ssl: true
  },
  // timezone: 'UTC',
};

const run = async () => {
  // Checks migrations and run them if they are not already applied. To keep
  // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
  // will be automatically created (if it doesn't exist already) and parsed.
  let sequelize
  try {
    sequelize = new Sequelize(dbConfig);

    const umzug = new Umzug({
      migrations: { glob: 'migrations/*.js' },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });

    await umzug.up();

    process.exit(0);
  } catch (error) {
    console.error('ERRRRRRRR', error);
    //await umzug.down()

    await sequelize.close();

    process.exit(1);
  }
};

run();
