const ZANITH_CONFIG = {
  S_ID: 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6cXBYVVhlTDY1MnlCMlp0UzhjTE1DNURUV1MzSWRKTDFGM1pqb1phakR0a3pyTWpBc2VuU2hfdmtQVEFZb3RNbk8vZXhlYw==',
  READ_KEY: 'Zanith2026',
  SHOP_NAME: 'Zanith Crafted Studio'
};

function getAppScriptUrl() {
  return "https://script.google.com/macros/s/" + atob(ZANITH_CONFIG.S_ID) + "/exec";
}
