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

BundleCalculator.ratioToDollar = function(ratio, total) {
    return Math.round(100 * parseFloat(this.targetAmountElement.val()) * ratio / total) / 100;
};

BundleCalculator.renderResults = function(combos) {
    var resultsDiv = $('tbody.results');
    resultsDiv.empty();
    for (var key in combos) {
        var combo = combos[key];

        if (!this.filter(combo)) continue;

        var total = combo[0] + combo[1] + combo[2];
        resultsDiv.append(" \
            <tr>\
                <td>\
                    $" + this.ratioToDollar(combo[0], total) + " (" + combo[0] + ") \
                </td>\
                 <td>\
                    $" + this.ratioToDollar(combo[1], total) + " (" + combo[1] + ") \
                </td>\
                 <td>\
                    $" + this.ratioToDollar(combo[2], total) + " (" + combo[2] + ") \
                </div>\
            </tr>\
        ");
    }
};

BundleCalculator.getGoldenRatio = function() {
    var target = this.targetAmountElement.val();
    var phi = 1.6180339887498948482;

    var cp = target / phi;
    var balance = target - cp;
    var dp = balance / phi;
    var hp = balance - dp;

    var result = {};
    var comboKey = dp + "," + cp + "," + hp;
    result[comboKey] = [dp, cp, hp];
    return result;
};

BundleCalculator.bindChanges = function () {
    this.targetAmountElement.on('keyup change', function () {
        console.log("target changed");
        this.renderResults(this.getAllCombos());
    }.bind(this));

    this.unitPrecisionElement.on('keyup change', function () {
        console.log("unit changed");
        this.renderResults(this.getAllCombos());
    }.bind(this));

    $('button.quick-result').click(function(e) {
        var clicked_button = e.currentTarget.value;

        e.preventDefault();

        var combos;
        if (clicked_button == "golden_ratio") {
            combos = this.getGoldenRatio();
        }
        if (combos) {
            this.renderResults(combos);
        }
    }.bind(this))
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
