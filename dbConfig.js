module.exports = {
    HOST: "184.168.125.140",
    USER: "sweetand_spice_user",
    PASSWORD: "x31748Amit$",
    DB: "sweetand_spice_db",
    dialect: "mysql",
    pool: {//pool configuration
      max: 5,//maximum number of connection in pool
      min: 0,//minimum number of connection in pool
      acquire: 30000,//maximum time in ms that pool will try to get connection before throwing error
      idle: 10000//maximum time in ms, that a connection can be idle before being released
    }
  };