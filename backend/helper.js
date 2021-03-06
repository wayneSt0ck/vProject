var config = {
  development: {
      //url to be used in link generation
      url: 'http://my.site.com',
      //mongodb connection settings
      database: {
          username:   'test',
          password:   'test',
      },
      //server details
      mqtt: {
          username: 'test',
          password: 'test',
          admin: 'test'
      }
  },
  production: {
      //url to be used in link generation
      url: 'http://my.site.com',
      //mongodb connection settings
      database: {
          host: '127.0.0.1',
          port: '27017',
          db:     'site'
      },
      //server details
      server: {
          host:   '127.0.0.1',
          port:   '3421'
      }
  }
  };
  module.exports = config;
