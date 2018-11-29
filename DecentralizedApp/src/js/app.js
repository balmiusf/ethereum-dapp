App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,

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
       // refresh account information because balance could have changed
       App.displayAccountInformation();

       // retrieve article placeholder and clear it
       $('#articlesRow').empty();

      App.contracts.ChainList.deployed().then(function(instance) {
        return instance.getArticle();
      }).then(function(article) {
        // has seller been init?
        var seller = article[0];
        if(seller == 0x0)
        {
          // no article
          return;
        }
        var price = web3.fromWei(article[4], "ether");
        var articleTemplate = $('#articleTemplate');
        articleTemplate.find('.panel-title').text(article[2]);
        articleTemplate.find('.article-description').text(article[3]);
        articleTemplate.find('.article-price').text(price);
        articleTemplate.find('.btn-buy').attr('data-value', price);

        // if the currently connected account is the seller
        if (seller == App.account)
        {
            seller = "You";
        }

        articleTemplate.find('.article-seller').text(seller);

        //buyer
        var buyer = article[1];

        // if the currently connected account is the buyer
        if (buyer == App.account)
        {
          buyer = "You";
        } else if (buyer == 0X0) {
          buyer = "No one yet";
        }

        articleTemplate.find('.article-buyer').text(buyer);

        // if the currently connected account is the seller the buy button
        // should be hidden
        // if the article is already sold, then the buy button should be hidden
        if(article[0] == App.account || article[1] != 0X0) {
          articleTemplate.find('.btn-buy').hide();
        } else {
          articleTemplate.find('.btn-buy').show();
        }

        $('#articlesRow').append(articleTemplate.html());
      }).catch(function(err) {
        console.log(err.message);
      });
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
          gas: 500000
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
     var _price = parseFloat($(event.target).data('value'));

     App.contracts.ChainList.deployed().then(function(instance) {
       return instance.buyArticle({
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
