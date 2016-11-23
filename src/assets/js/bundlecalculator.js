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

BundleCalculator.sortKeys = function(combos) {
    var comboKeys = Object.keys(combos);
    comboKeys.sort(function(a, b){
        var aParts = a.split(",");
        var bParts = b.split(",");

        var diff0 = parseInt(bParts[0]) - parseInt(aParts[0]);
        if (diff0 != 0) {
            return diff0;
        }
        var diff1 = parseInt(bParts[1]) - parseInt(aParts[1]);
        if (diff1 != 0) {
            return diff1;
        }

        return parseInt(bParts[2]) - parseInt(aParts[2]);
    });
    return comboKeys;
};

BundleCalculator.getAllCombos = function() {
    var portion_1 = 1;
    var portion_2 = 1;
    var portion_3 = 1;

    var combos = {};
    var comboKey = "";
    var entry;
    var gcd = 1;
    var p1 = 1;
    var p2 = 1;
    var p3 = 1;

    for (; portion_1 + portion_2 + portion_3 <= this.getUnitCount(); portion_1++) {
        for (; portion_1 + portion_2 + portion_3 <= this.getUnitCount(); portion_2++ ) {
            for (; portion_1 + portion_2 + portion_3 <= this.getUnitCount(); portion_3++ ) {

                if (portion_1 + portion_2 + portion_3 != this.getUnitCount()) continue;

                p1 = portion_1;
                p2 = portion_2;
                p3 = portion_3;
                gcd = this.gcd(portion_1, portion_2, portion_3);
                if (gcd > 1) {
                    p1 /= gcd;
                    p2 /= gcd;
                    p3 /= gcd;
                }

                entry = [p1, p2, p3].sort();
                comboKey = entry[0] + "," + entry[1] + "," + entry[2];
                combos[comboKey] = entry;
            }
            portion_3 = 1;
        }
        portion_2 = 1;
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
    var sortKeys = this.sortKeys(combos);
    for (var i in sortKeys) {
        var key = sortKeys[i];
        var combo = combos[key];

        /*
            Pending for querybuilder.js.org
         */
        // if (!this.filter(combo)) continue;

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

    var p1 = target / phi;
    var balance = target - p1;
    var p2 = balance / phi;
    var p3 = balance - p2;

    var result = {};
    var comboKey = p1 + "," + p2 + "," + p3;
    result[comboKey] = [p1, p2, p3];
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
