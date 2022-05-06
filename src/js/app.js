const PROIVDER_URL = 'http://172.25.96.1:7545/';
function formatCandidate(arr) {
  return {
    id: arr[0].c[0],
    name: arr[1],
    voteCount: arr[2].c[0],
  }
};

App = {
  web3Provider: null,
  contracts: {},
  init: async function () {
    await App.initWeb3();

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.Election.deployed().then(async function (instance) {
        const adoptionInstance = instance;
        let candidates = [];
        for (i = 1; i < 5; i++) {
          const candidate = adoptionInstance.candidates.call(i, { from: account });
          candidates.push(candidate);
        }
        return Promise.all(candidates);
      }).then(function (encodedCandidates) {
        return encodedCandidates.map((candidate) => formatCandidate(candidate))
      }).then(
        function (candidates) {
          const petsRow = $('#petsRow');
          const petTemplate = $('#petTemplate');
          candidates.forEach((candidate) => {
            petTemplate.find('.panel-title').text(candidate.name);
            petTemplate.find('.vote-count').text(candidate.voteCount);
            petTemplate.find('.btn-adopt').attr('data-id', candidate.id);
    
            petsRow.append(petTemplate.html());
          });
        }
      ).catch(function (err) {
        console.log(err.message);
      })
    });
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(PROIVDER_URL);
    }
    web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function () {
    $.getJSON('Election.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var artifact = data;
      App.contracts.Election = TruffleContract(artifact);

      // Set the provider for our contract
      App.contracts.Election.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      //return App.markAdopted();
    });


    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleClick);
  },

  handleClick: function (event) {
    event.preventDefault();
    $('.btn-adopt').attr('disabled',true);

    var id = parseInt($(event.target).data('id'));
    var adoptionInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Election.deployed().then(function (instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.vote(id, { from: account });
      }).then(function (result) {
        return App.updateUI();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },
  updateUI: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.Election.deployed().then(async function (instance) {
        const adoptionInstance = instance;
        let candidates = [];
        for (i = 1; i < 5; i++) {
          const candidate = adoptionInstance.candidates.call(i, { from: account });
          candidates.push(candidate);
        }
        return Promise.all(candidates);
      }).then(function (encodedCandidates) {
        return encodedCandidates.map((candidate) => formatCandidate(candidate))
      }).then(
        function (candidates) {
          candidates.forEach((candidate) => {
            $('.panel-pet').eq(candidate.id - 1).find('.vote-count').text(candidate.voteCount);
          });
        }
      ).catch(function (err) {
        console.log(err.message);
      })
    });

  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
