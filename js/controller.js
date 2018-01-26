var app = angular.module('seeder', []);
app.controller('controller', function ($http, $scope, $q) {

    self = this;

    self.api_key = 'da96e3ab015d4342ba1c5f744eccb43ed59abddf4cc948bfb3a99794fd8ca9cf';

    var notFound = [];

    var example = "Dani\t#20Y8QCJC\nRober    #Q2YYJGLU";
    self.players = example;
    self.playersArray = null;
    self.result = '';

    self.calculate = function () {
        self.playersArray = parseInput(self.players);
        self.result = 'Calculando...';
        fetchTrophies(self.playersArray)
            .then(success, error);
    }

    function success(response) {
        var data = response.data || joinData(response);
        var results = [];
        self.result = 'Cargando...';

        data.forEach(player => {
            results.push({
                name: self.playersArray.find(p => humanError(p.id) == humanError(player.tag)).name,
                tag: player.tag,
                trophies: player.trophies
            })
        });

        results.sort((a, b) => b.trophies - a.trophies);

        var result = '';
        results.forEach(player => result += player.name + '\t' + player.tag + '\t' + player.trophies + '\n');
        self.result = result;
        return result;
    }

    function joinData(array) {
        let data = [];

        array.forEach(r => data = data.concat(r.data));

        return data;
    }

    function error(response) {
        self.result = 'Ha ocurrido un error.'
    }

    function parseInput() {
        var array = [];
        var regex = /^(.*?)\s*\#?(\w+)$/
        var lines = self.players.split('\n');

        lines.forEach(l => {
            let m = regex.exec(l);
            array.push({ name: m[1], id: humanError(m[2]) });
        });

        return array;
    }

    function humanError(l) {
        return l
            .replace('B', '8')
            .replace('O', '0')
            .toUpperCase();
    }

    function fetchTrophies(players) {
        var array = players.chunk(35);

        if (array.length === 1) {
            return fetchData(players.map(p => p.id));
        } else {
            let promises = [];
            array.forEach(arr => {
                promises.push(fetchData(arr.map(p => p.id)));
            })

            return $q.all(promises);
        }
    }

    function fetchData(id) {
        var str = id.toString();
        var url = 'http://api.cr-api.com/player/' + str;
        return $http({
            method: 'GET',
            url: url,
            headers: {
                'auth': self.api_key
            }
        });
    }

});

Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize) {
        var array = this;
        return [].concat.apply([],
            array.map(function (elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    }
});
