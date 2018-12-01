module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },

          chainskills: {
            host: "localhost",
            port: 8545,
            network_id: "4224",
            gas: 4700000,
            from: '0xe70c304884cd959458db96fda4de26f4073daa4b'  // state from which accounts contracts are dpeloyed
          }
     }
};
