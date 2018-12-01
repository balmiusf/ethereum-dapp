App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,

     init: function() {
          return App.initWeb3();
     },

     initWeb3: function() {
          // init web3
          if (typeof web3 !== 'undefined')
          {
            // re use provider of the web3 object injected by metamask
              App.web3Provider = web3.currentProvider;
          }
          else
          {
              // create a new provider and plug it directly into local node
              App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          }

          web3 = new Web3(App.web3Provider);
          App.displayAccountInformation();

          return App.initContract();
     },

     initContract: function() {
          $.getJSON('ChainList.json', function(chainListArtifact) {
            //get contract artifacgt and use it to init a truffle contradct abstraction
            App.contracts.ChainList = TruffleContract(chainListArtifact);

            // connect contract to provider
            App.contracts.ChainList.setProvider(App.web3Provider);

            // listen to events
            App.listenToEvents();

            // retrieve article from the contracts
            return App.reloadArticles();
          });
     },

     reloadArticles: function(){

      if(App.loading) {
        return;
      }

      App.loading = true;

       // refresh account information because balance could have changed
       App.displayAccountInformation();

      var chainListInstance;


      App.contracts.ChainList.deployed().then(function(instance) {
        chainListInstance = instance;
        return chainListInstance.getArticlesForSale();
      }).then(function(data) {

        // retrieve article placeholder and clear it
        $('#articlesRow').empty();

        for(var i = 0; i < data.length; i++)
        {
          var articleId = data[i];
          chainListInstance.articles(articleId.toNumber()).then(function(article) {
            // article[2] is skipped because it is the buyer
            App.displayArticle(
              article[0],
              article[1],
              article[3],
              article[4],
              article[5]);
          });
        }

        App.loading = false;

      }).catch(function(err) {
        console.log(err.message);
        App.loading = false;
      });
     },


     displayArticle: function(id, seller, name, description, price) {
       var articlesRow = $('#articlesRow');
       var priceInEther = web3.fromWei(price, "ether");
       var articleTemplate = $('#articleTemplate');
       articleTemplate.find('.panel-title').text(name);
       articleTemplate.find('.article-description').text(description);
       articleTemplate.find('.article-price').text(priceInEther + " ETH");
       articleTemplate.find('.btn-buy').attr('data-id');
       articleTemplate.find('.btn-buy').attr('data-value', priceInEther);

       // check if seller of article is currently connected
       if(seller == App.account)
       {
         articleTemplate.find('.article-seller').text('You');
         articleTemplate.find('.btn-buy').hide();
       } else {
         articleTemplate.find('.article-seller').text(seller);
         articleTemplate.find('.btn-buy').show();
       }

       articlesRow.append(articleTemplate.html());

     },

     displayAccountInformation: function() {
       web3.eth.getCoinbase(function(err, account) {
       if(err === null)
       {
         App.account = account;
         $('#account').text(account);
         web3.eth.getBalance(account, function(err, balance) {
           if(err === null)
           {
             $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
           }
         });
       }
     });
   },

   sellArticle: function () {
      // retrieve the values of  the article
      var _article_name = $('#article_name').val();
      var _description = $('#article_description').val();
      var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether"); // no value then default to 0

      if((_article_name.trim() == '') || (_price) == 0)
      {
        // nothing to sell
        return false;
      }

      App.contracts.ChainList.deployed().then(function(instance) {
        return instance.sellArticle(_article_name, _description, _price, {
          from: App.account,
          gas: 1000000
        });
      }).then(function(result) {
      }).catch(function(error) {
        console.log(error);
      });
   },

   listenToEvents: function() {
     App.contracts.ChainList.deployed().then(function(instance) {
       instance.logSellArticle({}, {}).watch(function(error, event) {
         if (!error) { // event is received without errors
           // li -> list item
           $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale </li>')
         } else {
           console.log(error);
         }
         App.reloadArticles();
       });

       instance.logBuyArticle({}, {}).watch(function(error, event) {
         if (!error) { // event is received without errors
           // li -> list item
           $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name+' </li>')
         } else {
           console.log(error);
         }
         App.reloadArticles();
       });

     });
   },

   buyArticle: function() {
     event.preventDefault();

     // good ol' jquery
     var _articleId = $(event.target).data('id');
     var _price = parseFloat($(event.target).data('value'));

     App.contracts.ChainList.deployed().then(function(instance) {
       return instance.buyArticle(_articleId, {
         from: App.account,
         value: web3.toWei(_price, "ether"),
         gas: 500000
       })
     }).catch(function(error) {
       console.log(error);
     });

   }
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
