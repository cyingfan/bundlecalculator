var BundleCalculator = BundleCalculator || {};

BundleCalculator.targetAmountElement = null;
BundleCalculator.unitPrecisionElement = null;


BundleCalculator.getUnitCount = function() {
    return parseInt(parseFloat(this.targetAmountElement.val()) / parseFloat(this.unitPrecisionElement.val()));
};

BundleCalculator._gcd = function(a, b) {
    if (!a) return b;
    if (!b) return a;

    while (1) {
        a%= b;
        if (!a) return b;
        b%= a;
        if (!b) return a;
    }
};

BundleCalculator.gcd = function() {
    var res = this._gcd(arguments[0], arguments[1]);
    for (var i = 2; i < arguments.length; i++) {
        res = this._gcd(res, arguments[i]);
    }
    return res;
};


BundleCalculator.getAllCombos = function() {
    var developerPortion = 1;
    var charityPortion = 1;
    var humblePortion = 1;

    var combos = {};
    var comboKey = "";
    var gcd = 1;
    var dp = 1;
    var cp = 1;
    var hp = 1;

    for (; developerPortion + charityPortion + humblePortion <= this.getUnitCount(); developerPortion++) {
        for (; developerPortion + charityPortion + humblePortion <= this.getUnitCount(); charityPortion++ ) {
            for (; developerPortion + charityPortion + humblePortion <= this.getUnitCount(); humblePortion++ ) {

                if (developerPortion + charityPortion + humblePortion != this.getUnitCount()) continue;

                dp = developerPortion;
                cp = charityPortion;
                hp = humblePortion;
                gcd = this.gcd(developerPortion, charityPortion, humblePortion);
                if (gcd > 1) {
                    dp /= gcd;
                    cp /= gcd;
                    hp /= gcd;
                }

                comboKey = dp + "," + cp + "," + hp;
                combos[comboKey] = [dp, cp, hp];
            }
            humblePortion = 1;
        }
        charityPortion = 1;
    }

    return combos;
};

BundleCalculator.filter = function(combo) {
    return (combo[1] >= combo[0] && combo[1] >= combo[2] && combo[0] >= combo[2]);
};

BundleCalculator.renderResults = function(combos) {
    var resultsDiv = $('div.results');
    resultsDiv.find('div.result-entry').remove();
    for (var key in combos) {
        var combo = combos[key];

        if (!this.filter(combo)) continue;

        var total = combo[0] + combo[1] + combo[2];
        resultsDiv.append(" \
            <div class='row result-entry'>\
                <div class='medium-4 columns'>\
                    $" + (parseFloat(this.targetAmountElement.val()) * combo[0] / total) + " (" + combo[0] + ") \
                </div>\
                <div class='medium-4 columns'>\
                    $" + (parseFloat(this.targetAmountElement.val()) * combo[1] / total) + " (" + combo[1] + ") \
                </div>\
                <div class='medium-4 columns'>\
                    $" + (parseFloat(this.targetAmountElement.val()) * combo[2] / total) + " (" + combo[2] + ") \
                </div>\
            </div>\
        ");
    }
};

BundleCalculator.bindChanges = function () {
    this.targetAmountElement.change(function () {
        console.log("target changed");
        this.renderResults(this.getAllCombos());
    }.bind(this));

    this.unitPrecisionElement.change(function () {
        console.log("unit changed");
        this.renderResults(this.getAllCombos());
    }.bind(this));
};

BundleCalculator.init = function() {
    this.targetAmountElement = $('#target-amount');
    this.unitPrecisionElement = $('#unit-precision');
    this.getUnitCount();
    this.bindChanges();
    this.renderResults(this.getAllCombos());
};

$(function() {
    BundleCalculator.init();
});
